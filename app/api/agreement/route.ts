import { NextRequest, NextResponse } from 'next/server'

const EDUSP_API_URL = process.env.EDUSP_API_URL || 'https://edusp-api.ip.tv'

export async function PUT(req: NextRequest) {
  try {
    const xApiKey = req.headers.get('x-api-key')
    if (!xApiKey) {
      return NextResponse.json(
        { error: 'x-api-key não fornecido' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { taskId, questionId, answerId, agreed } = body

    if (!taskId || !questionId || !answerId) {
      return NextResponse.json(
        { error: 'Parâmetros incompletos' },
        { status: 400 }
      )
    }

    const url = `${EDUSP_API_URL}/tms/task/${taskId}/question/${questionId}/answer/${answerId}/agreement`

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'accept': 'application/json',
        'accept-language': 'pt-BR',
        'content-type': 'application/json',
        'origin': 'https://saladofuturo.educacao.sp.gov.br',
        'referer': 'https://saladofuturo.educacao.sp.gov.br/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        'x-api-key': xApiKey,
      },
      body: JSON.stringify({ agreed }),
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Erro ao enviar agreement' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}
