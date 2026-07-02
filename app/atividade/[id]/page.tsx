'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Check, X } from 'lucide-react'

interface Question {
  id: string;
  title: string;
  description: string | null;
}

interface AtividadeDetalhe {
  id: string;
  task_id: string;
  status: string;
  revised: boolean;
  pending_agreement: boolean;
  result_score: number | null;
  task: {
    title: string;
    description: string | null;
  };
  questions?: Question[];
}

export default function AtividadeDetalhePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = searchParams.get('taskId')
  const answerId = params.id

  const [detalhe, setDetalhe] = useState<AtividadeDetalhe | null>(null)
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    const xApiKey = localStorage.getItem('peppers_x_api_key')
    if (!xApiKey) {
      router.push('/login')
      return
    }

    async function loadDetalhe() {
      try {
        const res = await fetch(`/api/atividade/${answerId}?taskId=${taskId}`, {
          headers: {
            'x-api-key': xApiKey,
          },
        })
        if (res.ok) {
          const data = await res.json()
          setDetalhe(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (taskId) {
      loadDetalhe()
    } else {
      setLoading(false)
    }
  }, [router, answerId, taskId])

  async function handleAgreement(agreed: boolean) {
    const xApiKey = localStorage.getItem('peppers_x_api_key')
    if (!xApiKey || !taskId || !detalhe?.questions || detalhe.questions.length === 0) return

    // Pega o primeiro questionId (geralmente é a pergunta de agreement)
    const questionId = detalhe.questions[0].id

    setEnviando(true)
    try {
      const res = await fetch('/api/agreement', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': xApiKey,
        },
        body: JSON.stringify({
          taskId,
          questionId,
          answerId,
          agreed,
        }),
      })

      if (res.ok) {
        setSucesso(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        alert('Erro ao enviar resposta')
      }
    } catch (err) {
      alert('Erro ao enviar resposta')
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return <div className="loading">Carregando...</div>
  }

  return (
    <div className="container">
      <button className="back-btn" onClick={() => router.push('/dashboard')}>
        <ArrowLeft size={18} />
        Voltar
      </button>

      <div className="atividade-detalhe">
        <h2>{detalhe?.task?.title || 'Confirmação de Correção'}</h2>
        <p className="desc">
          {detalhe?.task?.description || 'Esta atividade está em correção. Por favor, confirme se você concorda com a avaliação realizada.'}
        </p>

        {sucesso ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#22c55e' }}>
            <Check size={48} />
            <p style={{ marginTop: '16px', fontSize: '18px' }}>
              Resposta enviada com sucesso!
            </p>
          </div>
        ) : (
          <div className="pergunta-box">
            <h3>Você concorda com a correção desta atividade?</h3>
            <p>
              Ao confirmar, você está declarando que revisou a correção e
              concorda com o feedback fornecido pelo professor.
            </p>

            <div className="checkbox-group">
              <button
                className="checkbox-option selected-sim"
                onClick={() => handleAgreement(true)}
                disabled={enviando}
              >
                <Check size={20} />
                {enviando ? 'Enviando...' : 'Sim, concordo'}
              </button>

              <button
                className="checkbox-option selected-nao"
                onClick={() => handleAgreement(false)}
                disabled={enviando}
              >
                <X size={20} />
                Não concordo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
