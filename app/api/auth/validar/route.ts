import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'https://sedintegracoes.educacao.sp.gov.br/saladofuturobffapi'
const OCP_KEY = process.env.OCP_APIM_SUBSCRIPTION_KEY || 'd701a2043aa24d7ebb37e9adf60d043b'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token } = body

    const res = await fetch(`${API_BASE_URL}/credenciais/api/ValidarToken`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'pt-BR',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Ocp-Apim-Subscription-Key': OCP_KEY,
        'Origin': 'https://saladofuturo.educacao.sp.gov.br',
        'Referer': 'https://saladofuturo.educacao.sp.gov.br/',
        'X-Product-Name': 'SalaDoFuturo',
      },
    })

    if (!res.ok) {
      return NextResponse.json(
        { valid: false },
        { status: 401 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch {
    return NextResponse.json(
      { valid: false },
      { status: 500 }
    )
  }
}
