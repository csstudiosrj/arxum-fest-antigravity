export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          categoria_pai_id: string | null
          competitiva: boolean | null
          cor_identificacao: string | null
          created_at: string | null
          estilo_id: string | null
          evento_id: string | null
          faixa_etaria_label: string | null
          faixa_etaria_max: number | null
          faixa_etaria_min: number | null
          genero: string | null
          id: string
          max_participantes: number | null
          min_participantes: number | null
          nome: string
          observacoes: string | null
          permite_conjunto: boolean | null
          permite_duo: boolean | null
          permite_solo: boolean | null
          premio_dinheiro_1: number | null
          premio_dinheiro_2: number | null
          premio_dinheiro_3: number | null
          produtora_id: string | null
          tempo_apresentacao_max: number | null
          tempo_apresentacao_min: number | null
          valor_conjunto: number | null
          valor_duo: number | null
          valor_solo: number | null
        }
        Insert: {
          categoria_pai_id?: string | null
          competitiva?: boolean | null
          cor_identificacao?: string | null
          created_at?: string | null
          estilo_id?: string | null
          evento_id?: string | null
          faixa_etaria_label?: string | null
          faixa_etaria_max?: number | null
          faixa_etaria_min?: number | null
          genero?: string | null
          id?: string
          max_participantes?: number | null
          min_participantes?: number | null
          nome: string
          observacoes?: string | null
          permite_conjunto?: boolean | null
          permite_duo?: boolean | null
          permite_solo?: boolean | null
          premio_dinheiro_1?: number | null
          premio_dinheiro_2?: number | null
          premio_dinheiro_3?: number | null
          produtora_id?: string | null
          tempo_apresentacao_max?: number | null
          tempo_apresentacao_min?: number | null
          valor_conjunto?: number | null
          valor_duo?: number | null
          valor_solo?: number | null
        }
        Update: {
          categoria_pai_id?: string | null
          competitiva?: boolean | null
          cor_identificacao?: string | null
          created_at?: string | null
          estilo_id?: string | null
          evento_id?: string | null
          faixa_etaria_label?: string | null
          faixa_etaria_max?: number | null
          faixa_etaria_min?: number | null
          genero?: string | null
          id?: string
          max_participantes?: number | null
          min_participantes?: number | null
          nome?: string
          observacoes?: string | null
          permite_conjunto?: boolean | null
          permite_duo?: boolean | null
          permite_solo?: boolean | null
          premio_dinheiro_1?: number | null
          premio_dinheiro_2?: number | null
          premio_dinheiro_3?: number | null
          produtora_id?: string | null
          tempo_apresentacao_max?: number | null
          tempo_apresentacao_min?: number | null
          valor_conjunto?: number | null
          valor_duo?: number | null
          valor_solo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_categoria_pai_id_fkey"
            columns: ["categoria_pai_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categorias_estilo_id_fkey"
            columns: ["estilo_id"]
            isOneToOne: false
            referencedRelation: "estilos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categorias_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categorias_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      convites: {
        Row: {
          aceito_em: string | null
          email_convidado: string
          entidade_id: string | null
          enviado_em: string | null
          evento_id: string
          id: string
          produtora_id: string
          status: string | null
          tipo_convidado: string
          token: string | null
        }
        Insert: {
          aceito_em?: string | null
          email_convidado: string
          entidade_id?: string | null
          enviado_em?: string | null
          evento_id: string
          id?: string
          produtora_id: string
          status?: string | null
          tipo_convidado: string
          token?: string | null
        }
        Update: {
          aceito_em?: string | null
          email_convidado?: string
          entidade_id?: string | null
          enviado_em?: string | null
          evento_id?: string
          id?: string
          produtora_id?: string
          status?: string | null
          tipo_convidado?: string
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convites_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convites_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      estilos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          criado_em: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
          perfil_id: string | null
          slug: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
          perfil_id?: string | null
          slug: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          perfil_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "estilos_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis_festival"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_produtos: {
        Row: {
          ativo_evento: boolean | null
          criado_em: string | null
          estoque_evento: number | null
          evento_id: string
          id: string
          preco_evento: number | null
          produto_id: string
        }
        Insert: {
          ativo_evento?: boolean | null
          criado_em?: string | null
          estoque_evento?: number | null
          evento_id: string
          id?: string
          preco_evento?: number | null
          produto_id: string
        }
        Update: {
          ativo_evento?: boolean | null
          criado_em?: string | null
          estoque_evento?: number | null
          evento_id?: string
          id?: string
          preco_evento?: number | null
          produto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evento_produtos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_produtos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          banner_url: string | null
          cor_primaria: string | null
          cor_secundaria: string | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          exibir_feed_instagram: boolean | null
          exibir_loja_publica: boolean | null
          id: string
          inscritos_count: number | null
          local: string | null
          logo_url: string | null
          nome: string
          perfil_id: string | null
          produtora_id: string | null
          regulamento_url: string | null
          slug: string | null
          status: string | null
          tema_escuro: boolean | null
        }
        Insert: {
          banner_url?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          exibir_feed_instagram?: boolean | null
          exibir_loja_publica?: boolean | null
          id?: string
          inscritos_count?: number | null
          local?: string | null
          logo_url?: string | null
          nome: string
          perfil_id?: string | null
          produtora_id?: string | null
          regulamento_url?: string | null
          slug?: string | null
          status?: string | null
          tema_escuro?: boolean | null
        }
        Update: {
          banner_url?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          exibir_feed_instagram?: boolean | null
          exibir_loja_publica?: boolean | null
          id?: string
          inscritos_count?: number | null
          local?: string | null
          logo_url?: string | null
          nome?: string
          perfil_id?: string | null
          produtora_id?: string | null
          regulamento_url?: string | null
          slug?: string | null
          status?: string | null
          tema_escuro?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis_festival"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          cidade: string | null
          criado_em: string | null
          documento: string
          email_contato: string
          estado: string | null
          id: string
          nome: string
          produtora_origem_id: string | null
          responsavel_cpf: string | null
          responsavel_nome: string | null
          telefone: string | null
          tipo_documento: Database["public"]["Enums"]["tipo_documento"] | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cidade?: string | null
          criado_em?: string | null
          documento: string
          email_contato: string
          estado?: string | null
          id?: string
          nome: string
          produtora_origem_id?: string | null
          responsavel_cpf?: string | null
          responsavel_nome?: string | null
          telefone?: string | null
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"] | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cidade?: string | null
          criado_em?: string | null
          documento?: string
          email_contato?: string
          estado?: string | null
          id?: string
          nome?: string
          produtora_origem_id?: string | null
          responsavel_cpf?: string | null
          responsavel_nome?: string | null
          telefone?: string | null
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"] | null
        }
        Relationships: [
          {
            foreignKeyName: "grupos_produtora_origem_id_fkey"
            columns: ["produtora_origem_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      inscricoes_grupo_evento: {
        Row: {
          criado_em: string | null
          data_inscricao: string | null
          evento_id: string
          grupo_id: string
          id: string
          origem: string
          produtora_id: string
          status: string
        }
        Insert: {
          criado_em?: string | null
          data_inscricao?: string | null
          evento_id: string
          grupo_id: string
          id?: string
          origem?: string
          produtora_id: string
          status?: string
        }
        Update: {
          criado_em?: string | null
          data_inscricao?: string | null
          evento_id?: string
          grupo_id?: string
          id?: string
          origem?: string
          produtora_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscricoes_grupo_evento_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_grupo_evento_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscricoes_grupo_evento_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      locais_evento: {
        Row: {
          cidade: string | null
          created_at: string | null
          endereco: string | null
          estado: string | null
          evento_id: string | null
          id: string
          nome_local: string
        }
        Insert: {
          cidade?: string | null
          created_at?: string | null
          endereco?: string | null
          estado?: string | null
          evento_id?: string | null
          id?: string
          nome_local: string
        }
        Update: {
          cidade?: string | null
          created_at?: string | null
          endereco?: string | null
          estado?: string | null
          evento_id?: string | null
          id?: string
          nome_local?: string
        }
        Relationships: [
          {
            foreignKeyName: "locais_evento_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_posts: {
        Row: {
          agendado_para: string | null
          conteudo: string
          criado_em: string | null
          erro_mensagem: string | null
          evento_id: string | null
          id: string
          imagem_url: string | null
          plataforma: string
          produtora_id: string | null
          publicado_em: string | null
          status: string | null
          titulo: string
        }
        Insert: {
          agendado_para?: string | null
          conteudo: string
          criado_em?: string | null
          erro_mensagem?: string | null
          evento_id?: string | null
          id?: string
          imagem_url?: string | null
          plataforma?: string
          produtora_id?: string | null
          publicado_em?: string | null
          status?: string | null
          titulo: string
        }
        Update: {
          agendado_para?: string | null
          conteudo?: string
          criado_em?: string | null
          erro_mensagem?: string | null
          evento_id?: string | null
          id?: string
          imagem_url?: string | null
          plataforma?: string
          produtora_id?: string | null
          publicado_em?: string | null
          status?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_posts_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_posts_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      participantes: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          cidade: string | null
          criado_em: string | null
          data_nascimento: string
          documento: string
          email_contato: string | null
          estado: string | null
          id: string
          nome_completo: string
          nome_social: string | null
          possui_autorizacao_menor: boolean | null
          produtora_origem_id: string | null
          telefone: string | null
          termo_imagem_aceite: boolean | null
          termo_imagem_data: string | null
          tipo_documento: Database["public"]["Enums"]["tipo_documento"] | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cidade?: string | null
          criado_em?: string | null
          data_nascimento: string
          documento: string
          email_contato?: string | null
          estado?: string | null
          id?: string
          nome_completo: string
          nome_social?: string | null
          possui_autorizacao_menor?: boolean | null
          produtora_origem_id?: string | null
          telefone?: string | null
          termo_imagem_aceite?: boolean | null
          termo_imagem_data?: string | null
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"] | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cidade?: string | null
          criado_em?: string | null
          data_nascimento?: string
          documento?: string
          email_contato?: string | null
          estado?: string | null
          id?: string
          nome_completo?: string
          nome_social?: string | null
          possui_autorizacao_menor?: boolean | null
          produtora_origem_id?: string | null
          telefone?: string | null
          termo_imagem_aceite?: boolean | null
          termo_imagem_data?: string | null
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"] | null
        }
        Relationships: [
          {
            foreignKeyName: "participantes_produtora_origem_id_fkey"
            columns: ["produtora_origem_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      participantes_bloqueados: {
        Row: {
          criado_em: string | null
          id: string
          motivo: string | null
          participante_id: string | null
          produtora_id: string
        }
        Insert: {
          criado_em?: string | null
          id?: string
          motivo?: string | null
          participante_id?: string | null
          produtora_id: string
        }
        Update: {
          criado_em?: string | null
          id?: string
          motivo?: string | null
          participante_id?: string | null
          produtora_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participantes_bloqueados_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participantes_bloqueados_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_config: {
        Row: {
          atualizado_em: string | null
          chave_pix: string | null
          cidade_recebedor: string | null
          criado_em: string | null
          evento_id: string | null
          id: string
          nome_recebedor: string | null
          pin_vendedor: string | null
          produtora_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          chave_pix?: string | null
          cidade_recebedor?: string | null
          criado_em?: string | null
          evento_id?: string | null
          id?: string
          nome_recebedor?: string | null
          pin_vendedor?: string | null
          produtora_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          chave_pix?: string | null
          cidade_recebedor?: string | null
          criado_em?: string | null
          evento_id?: string | null
          id?: string
          nome_recebedor?: string | null
          pin_vendedor?: string | null
          produtora_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pdv_config_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdv_config_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_produtos: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          criado_em: string | null
          descricao: string | null
          estoque: number | null
          evento_id: string
          id: string
          nome: string
          ordem: number | null
          preco: number
          produto_id: string
          produtora_id: string | null
          tipo: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          estoque?: number | null
          evento_id: string
          id?: string
          nome: string
          ordem?: number | null
          preco?: number
          produto_id: string
          produtora_id?: string | null
          tipo?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          estoque?: number | null
          evento_id?: string
          id?: string
          nome?: string
          ordem?: number | null
          preco?: number
          produto_id?: string
          produtora_id?: string | null
          tipo?: string | null
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
          },
          {
            foreignKeyName: "pdv_produtos_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      pdv_vendas: {
        Row: {
          criado_em: string | null
          evento_id: string | null
          forma_pagamento: string
          id: string
          itens: Json
          operador_id: string | null
          sincronizado: boolean | null
          total: number
        }
        Insert: {
          criado_em?: string | null
          evento_id?: string | null
          forma_pagamento: string
          id?: string
          itens?: Json
          operador_id?: string | null
          sincronizado?: boolean | null
          total?: number
        }
        Update: {
          criado_em?: string | null
          evento_id?: string | null
          forma_pagamento?: string
          id?: string
          itens?: Json
          operador_id?: string | null
          sincronizado?: boolean | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pdv_vendas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdv_vendas_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_itens: {
        Row: {
          criado_em: string | null
          evento_id: string | null
          grupo_id: string
          id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          status: string | null
          variacao_id: string | null
        }
        Insert: {
          criado_em?: string | null
          evento_id?: string | null
          grupo_id: string
          id?: string
          preco_unitario: number
          produto_id: string
          quantidade?: number
          status?: string | null
          variacao_id?: string | null
        }
        Update: {
          criado_em?: string | null
          evento_id?: string | null
          grupo_id?: string
          id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          status?: string | null
          variacao_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedido_itens_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_variacao_id_fkey"
            columns: ["variacao_id"]
            isOneToOne: false
            referencedRelation: "produto_variacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_festival: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          criado_em: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          slug: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          criado_em?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          slug: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          criado_em?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          slug?: string
        }
        Relationships: []
      }
      produto_variacoes: {
        Row: {
          criado_em: string | null
          estoque: number | null
          id: string
          nome: string
          produto_id: string
        }
        Insert: {
          criado_em?: string | null
          estoque?: number | null
          id?: string
          nome: string
          produto_id: string
        }
        Update: {
          criado_em?: string | null
          estoque?: number | null
          id?: string
          nome?: string
          produto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produto_variacoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtoras: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          cor_primaria: string | null
          cor_secundaria: string | null
          criado_em: string | null
          documento: string
          email: string | null
          email_contato: string
          id: string
          logo_url: string | null
          nome: string
          nome_fantasia: string | null
          plano_assinatura: string | null
          telefone: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          criado_em?: string | null
          documento: string
          email?: string | null
          email_contato: string
          id?: string
          logo_url?: string | null
          nome: string
          nome_fantasia?: string | null
          plano_assinatura?: string | null
          telefone?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          criado_em?: string | null
          documento?: string
          email?: string | null
          email_contato?: string
          id?: string
          logo_url?: string | null
          nome?: string
          nome_fantasia?: string | null
          plano_assinatura?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      produtos: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          descricao: string | null
          estoque: number | null
          exibir_loja_publica: boolean | null
          id: string
          imagem_url: string | null
          nome: string
          preco: number
          produtora_id: string | null
          tem_variacao: boolean | null
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          descricao?: string | null
          estoque?: number | null
          exibir_loja_publica?: boolean | null
          id?: string
          imagem_url?: string | null
          nome: string
          preco?: number
          produtora_id?: string | null
          tem_variacao?: boolean | null
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          descricao?: string | null
          estoque?: number | null
          exibir_loja_publica?: boolean | null
          id?: string
          imagem_url?: string | null
          nome?: string
          preco?: number
          produtora_id?: string | null
          tem_variacao?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_config: {
        Row: {
          atualizado_em: string | null
          configurado_em: string | null
          cor_primaria: string | null
          id: string
          logo_url: string | null
          nome_exibicao: string | null
          nome_organizacao: string | null
          perfil_id: string | null
          produtora_id: string | null
          termo_apresentacao: string | null
          termo_grupo: string | null
          termo_participante: string | null
        }
        Insert: {
          atualizado_em?: string | null
          configurado_em?: string | null
          cor_primaria?: string | null
          id?: string
          logo_url?: string | null
          nome_exibicao?: string | null
          nome_organizacao?: string | null
          perfil_id?: string | null
          produtora_id?: string | null
          termo_apresentacao?: string | null
          termo_grupo?: string | null
          termo_participante?: string | null
        }
        Update: {
          atualizado_em?: string | null
          configurado_em?: string | null
          cor_primaria?: string | null
          id?: string
          logo_url?: string | null
          nome_exibicao?: string | null
          nome_organizacao?: string | null
          perfil_id?: string | null
          produtora_id?: string | null
          termo_apresentacao?: string | null
          termo_grupo?: string | null
          termo_participante?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_config_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis_festival"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_config_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: true
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_estilos_ativos: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          estilo_id: string
          id: string
          produtora_id: string
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          estilo_id: string
          id?: string
          produtora_id: string
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          estilo_id?: string
          id?: string
          produtora_id?: string
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
          },
        ]
      }
      termos_aceites: {
        Row: {
          aceito_em: string | null
          documento_id: string
          email_assinante: string | null
          grupo_id: string | null
          id: string
          ip_address: string | null
          nome_assinante: string | null
          participante_id: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          aceito_em?: string | null
          documento_id: string
          email_assinante?: string | null
          grupo_id?: string | null
          id?: string
          ip_address?: string | null
          nome_assinante?: string | null
          participante_id?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          aceito_em?: string | null
          documento_id?: string
          email_assinante?: string | null
          grupo_id?: string | null
          id?: string
          ip_address?: string | null
          nome_assinante?: string | null
          participante_id?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "termos_aceites_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "termos_documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "termos_aceites_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "termos_aceites_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "termos_aceites_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      termos_documentos: {
        Row: {
          arquivo_url: string | null
          ativo: boolean | null
          atualizado_em: string | null
          conteudo: string | null
          criado_em: string | null
          evento_id: string | null
          exibir_publico: boolean | null
          id: string
          produtora_id: string | null
          tipo: string
          titulo: string
          versao: number | null
        }
        Insert: {
          arquivo_url?: string | null
          ativo?: boolean | null
          atualizado_em?: string | null
          conteudo?: string | null
          criado_em?: string | null
          evento_id?: string | null
          exibir_publico?: boolean | null
          id?: string
          produtora_id?: string | null
          tipo: string
          titulo: string
          versao?: number | null
        }
        Update: {
          arquivo_url?: string | null
          ativo?: boolean | null
          atualizado_em?: string | null
          conteudo?: string | null
          criado_em?: string | null
          evento_id?: string | null
          exibir_publico?: boolean | null
          id?: string
          produtora_id?: string | null
          tipo?: string
          titulo?: string
          versao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "termos_documentos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "termos_documentos_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          email: string
          foto_url: string | null
          grupo_id: string | null
          id: string
          nome: string | null
          nome_completo: string | null
          participante_id: string | null
          produtora_id: string | null
          role: Database["public"]["Enums"]["role_type"] | null
          telefone: string | null
          ultimo_acesso: string | null
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          email: string
          foto_url?: string | null
          grupo_id?: string | null
          id: string
          nome?: string | null
          nome_completo?: string | null
          participante_id?: string | null
          produtora_id?: string | null
          role?: Database["public"]["Enums"]["role_type"] | null
          telefone?: string | null
          ultimo_acesso?: string | null
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          email?: string
          foto_url?: string | null
          grupo_id?: string | null
          id?: string
          nome?: string | null
          nome_completo?: string | null
          participante_id?: string | null
          produtora_id?: string | null
          role?: Database["public"]["Enums"]["role_type"] | null
          telefone?: string | null
          ultimo_acesso?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_produtora_id_fkey"
            columns: ["produtora_id"]
            isOneToOne: false
            referencedRelation: "produtoras"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_group_view_event: {
        Args: { p_evento_id: string; p_grupo_id: string }
        Returns: boolean
      }
      get_meu_grupo_id: { Args: never; Returns: string }
      get_meu_role: { Args: never; Returns: string }
      get_minha_organizacao_id: { Args: never; Returns: string }
      get_minha_produtora_id: { Args: never; Returns: string }
      get_tenant_config: {
        Args: { p_produtora_id: string }
        Returns: {
          cor_primaria: string
          termo_grupo: string
          termo_participante: string
        }[]
      }
      is_produtora_admin_or_staff: {
        Args: { _produtora_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      role_type:
        | "super_admin"
        | "produtora_admin"
        | "produtora_staff"
        | "operador"
        | "grupo_responsavel"
        | "jurado"
        | "participante"
        | "admin"
        | "staff"
        | "grupo"
      status_inscricao:
        | "pendente"
        | "confirmada"
        | "cancelada"
        | "recusada"
        | "bloqueada"
      status_vinculo: "ativo" | "pendente_confirmacao" | "inativo" | "bloqueado"
      tipo_documento: "cpf" | "cnpj" | "rg" | "passaporte" | "outro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      role_type: [
        "super_admin",
        "produtora_admin",
        "produtora_staff",
        "operador",
        "grupo_responsavel",
        "jurado",
        "participante",
        "admin",
        "staff",
        "grupo",
      ],
      status_inscricao: [
        "pendente",
        "confirmada",
        "cancelada",
        "recusada",
        "bloqueada",
      ],
      status_vinculo: ["ativo", "pendente_confirmacao", "inativo", "bloqueado"],
      tipo_documento: ["cpf", "cnpj", "rg", "passaporte", "outro"],
    },
  },
} as const
