import { NextRequest, NextResponse } from 'next/server'

const EDUSP_API_URL = process.env.EDUSP_API_URL || 'https://edusp-api.ip.tv'

export async function GET(req: NextRequest) {
  try {
    const xApiKey = req.headers.get('x-api-key')
    if (!xApiKey) {
      return NextResponse.json(
        { error: 'x-api-key não fornecido' },
        { status: 401 }
      )
    }

    // Pegar nick do token (decodificar JWT)
    let nick = ''
    try {
      const payload = JSON.parse(Buffer.from(xApiKey.split('.')[1], 'base64').toString())
      nick = payload.nick || payload.NICKNAME || ''
    } catch {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Publication targets (ajuste conforme necessário)
    const publicationTargets = [
      'r185d22e96ffcf7b0c-l',
      'r2c223fd0ba7b73397-l',
      `r185d22e96ffcf7b0c-l:${nick}`,
      `r2c223fd0ba7b73397-l:${nick}`,
      '1940',
      '1828',
      '1854',
      '767',
    ]

    const params = new URLSearchParams()
    params.set('nick', nick)
    params.set('limit', '100')
    params.set('offset', '0')
    params.set('task_is_exam', 'false')
    params.set('task_is_essay', 'false')

    publicationTargets.forEach(pt => params.append('publication_target', pt))

    const fields = [
      'id', 'obs', 'nick', 'status', 'task_id', 'revised', 'answers', 'duration',
      'created_at', 'updated_at', 'deleted_at', 'accessed_on', 'executed_on',
      'result_score', 'delivered_at', 'invalidated_at', 'publication_target',
      'task.title', 'task.style', 'task.author', 'task.is_exam', 'task.shuffle',
      'task.is_essay', 'task.expire_at', 'task.is_public', 'task.publish_at',
      'task.created_at', 'task.updated_at', 'task.description', 'task.enable_token',
      'task.is_objective', 'task.published_by', 'task.category_ids',
      'task.enable_captcha', 'task.question_count', 'task.is_security_task',
      'task.display_answer_at', 'task.publication_target', 'task.max_execution_time',
      'task.allow_check_answer', 'task.question_invalid_ids', 'pending_agreement'
    ]
    fields.forEach(f => params.append('fields', f))

    params.append('status', 'finished')
    params.append('status', 'submitted')

    const url = `${EDUSP_API_URL}/tms/answer?${params.toString()}`

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
        { error: 'Erro ao buscar atividades' },
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
