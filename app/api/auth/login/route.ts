import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'https://sedintegracoes.educacao.sp.gov.br/saladofuturobffapi'
const OCP_KEY = process.env.OCP_APIM_SUBSCRIPTION_KEY || 'd701a2043aa24d7ebb37e9adf60d043b'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user, senha } = body

    // 1. Fazer login na Sala do Futuro
    const loginRes = await fetch(`${API_BASE_URL}/credenciais/api/LoginCompletoToken`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'pt-BR',
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': OCP_KEY,
        'Origin': 'https://saladofuturo.educacao.sp.gov.br',
        'Referer': 'https://saladofuturo.educacao.sp.gov.br/',
        'X-Product-Name': 'SalaDoFuturo',
      },
      body: JSON.stringify({ user, senha }),
    })

    if (!loginRes.ok) {
      return NextResponse.json(
        { error: 'Login falhou' },
        { status: 401 }
      )
    }

    const loginData = await loginRes.json()

    // 2. Extrair token JWT do login
    const token = loginData.token || loginData.access_token || loginData

    // 3. Decodificar token para pegar dados do usuário
    let userData = {}
    let nick = ''
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      userData = {
        name: payload.NAME || payload.name || '',
        email: payload.EMAIL || payload.email || '',
        nick: payload.NICKNAME || payload.nick || '',
        cd_usuario: payload.CD_USUARIO || payload.cd_usuario || '',
        login: payload.LOGIN || payload.login || '',
      }
      nick = payload.NICKNAME || payload.nick || ''
    } catch {
      // Se não conseguir decodificar, continua
    }

    // 4. Gerar x-api-key (token JWT do EDUSP)
    // Na prática, isso pode vir de outra API ou ser o próprio token
    const xApiKey = token

    return NextResponse.json({
      token,
      xApiKey,
      user: userData,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}
