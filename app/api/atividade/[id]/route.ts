import { NextRequest, NextResponse } from 'next/server'

const EDUSP_API_URL = process.env.EDUSP_API_URL || 'https://edusp-api.ip.tv'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const xApiKey = req.headers.get('x-api-key')
    if (!xApiKey) {
      return NextResponse.json(
        { error: 'x-api-key não fornecido' },
        { status: 401 }
      )
    }

    const answerId = params.id
    const { searchParams } = new URL(req.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId não fornecido' },
        { status: 400 }
      )
    }

    const url = `${EDUSP_API_URL}/tms/task/${taskId}/answer/${answerId}?with_task=true&with_genre=true&with_questions=true&with_assessed_skills=true`

    const res = await fetch(url, {
      method: 'GET',
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
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Erro ao buscar detalhes da atividade' },
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
