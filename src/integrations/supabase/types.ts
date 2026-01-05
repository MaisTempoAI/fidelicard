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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      "adm-login": {
        Row: {
          active: string | null
          created_at: string
          id: number
          login: string | null
          nome: string | null
          pass: string | null
          status: string | null
        }
        Insert: {
          active?: string | null
          created_at: string
          id?: number
          login?: string | null
          nome?: string | null
          pass?: string | null
          status?: string | null
        }
        Update: {
          active?: string | null
          created_at?: string
          id?: number
          login?: string | null
          nome?: string | null
          pass?: string | null
          status?: string | null
        }
        Relationships: []
      }
      "CRF-Cards": {
        Row: {
          cardcode: string | null
          completed: boolean | null
          completedat: string | null
          created_at: string
          custamp: number | null
          events: string | null
          expiredate: string | null
          id: number
          idclient: string | null
          idemp: string | null
          qrcode: string | null
          reqstamp: number | null
          rescued: boolean | null
        }
        Insert: {
          cardcode?: string | null
          completed?: boolean | null
          completedat?: string | null
          created_at?: string
          custamp?: number | null
          events?: string | null
          expiredate?: string | null
          id?: number
          idclient?: string | null
          idemp?: string | null
          qrcode?: string | null
          reqstamp?: number | null
          rescued?: boolean | null
        }
        Update: {
          cardcode?: string | null
          completed?: boolean | null
          completedat?: string | null
          created_at?: string
          custamp?: number | null
          events?: string | null
          expiredate?: string | null
          id?: number
          idclient?: string | null
          idemp?: string | null
          qrcode?: string | null
          reqstamp?: number | null
          rescued?: boolean | null
        }
        Relationships: []
      }
      "CRF-Clients": {
        Row: {
          cardid: string | null
          created_at: string
          eid: number | null
          id: number
          nome: string | null
          obs: string | null
          phone: string | null
          stamps: number | null
          ultimavisita: string | null
        }
        Insert: {
          cardid?: string | null
          created_at?: string
          eid?: number | null
          id?: number
          nome?: string | null
          obs?: string | null
          phone?: string | null
          stamps?: number | null
          ultimavisita?: string | null
        }
        Update: {
          cardid?: string | null
          created_at?: string
          eid?: number | null
          id?: number
          nome?: string | null
          obs?: string | null
          phone?: string | null
          stamps?: number | null
          ultimavisita?: string | null
        }
        Relationships: []
      }
      "CRF-CoCards": {
        Row: {
          active: boolean | null
          card: string | null
          company: string | null
          created_at: string
          days: number | null
          icon: string | null
          id: number
          name: string | null
          pricolour: string | null
          prod: string | null
          renewable: boolean | null
          seccolour: string | null
          stamps: number | null
          text: string | null
        }
        Insert: {
          active?: boolean | null
          card?: string | null
          company?: string | null
          created_at?: string
          days?: number | null
          icon?: string | null
          id?: number
          name?: string | null
          pricolour?: string | null
          prod?: string | null
          renewable?: boolean | null
          seccolour?: string | null
          stamps?: number | null
          text?: string | null
        }
        Update: {
          active?: boolean | null
          card?: string | null
          company?: string | null
          created_at?: string
          days?: number | null
          icon?: string | null
          id?: number
          name?: string | null
          pricolour?: string | null
          prod?: string | null
          renewable?: boolean | null
          seccolour?: string | null
          stamps?: number | null
          text?: string | null
        }
        Relationships: []
      }
      "CRF-Companies": {
        Row: {
          active: boolean | null
          address: string | null
          created_at: string
          elogo: string | null
          email: string | null
          exchangeproducts: string | null
          extcode: string | null
          icon: string | null
          id: number
          loyaltystamps: string | null
          loyaltytext: string | null
          name: string | null
          password: string | null
          phone: string | null
          primarycolour: string | null
          qrcodeurl: string | null
          secundarycolour: string | null
          slug: string | null
          type: string | null
          urlsite: string | null
          user: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          created_at?: string
          elogo?: string | null
          email?: string | null
          exchangeproducts?: string | null
          extcode?: string | null
          icon?: string | null
          id?: number
          loyaltystamps?: string | null
          loyaltytext?: string | null
          name?: string | null
          password?: string | null
          phone?: string | null
          primarycolour?: string | null
          qrcodeurl?: string | null
          secundarycolour?: string | null
          slug?: string | null
          type?: string | null
          urlsite?: string | null
          user?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          created_at?: string
          elogo?: string | null
          email?: string | null
          exchangeproducts?: string | null
          extcode?: string | null
          icon?: string | null
          id?: number
          loyaltystamps?: string | null
          loyaltytext?: string | null
          name?: string | null
          password?: string | null
          phone?: string | null
          primarycolour?: string | null
          qrcodeurl?: string | null
          secundarycolour?: string | null
          slug?: string | null
          type?: string | null
          urlsite?: string | null
          user?: string | null
        }
        Relationships: []
      }
      "FAQ10-clients": {
        Row: {
          botativo: string | null
          criadoem: string
          id: number
          login: string | null
          nome: string | null
          question: string | null
          status: string | null
          ultimamsg: string | null
          whatsapp: string | null
        }
        Insert: {
          botativo?: string | null
          criadoem: string
          id?: number
          login?: string | null
          nome?: string | null
          question?: string | null
          status?: string | null
          ultimamsg?: string | null
          whatsapp?: string | null
        }
        Update: {
          botativo?: string | null
          criadoem?: string
          id?: number
          login?: string | null
          nome?: string | null
          question?: string | null
          status?: string | null
          ultimamsg?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      "FAQ10-clients_instagram": {
        Row: {
          botativo: string | null
          clientid: string
          criadoem: string
          id: number
          login: string | null
          nome: string | null
          question: string | null
          status: string | null
          ultimamsg: string | null
          username: string | null
        }
        Insert: {
          botativo?: string | null
          clientid: string
          criadoem: string
          id?: number
          login?: string | null
          nome?: string | null
          question?: string | null
          status?: string | null
          ultimamsg?: string | null
          username?: string | null
        }
        Update: {
          botativo?: string | null
          clientid?: string
          criadoem?: string
          id?: number
          login?: string | null
          nome?: string | null
          question?: string | null
          status?: string | null
          ultimamsg?: string | null
          username?: string | null
        }
        Relationships: []
      }
      "FAQ10-conversation": {
        Row: {
          criadoem: string
          fromme: string | null
          id: number
          idclient: string | null
          login: string | null
          pergunta: string | null
          resposta: string | null
          whatsappcli: string | null
        }
        Insert: {
          criadoem: string
          fromme?: string | null
          id?: number
          idclient?: string | null
          login?: string | null
          pergunta?: string | null
          resposta?: string | null
          whatsappcli?: string | null
        }
        Update: {
          criadoem?: string
          fromme?: string | null
          id?: number
          idclient?: string | null
          login?: string | null
          pergunta?: string | null
          resposta?: string | null
          whatsappcli?: string | null
        }
        Relationships: []
      }
      "FAQ10-master": {
        Row: {
          actualquestion: string | null
          botativo: boolean | null
          clientsession: string | null
          countmsg: number | null
          created_at: string
          delayresponse: number | null
          id: number
          login: string | null
          MODOausente: boolean | null
          MODOausenteMSG: string | null
          MODOausenteurl: string | null
          MSGSaudacao: string | null
          MSGSaudacaoactive: boolean | null
          MSGSaudacaolink: string | null
          MSGSaudacaourl: string | null
          N8NFLUX: string | null
          N8NHOK: string | null
          newpassword: string | null
          nomeEmpresa: string | null
          notificanumero: boolean | null
          q1: string | null
          q10: string | null
          q10response: string | null
          q10url: string | null
          q1response: string | null
          q1url: string | null
          q2: string | null
          q2response: string | null
          q2url: string | null
          q3: string | null
          q3response: string | null
          q3url: string | null
          q4: string | null
          q4response: string | null
          q4url: string | null
          q5: string | null
          q5response: string | null
          q5url: string | null
          q6: string | null
          q6response: string | null
          q6url: string | null
          q7: string | null
          q7response: string | null
          q7url: string | null
          q8: string | null
          q8response: string | null
          q8url: string | null
          q9: string | null
          q9response: string | null
          q9rul: string | null
          quepasakey: string | null
          ultimamsg: string | null
          whatsapp2: string | null
        }
        Insert: {
          actualquestion?: string | null
          botativo?: boolean | null
          clientsession?: string | null
          countmsg?: number | null
          created_at: string
          delayresponse?: number | null
          id?: number
          login?: string | null
          MODOausente?: boolean | null
          MODOausenteMSG?: string | null
          MODOausenteurl?: string | null
          MSGSaudacao?: string | null
          MSGSaudacaoactive?: boolean | null
          MSGSaudacaolink?: string | null
          MSGSaudacaourl?: string | null
          N8NFLUX?: string | null
          N8NHOK?: string | null
          newpassword?: string | null
          nomeEmpresa?: string | null
          notificanumero?: boolean | null
          q1?: string | null
          q10?: string | null
          q10response?: string | null
          q10url?: string | null
          q1response?: string | null
          q1url?: string | null
          q2?: string | null
          q2response?: string | null
          q2url?: string | null
          q3?: string | null
          q3response?: string | null
          q3url?: string | null
          q4?: string | null
          q4response?: string | null
          q4url?: string | null
          q5?: string | null
          q5response?: string | null
          q5url?: string | null
          q6?: string | null
          q6response?: string | null
          q6url?: string | null
          q7?: string | null
          q7response?: string | null
          q7url?: string | null
          q8?: string | null
          q8response?: string | null
          q8url?: string | null
          q9?: string | null
          q9response?: string | null
          q9rul?: string | null
          quepasakey?: string | null
          ultimamsg?: string | null
          whatsapp2?: string | null
        }
        Update: {
          actualquestion?: string | null
          botativo?: boolean | null
          clientsession?: string | null
          countmsg?: number | null
          created_at?: string
          delayresponse?: number | null
          id?: number
          login?: string | null
          MODOausente?: boolean | null
          MODOausenteMSG?: string | null
          MODOausenteurl?: string | null
          MSGSaudacao?: string | null
          MSGSaudacaoactive?: boolean | null
          MSGSaudacaolink?: string | null
          MSGSaudacaourl?: string | null
          N8NFLUX?: string | null
          N8NHOK?: string | null
          newpassword?: string | null
          nomeEmpresa?: string | null
          notificanumero?: boolean | null
          q1?: string | null
          q10?: string | null
          q10response?: string | null
          q10url?: string | null
          q1response?: string | null
          q1url?: string | null
          q2?: string | null
          q2response?: string | null
          q2url?: string | null
          q3?: string | null
          q3response?: string | null
          q3url?: string | null
          q4?: string | null
          q4response?: string | null
          q4url?: string | null
          q5?: string | null
          q5response?: string | null
          q5url?: string | null
          q6?: string | null
          q6response?: string | null
          q6url?: string | null
          q7?: string | null
          q7response?: string | null
          q7url?: string | null
          q8?: string | null
          q8response?: string | null
          q8url?: string | null
          q9?: string | null
          q9response?: string | null
          q9rul?: string | null
          quepasakey?: string | null
          ultimamsg?: string | null
          whatsapp2?: string | null
        }
        Relationships: []
      }
      "FAQ10-Webhooks": {
        Row: {
          ativo: string | null
          atualizadoem: string | null
          criadoem: string
          envios: string | null
          id: number
          login: string | null
          N8NFLUX: string | null
          N8NHOK: string | null
          quepasakey: string | null
          SLOTname: string | null
          status: string | null
        }
        Insert: {
          ativo?: string | null
          atualizadoem?: string | null
          criadoem: string
          envios?: string | null
          id?: number
          login?: string | null
          N8NFLUX?: string | null
          N8NHOK?: string | null
          quepasakey?: string | null
          SLOTname?: string | null
          status?: string | null
        }
        Update: {
          ativo?: string | null
          atualizadoem?: string | null
          criadoem?: string
          envios?: string | null
          id?: number
          login?: string | null
          N8NFLUX?: string | null
          N8NHOK?: string | null
          quepasakey?: string | null
          SLOTname?: string | null
          status?: string | null
        }
        Relationships: []
      }
      "FAQ10-Webhooks-instagram": {
        Row: {
          ativo: string | null
          atualizadoem: string | null
          countdirect: number | null
          countfeed: number | null
          criadoem: string
          envios: string | null
          id: number
          login: string | null
          N8NFLUX: string | null
          N8NHOK: string | null
          quepasakey: string | null
          status: string | null
          TOKEN: string | null
        }
        Insert: {
          ativo?: string | null
          atualizadoem?: string | null
          countdirect?: number | null
          countfeed?: number | null
          criadoem: string
          envios?: string | null
          id?: number
          login?: string | null
          N8NFLUX?: string | null
          N8NHOK?: string | null
          quepasakey?: string | null
          status?: string | null
          TOKEN?: string | null
        }
        Update: {
          ativo?: string | null
          atualizadoem?: string | null
          countdirect?: number | null
          countfeed?: number | null
          criadoem?: string
          envios?: string | null
          id?: number
          login?: string | null
          N8NFLUX?: string | null
          N8NHOK?: string | null
          quepasakey?: string | null
          status?: string | null
          TOKEN?: string | null
        }
        Relationships: []
      }
      "INSTA-BOT-config": {
        Row: {
          botativo: string | null
          commentinbox: string | null
          contexto: string | null
          created_at: string
          descempresa: string | null
          descprodutos_servicos: string | null
          emojireact: string | null
          endereco: string | null
          exemplos: string | null
          exemplosfeed: string | null
          faq: string | null
          feedinbox: boolean | null
          hello: string | null
          helloactivate: boolean | null
          horarioatendimento: string | null
          id: number
          idclient: string | null
          N8NFLUX: string | null
          N8NHOK: string | null
          nomeempresa: string | null
          objetivo: string | null
          objetivofeed: string | null
          persona: string | null
          produtos_servicos: string | null
          regras: string | null
          regrasfeed: string | null
          roteiro: string | null
          status: string | null
          substituicoes: string | null
          TOKEN: string | null
        }
        Insert: {
          botativo?: string | null
          commentinbox?: string | null
          contexto?: string | null
          created_at: string
          descempresa?: string | null
          descprodutos_servicos?: string | null
          emojireact?: string | null
          endereco?: string | null
          exemplos?: string | null
          exemplosfeed?: string | null
          faq?: string | null
          feedinbox?: boolean | null
          hello?: string | null
          helloactivate?: boolean | null
          horarioatendimento?: string | null
          id?: number
          idclient?: string | null
          N8NFLUX?: string | null
          N8NHOK?: string | null
          nomeempresa?: string | null
          objetivo?: string | null
          objetivofeed?: string | null
          persona?: string | null
          produtos_servicos?: string | null
          regras?: string | null
          regrasfeed?: string | null
          roteiro?: string | null
          status?: string | null
          substituicoes?: string | null
          TOKEN?: string | null
        }
        Update: {
          botativo?: string | null
          commentinbox?: string | null
          contexto?: string | null
          created_at?: string
          descempresa?: string | null
          descprodutos_servicos?: string | null
          emojireact?: string | null
          endereco?: string | null
          exemplos?: string | null
          exemplosfeed?: string | null
          faq?: string | null
          feedinbox?: boolean | null
          hello?: string | null
          helloactivate?: boolean | null
          horarioatendimento?: string | null
          id?: number
          idclient?: string | null
          N8NFLUX?: string | null
          N8NHOK?: string | null
          nomeempresa?: string | null
          objetivo?: string | null
          objetivofeed?: string | null
          persona?: string | null
          produtos_servicos?: string | null
          regras?: string | null
          regrasfeed?: string | null
          roteiro?: string | null
          status?: string | null
          substituicoes?: string | null
          TOKEN?: string | null
        }
        Relationships: []
      }
      "INSTA-BOT-conversation": {
        Row: {
          criadoem: string
          fromme: string | null
          id: number
          idclient: string | null
          login: string | null
          nomecli: string | null
          pergunta: string | null
          resposta: string | null
          username: string | null
        }
        Insert: {
          criadoem: string
          fromme?: string | null
          id?: number
          idclient?: string | null
          login?: string | null
          nomecli?: string | null
          pergunta?: string | null
          resposta?: string | null
          username?: string | null
        }
        Update: {
          criadoem?: string
          fromme?: string | null
          id?: number
          idclient?: string | null
          login?: string | null
          nomecli?: string | null
          pergunta?: string | null
          resposta?: string | null
          username?: string | null
        }
        Relationships: []
      }
      "INSTA-BOT-login": {
        Row: {
          created_at: string
          id: number
          idclient: string | null
          login: string | null
          n8nflux: string | null
          n8nhok: string | null
          pass: string | null
          status: string | null
        }
        Insert: {
          created_at: string
          id?: number
          idclient?: string | null
          login?: string | null
          n8nflux?: string | null
          n8nhok?: string | null
          pass?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          idclient?: string | null
          login?: string | null
          n8nflux?: string | null
          n8nhok?: string | null
          pass?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
