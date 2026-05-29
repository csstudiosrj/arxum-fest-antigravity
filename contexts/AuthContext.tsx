'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Database } from '@/lib/database.types'

// Define o tipo de usuário baseado na tabela do banco
type User = Database['public']['Tables']['usuarios']['Row']
type Role = User['role']

interface AuthContextType {
  user: User | null
  role: Role | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  // Cria o cliente usando as variáveis de ambiente corretamente
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkSession()
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserData(session.user.id)
      } else {
        setUser(null)
        setRole(null)
        setLoading(false)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await fetchUserData(session.user.id)
    } else {
      setLoading(false)
    }
  }

  const fetchUserData = async (userId: string) => {
    try {
      // Busca os dados extras na tabela publica.usuarios
      // Usamos 'as any' aqui para contornar erros de tipagem se o schema ainda não estiver 100% sincronizado
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      
      // Verificação de segurança para garantir que data existe e tem a propriedade role
      if (data) {
        setUser(data as User)
        // Garante que estamos acessando uma propriedade válida
        setRole((data as any).role || null) 
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
      setUser(null)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // O onAuthStateChange vai disparar e atualizar o estado automaticamente
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}