export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      produtoras: {
        Row: {
          id: string
          nome: string
          documento: string | null
          email: string | null
          email_contato: string | null
          telefone: string | null
          ativo: boolean
          criado_em: string
        }
        Insert: {
          id?: string
          nome: string
          documento?: string | null
          email?: string | null
          email_contato?: string | null
          telefone?: string | null
          ativo?: boolean
          criado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          documento?: string | null
          email?: string | null
          email_contato?: string | null
          telefone?: string | null
          ativo?: boolean
          criado_em?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          email: string
          role: 'super_admin' | 'produtora_admin' | 'produtora_staff' | 'grupo_responsavel' | 'jurado' | 'operador'
          nome: string | null
          produtora_id: string | null
          grupo_id: string | null
          ativo: boolean
          criado_em: string
        }
        Insert: {
          id: string
          email: string
          role: 'super_admin' | 'produtora_admin' | 'produtora_staff' | 'grupo_responsavel' | 'jurado' | 'operador'
          nome?: string | null
          produtora_id?: string | null
          grupo_id?: string | null
          ativo?: boolean
          criado_em?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'super_admin' | 'produtora_admin' | 'produtora_staff' | 'grupo_responsavel' | 'jurado' | 'operador'
          nome?: string | null
          produtora_id?: string | null
          grupo_id?: string | null
          ativo?: boolean
          criado_em?: string
        }
      }
      eventos: {
        Row: {
          id: string
          nome: string
          slug: string
          descricao: string | null
          data_inicio: string | null
          data_fim: string | null
          status: 'rascunho' | 'publicado' | 'encerrado'
          produtora_id: string
          perfil_id: string | null
          criado_em: string
        }
        Insert: {
          id?: string
          nome: string
          slug: string
          descricao?: string | null
          data_inicio?: string | null
          data_fim?: string | null
          status?: 'rascunho' | 'publicado' | 'encerrado'
          produtora_id: string
          perfil_id?: string | null
          criado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          slug?: string
          descricao?: string | null
          data_inicio?: string | null
          data_fim?: string | null
          status?: 'rascunho' | 'publicado' | 'encerrado'
          produtora_id?: string
          perfil_id?: string | null
          criado_em?: string
        }
      }
      grupos: {
        Row: {
          id: string
          nome: string
          documento: string | null
          email: string
          email_contato: string | null
          cidade: string | null
          estado: string | null
          produtora_id: string | null
          criado_em: string
        }
        Insert: {
          id?: string
          nome: string
          documento?: string | null
          email: string
          email_contato?: string | null
          cidade?: string | null
          estado?: string | null
          produtora_id?: string | null
          criado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          documento?: string | null
          email?: string
          email_contato?: string | null
          cidade?: string | null
          estado?: string | null
          produtora_id?: string | null
          criado_em?: string
        }
      }
      inscricoes_grupo_evento: {
        Row: {
          id: string
          evento_id: string
          grupo_id: string
          produtora_id: string
          status: 'pendente' | 'confirmado' | 'cancelado'
          origem: 'auto' | 'convite' | 'admin'
          data_inscricao: string
        }
        Insert: {
          id?: string
          evento_id: string
          grupo_id: string
          produtora_id: string
          status?: 'pendente' | 'confirmado' | 'cancelado'
          origem?: 'auto' | 'convite' | 'admin'
          data_inscricao?: string
        }
        Update: {
          id?: string
          evento_id?: string
          grupo_id?: string
          produtora_id?: string
          status?: 'pendente' | 'confirmado' | 'cancelado'
          origem?: 'auto' | 'convite' | 'admin'
          data_inscricao?: string
        }
      }
      participantes: {
        Row: {
          id: string
          nome: string
          data_nascimento: string
          documento: string | null
          grupo_id: string | null
          produtora_id: string | null
          confirmado_vinculo: boolean
          termo_assinado: boolean
          criado_em: string
        }
        Insert: {
          id?: string
          nome: string
          data_nascimento: string
          documento?: string | null
          grupo_id?: string | null
          produtora_id?: string | null
          confirmado_vinculo?: boolean
          termo_assinado?: boolean
          criado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          data_nascimento?: string
          documento?: string | null
          grupo_id?: string | null
          produtora_id?: string | null
          confirmado_vinculo?: boolean
          termo_assinado?: boolean
          criado_em?: string
        }
      }
      apresentacoes: {
        Row: {
          id: string
          nome: string
          evento_id: string
          grupo_id: string
          categoria_id: string | null
          tipo: 'solo' | 'duo' | 'conjunto'
          ordem_apresentacao: number | null
          status_audio: 'pendente' | 'enviado' | 'aprovado'
          criado_em: string
        }
        Insert: {
          id?: string
          nome: string
          evento_id: string
          grupo_id: string
          categoria_id?: string | null
          tipo?: 'solo' | 'duo' | 'conjunto'
          ordem_apresentacao?: number | null
          status_audio?: 'pendente' | 'enviado' | 'aprovado'
          criado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          evento_id?: string
          grupo_id?: string
          categoria_id?: string | null
          tipo?: 'solo' | 'duo' | 'conjunto'
          ordem_apresentacao?: number | null
          status_audio?: 'pendente' | 'enviado' | 'aprovado'
          criado_em?: string
        }
      }
      avaliacoes: {
        Row: {
          id: string
          apresentacao_id: string
          criterio_id: string
          jurado_id: string
          nota: number
          sincronizado: boolean
          criado_em: string
        }
        Insert: {
          id?: string
          apresentacao_id: string
          criterio_id: string
          jurado_id: string
          nota: number
          sincronizado?: boolean
          criado_em?: string
        }
        Update: {
          id?: string
          apresentacao_id?: string
          criterio_id?: string
          jurado_id?: string
          nota?: number
          sincronizado?: boolean
          criado_em?: string
        }
      }
      pdv_vendas: {
        Row: {
          id: string
          operador_id: string
          total: number
          forma_pagamento: string
          itens: Json
          sincronizado: boolean
          criado_em: string
        }
        Insert: {
          id?: string
          operador_id?: string
          total?: number
          forma_pagamento: string
          itens?: Json
          sincronizado?: boolean
          criado_em?: string
        }
        Update: {
          id?: string
          operador_id?: string
          total?: number
          forma_pagamento?: string
          itens?: Json
          sincronizado?: boolean
          criado_em?: string
        }
      }
    }
    Views: {}
    Functions: {
      get_meu_role: { Returns: string }
      get_minha_produtora_id: { Returns: string }
    }
    Enums: {}
  }
}