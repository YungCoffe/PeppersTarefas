'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckSquare, Square, Send } from 'lucide-react'

interface Atividade {
  id: string;
  task_id: string;
  status: string;
  revised: boolean;
  pending_agreement: boolean;
  result_score: number | null;
  delivered_at: string | null;
  task: {
    title: string;
    description: string | null;
  };
}

export default function DashboardPage() {
  const router = useRouter()
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set())
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('peppers_token')
    const userStr = localStorage.getItem('peppers_user')
    const xApiKey = localStorage.getItem('peppers_x_api_key')

    if (!token || !xApiKey) {
      router.push('/login')
      return
    }

    if (userStr) {
      const user = JSON.parse(userStr)
      setUserName(user.name || user.nick || 'Aluno')
    }

    async function loadAtividades() {
      try {
        const res = await fetch('/api/atividades', {
          headers: { 'x-api-key': xApiKey! },
        })
        if (res.ok) {
          const data = await res.json()
          const items = data.items || []
          setAtividades(items)

          // Auto-seleciona todas que precisam de agreement
          const precisamAgreement = items
            .filter((a: Atividade) => a.pending_agreement)
            .map((a: Atividade) => a.id)
          setSelecionadas(new Set(precisamAgreement))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadAtividades()
  }, [router])

  function handleLogout() {
    localStorage.clear()
    router.push('/login')
  }

  function getStatusBadge(atividade: Atividade) {
    if (atividade.pending_agreement) {
      return <span className="badge badge-em-correcao">Precisa Responder</span>
    }
    if (atividade.revised) {
      return <span className="badge badge-corrigido">Corrigido</span>
    }
    return <span className="badge badge-pendente">Pendente</span>
  }

  function toggleSelecao(id: string) {
    const novo = new Set(selecionadas)
    if (novo.has(id)) {
      novo.delete(id)
    } else {
      novo.add(id)
    }
    setSelecionadas(novo)
  }

  function selecionarTodasComAgreement() {
    const ids = atividades
      .filter(a => a.pending_agreement)
      .map(a => a.id)
    setSelecionadas(new Set(ids))
  }

  function desselecionarTodas() {
    setSelecionadas(new Set())
  }

  async function responderTodas() {
    if (selecionadas.size === 0) return

    const xApiKey = localStorage.getItem('peppers_x_api_key')
    if (!xApiKey) return

    setEnviando(true)
    let respondidas = 0

    for (const atividadeId of selecionadas) {
      const atividade = atividades.find(a => a.id === atividadeId)
      if (!atividade) continue

      try {
        // 1. Buscar detalhe da atividade para pegar questionId
        const detalheRes = await fetch(`/api/atividade/${atividadeId}?taskId=${atividade.task_id}`, {
          headers: { 'x-api-key': xApiKey },
        })

        if (!detalheRes.ok) continue
        const detalhe = await detalheRes.json()
        const questionId = detalhe.questions?.[0]?.id

        if (!questionId) continue

        // 2. Enviar agreement = true (Sim)
        const agreementRes = await fetch('/api/agreement', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': xApiKey,
          },
          body: JSON.stringify({
            taskId: atividade.task_id,
            questionId,
            answerId: atividadeId,
            agreed: true,
          }),
        })

        if (agreementRes.ok) {
          respondidas++
        }
      } catch (err) {
        console.error('Erro ao responder atividade:', atividadeId, err)
      }
    }

    setEnviando(false)

    if (respondidas > 0) {
      setSucesso(true)
      // Atualiza a lista removendo as respondidas
      setAtividades(prev => prev.filter(a => !selecionadas.has(a.id)))
      setSelecionadas(new Set())
      setTimeout(() => setSucesso(false), 3000)
    }
  }

  const atividadesComAgreement = atividades.filter(a => a.pending_agreement)
  const todasSelecionadas = atividadesComAgreement.length > 0 && 
    atividadesComAgreement.every(a => selecionadas.has(a.id))

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>🌶️ Peppers</h1>
          <span className="user-name">Olá, {userName}</span>
        </div>
        <button onClick={handleLogout}>Sair</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="section-title">Atividades Entregues</h2>

        {atividadesComAgreement.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={todasSelecionadas ? desselecionarTodas : selecionarTodasComAgreement}
              style={{
                background: 'transparent',
                border: '1px solid #444',
                color: '#888',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {todasSelecionadas ? <CheckSquare size={16} /> : <Square size={16} />}
              {todasSelecionadas ? 'Desmarcar Todas' : 'Selecionar Todas'}
            </button>

            <button 
              onClick={responderTodas}
              disabled={selecionadas.size === 0 || enviando}
              style={{
                background: selecionadas.size > 0 ? '#22c55e' : '#333',
                border: 'none',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: selecionadas.size > 0 ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: selecionadas.size > 0 ? 1 : 0.5,
              }}
            >
              <Send size={14} />
              {enviando ? 'Enviando...' : `Responder (${selecionadas.size})`}
            </button>
          </div>
        )}
      </div>

      {sucesso && (
        <div style={{
          background: '#22c55e20',
          border: '1px solid #22c55e',
          color: '#22c55e',
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '16px',
          fontSize: '14px',
        }}>
          ✅ Respostas enviadas com sucesso!
        </div>
      )}

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : atividades.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma atividade entregue encontrada.</p>
        </div>
      ) : (
        <div className="atividades-list">
          {atividades.map((a) => (
            <div
              key={a.id}
              className="atividade-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                opacity: a.pending_agreement ? 1 : 0.6,
              }}
            >
              {a.pending_agreement && (
                <div 
                  onClick={() => toggleSelecao(a.id)}
                  style={{ cursor: 'pointer', color: selecionadas.has(a.id) ? '#22c55e' : '#555' }}
                >
                  {selecionadas.has(a.id) ? <CheckSquare size={22} /> : <Square size={22} />}
                </div>
              )}

              {!a.pending_agreement && <div style={{ width: '22px' }} />}

              <div style={{ flex: 1 }}>
                <div className="title">{a.task?.title || 'Atividade sem título'}</div>
                <div className="meta">
                  {getStatusBadge(a)}
                  {a.result_score !== null && (
                    <span>Nota: {a.result_score}</span>
                  )}
                  {a.delivered_at && (
                    <span>
                      Entregue: {new Date(a.delivered_at).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
