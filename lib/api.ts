const EDUSP_API_URL = process.env.EDUSP_API_URL || 'https://edusp-api.ip.tv';
const API_BASE_URL = process.env.API_BASE_URL || 'https://sedintegracoes.educacao.sp.gov.br/saladofuturobffapi';
const OCP_KEY = process.env.OCP_APIM_SUBSCRIPTION_KEY || 'd701a2043aa24d7ebb37e9adf60d043b';

// Headers padrão para API da Sala do Futuro
function getSalaHeaders(token?: string) {
  const headers: Record<string, string> = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'pt-BR',
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': OCP_KEY,
    'Origin': 'https://saladofuturo.educacao.sp.gov.br',
    'Referer': 'https://saladofuturo.educacao.sp.gov.br/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    'X-Product-Name': 'SalaDoFuturo',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Headers padrão para API EDUSP (x-api-key)
function getEduspHeaders(xApiKey: string) {
  return {
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
  };
}

// 1. LOGIN
export async function loginSalaDoFuturo(user: string, senha: string) {
  const res = await fetch(`${API_BASE_URL}/credenciais/api/LoginCompletoToken`, {
    method: 'POST',
    headers: getSalaHeaders(),
    body: JSON.stringify({ user, senha }),
  });
  if (!res.ok) throw new Error('Login falhou');
  return res.json();
}

// 2. VALIDAR TOKEN
export async function validarToken(token: string) {
  const res = await fetch(`${API_BASE_URL}/credenciais/api/ValidarToken`, {
    method: 'POST',
    headers: getSalaHeaders(token),
  });
  if (!res.ok) throw new Error('Token inválido');
  return res.json();
}

// 3. LISTAR ATIVIDADES ENTREGUES
export async function listarAtividades(xApiKey: string, nick: string, publicationTargets: string[]) {
  const params = new URLSearchParams();
  params.set('nick', nick);
  params.set('limit', '100');
  params.set('offset', '0');
  params.set('task_is_exam', 'false');
  params.set('task_is_essay', 'false');

  publicationTargets.forEach(pt => params.append('publication_target', pt));

  const fields = [
    'id','obs','nick','status','task_id','revised','answers','duration',
    'created_at','updated_at','deleted_at','accessed_on','executed_on',
    'result_score','delivered_at','invalidated_at','publication_target',
    'task.title','task.style','task.author','task.is_exam','task.shuffle',
    'task.is_essay','task.expire_at','task.is_public','task.publish_at',
    'task.created_at','task.updated_at','task.description','task.enable_token',
    'task.is_objective','task.published_by','task.category_ids',
    'task.enable_captcha','task.question_count','task.is_security_task',
    'task.display_answer_at','task.publication_target','task.max_execution_time',
    'task.allow_check_answer','task.question_invalid_ids','pending_agreement'
  ];
  fields.forEach(f => params.append('fields', f));

  params.append('status', 'finished');
  params.append('status', 'submitted');

  const url = `${EDUSP_API_URL}/tms/answer?${params.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: getEduspHeaders(xApiKey),
  });
  if (!res.ok) throw new Error('Erro ao listar atividades');
  return res.json();
}

// 4. ENVIAR AGREEMENT (Sim/Não)
export async function enviarAgreement(
  xApiKey: string,
  taskId: string,
  questionId: string,
  answerId: string,
  agreed: boolean
) {
  const url = `${EDUSP_API_URL}/tms/task/${taskId}/question/${questionId}/answer/${answerId}/agreement`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: getEduspHeaders(xApiKey),
    body: JSON.stringify({ agreed }),
  });
  if (!res.ok) throw new Error('Erro ao enviar agreement');
  return res.json();
}
