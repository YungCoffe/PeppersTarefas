export interface LoginPayload {
  user: string;
  senha: string;
}

export interface LoginResponse {
  token?: string;
  [key: string]: any;
}

export interface Atividade {
  id: string;
  task_id: string;
  status: string;
  revised: boolean;
  result_score: number | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  pending_agreement: boolean;
  task: {
    title: string;
    description: string | null;
    style: string | null;
    author: string | null;
    is_exam: boolean;
    is_essay: boolean;
    expire_at: string | null;
    publish_at: string | null;
    category_ids: string[];
    question_count: number;
    publication_target: string;
  };
  answers?: any[];
}

export interface AgreementPayload {
  agreed: boolean;
}

export interface UserData {
  token: string;
  name: string;
  email: string;
  nick: string;
  cd_usuario: string;
}
