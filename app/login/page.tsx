'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [user, setUser] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Fazer login
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, senha }),
      })

      if (!loginRes.ok) {
        throw new Error('Usuário ou senha inválidos')
      }

      const loginData = await loginRes.json()

      // 2. Salvar dados no localStorage
      localStorage.setItem('peppers_token', loginData.token)
      localStorage.setItem('peppers_user', JSON.stringify(loginData.user))
      localStorage.setItem('peppers_x_api_key', loginData.xApiKey)

      // 3. Redirecionar para dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">🌶️ Peppers</h1>
        <p className="login-subtitle">Sala do Futuro - Aluno</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Usuário (RA)</label>
            <input
              type="text"
              placeholder="Ex: 1168136416SP"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </div>
  )
}
