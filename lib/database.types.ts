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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "usuarios_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "participantes_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "eventos_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis_festival"
            referencedColumns: ["id"]
          }
        ]
      }
      categorias: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          evento_id: string | null
          idade_minima: number | null
          idade_maxima: number | null
          criado_em: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          evento_id?: string | null
          idade_minima?: number | null
          idade_maxima?: number | null
          criado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          evento_id?: string | null
          idade_minima?: number | null
          idade_maxima?: number | null
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          }
        ]
      }
      locais_evento: {
        Row: {
          id: string
          nome: string
          endereco: string | null
          cidade: string | null
          estado: string | null
          capacidade: number | null
          criado_em: string
        }
        Insert: {
          id?: string
          nome: string
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          capacidade?: number | null
          criado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          capacidade?: number | null
          criado_em?: string
        }
        Relationships: []
      }
      perfis_festival: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          tipo: 'festival_danca' | 'competicao_rua' | 'outro'
          criado_em: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          tipo?: 'festival_danca' | 'competicao_rua' | 'outro'
          criado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          tipo?: 'festival_danca' | 'competicao_rua' | 'outro'
          criado_em?: string
        }
        Relationships: []
      }
      estilos: {
        Row: {
          id: string
          perfil_id: string
          nome: string
          slug: string
          descricao: string | null
          ativo: boolean
          ordem: number
          criado_em: string
        }
        Insert: {
          id?: string
          perfil_id: string
          nome: string
          slug: string
          descricao?: string | null
          ativo?: boolean
          ordem?: number
          criado_em?: string
        }
        Update: {
          id?: string
          perfil_id?: string
          nome?: string
          slug?: string
          descricao?: string | null
          ativo?: boolean
          ordem?: number
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "estilos_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis_festival"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "inscricoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          }
        ]
      }
      termos_documentos: {
        Row: {
          id: string
          titulo: string
          conteudo: string
          tipo: 'regulamento' | 'autorizacao_imagem' | 'termo_responsabilidade'
          evento_id: string | null
          obrigatorio: boolean
          criado_em: string
        }
        Insert: {
          id?: string
          titulo: string
          conteudo: string
          tipo?: 'regulamento' | 'autorizacao_imagem' | 'termo_responsabilidade'
          evento_id?: string | null
          obrigatorio?: boolean
          criado_em?: string
        }
        Update: {
          id?: string
          titulo?: string
          conteudo?: string
          tipo?: 'regulamento' | 'autorizacao_imagem' | 'termo_responsabilidade'
          evento_id?: string | null
          obrigatorio?: boolean
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "termos_documentos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          }
        ]
      }
      termos_aceites: {
        Row: {
          id: string
          termo_id: string
          participante_id: string
          aceito: boolean
          ip_assinatura: string | null
          data_aceite: string
        }
        Insert: {
          id?: string
          termo_id: string
          participante_id: string
          aceito?: boolean
          ip_assinatura?: string | null
          data_aceite?: string
        }
        Update: {
          id?: string
          tero_id?: string
          participante_id?: string
          aceito?: boolean
          ip_assinatura?: string | null
          data_aceite?: string
        }
        Relationships: [
          {
            foreignKeyName: "termos_aceites_termo_id_fkey"
            columns: ["tero_id"]
            isOneToOne: false
            referencedRelation: "termos_documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "termos_aceites_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes"
            referencedColumns: ["id"]
          }
        ]
      }
      convites: {
        Row: {
          id: string
          email: string
          token: string
          tipo: 'grupo' | 'participante' | 'jurado'
          evento_id: string | null
          produtora_id: string
          status: 'pendente' | 'aceito' | 'expirado'
          data_expiracao: string
          criado_em: string
        }
        Insert: {
          id?: string
          email: string
          token: string
          tipo: 'grupo' | 'participante' | 'jurado'
          evento_id?: string | null
          produtora_id: string
          status?: 'pendente' | 'aceito' | 'expirado'
          data_expiracao: string
          criado_em?: string
        }
        Update: {
          id?: string
          email?: string
          token?: string
          tipo?: 'grupo' | 'participante' | 'jurado'
          evento_id?: string | null
          produtora_id?: string
          status?: 'pendente' | 'aceito' | 'expirado'
          data_expiracao?: string
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "convites_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "apresentacoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apresentacoes_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apresentacoes_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          }
        ]
      }
      apresentacao_elenco: {
        Row: {
          id: string
          apresentacao_id: string
          participante_id: string
          criado_em: string
        }
        Insert: {
          id?: string
          apresentacao_id: string
          participante_id: string
          criado_em?: string
        }
        Update: {
          id?: string
          apresentacao_id?: string
          participante_id?: string
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "apresentacao_elenco_apresentacao_id_fkey"
            columns: ["apresentacao_id"]
            isOneToOne: false
            referencedRelation: "apresentacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apresentacao_elenco_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes"
            referencedColumns: ["id"]
          }
        ]
      }
      criterios_avaliacao: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          peso: number
          evento_id: string
          ordem: number
          criado_em: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          peso?: number
          evento_id: string
          ordem?: number
          criado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          peso?: number
          evento_id?: string
          ordem?: number
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "criterios_avaliacao_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "avaliacoes_apresentacao_id_fkey"
            columns: ["apresentacao_id"]
            isOneToOne: false
            referencedRelation: "apresentacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_criterio_id_fkey"
            columns: ["criterio_id"]
            isOneToOne: false
            referencedRelation: "criterios_avaliacao"
            referencedColumns: ["id"]
          }
        ]
      }
      eventojurados: {
        Row: {
          id: string
          evento_id: string
          jurado_id: string
          ativo: boolean
          criado_em: string
        }
        Insert: {
          id?: string
          evento_id: string
          jurado_id: string
          ativo?: boolean
          criado_em?: string
        }
        Update: {
          id?: string
          evento_id?: string
          jurado_id?: string
          ativo?: boolean
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventojurados_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          }
        ]
      }
      produtos: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          preco: number
          estoque: number | null
          ativo: boolean
          produtora_id: string
          criado_em: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          preco: number
          estoque?: number | null
          ativo?: boolean
          produtora_id: string
          criado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          preco?: number
          estoque?: number | null
          ativo?: boolean
          produtora_id?: string
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          }
        ]
      }
      pdv_produtos: {
        Row: {
          id: string
          evento_id: string
          produto_id: string
          preco_evento: number
          estoque_evento: number | null
          ativo: boolean
          criado_em: string
        }
        Insert: {
          id?: string
          evento_id: string
          produto_id: string
          preco_evento: number
          estoque_evento?: number | null
          ativo?: boolean
          criado_em?: string
        }
        Update: {
          id?: string
          evento_id?: string
          produto_id?: string
          preco_evento?: number
          estoque_evento?: number | null
          ativo?: boolean
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdv_produtos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdv_produtos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          }
        ]
      }
      pedido_itens: {
        Row: {
          id: string
          venda_id: string
          produto_id: string
          quantidade: number
          preco_unitario: number
          total: number
          criado_em: string
        }
        Insert: {
          id?: string
          venda_id: string
          produto_id: string
          quantidade: number
          preco_unitario: number
          total: number
          criado_em?: string
        }
        Update: {
          id?: string
          venda_id?: string
          produto_id?: string
          quantidade?: number
          preco_unitario?: number
          total?: number
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedido_itens_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "pdv_vendas"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
      }
      certificados: {
        Row: {
          id: string
          participante_id: string
          evento_id: string
          apresentacao_id: string | null
          tipo: 'participacao' | 'premiacao' | 'jurado'
          codigo_validacao: string
          url_pdf: string | null
          emitido: boolean
          data_emissao: string | null
          criado_em: string
        }
        Insert: {
          id?: string
          participante_id: string
          evento_id: string
          apresentacao_id?: string | null
          tipo?: 'participacao' | 'premiacao' | 'jurado'
          codigo_validacao: string
          url_pdf?: string | null
          emitido?: boolean
          data_emissao?: string | null
          criado_em?: string
        }
        Update: {
          id?: string
          participante_id?: string
          evento_id?: string
          apresentacao_id?: string | null
          tipo?: 'participacao' | 'premiacao' | 'jurado'
          codigo_validacao?: string
          url_pdf?: string | null
          emitido?: boolean
          data_emissao?: string | null
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificados_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificados_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          }
        ]
      }
    }
      tenant_config: {
        Row: {
          id: string
          produtora_id: string
          perfil_id: string | null
          nome_organizacao: string | null
          logo_url: string | null
          termo_inscricao: string | null
          termo_participante: string | null
          termo_grupo: string | null
          termo_apresentacao: string | null
          termo_evento: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          produtora_id: string
          perfil_id?: string | null
          nome_organizacao?: string | null
          logo_url?: string | null
          termo_inscricao?: string | null
          termo_participante?: string | null
          termo_grupo?: string | null
          termo_apresentacao?: string | null
          termo_evento?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          produtora_id?: string
          perfil_id?: string | null
          nome_organizacao?: string | null
          logo_url?: string | null
          termo_inscricao?: string | null
          termo_participante?: string | null
          termo_grupo?: string | null
          termo_apresentacao?: string | null
          termo_evento?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_config_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          }
        ]
      }
      tenant_estilos_ativos: {
        Row: {
          id: string
          estilo_id: string
          produtora_id: string
          ativo: boolean
        }
        Insert: {
          id?: string
          estilo_id: string
          produtora_id: string
          ativo?: boolean
        }
        Update: {
          id?: string
          estilo_id?: string
          produtora_id?: string
          ativo?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "tenant_estilos_ativos_estilo_id_fkey"
            columns: ["estilo_id"]
            isOneToOne: false
            referencedRelation: "estilos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_estilos_ativos_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          }
        ]
      }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_meu_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_minha_produtora_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      can_group_view_event: {
        Args: { p_evento_id: string; p_grupo_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never