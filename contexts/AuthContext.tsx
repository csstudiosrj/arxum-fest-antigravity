'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

// Tipo baseado na tabela usuarios do schema
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

  // Usa o cliente tipado do lib/supabase.ts
  const supabase = createClient()

  useEffect(() => {
    checkSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserData(session.user.id)
        } else {
          setUser(null)
          setRole(null)
          setLoading(false)
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      await fetchUserData(session.user.id)
    } else {
      setLoading(false)
    }
  }

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erro ao buscar usuário:', error.message)
        setUser(null)
        setRole(null)
        return
      }

      if (data) {
        setUser(data)
        setRole(data.role)
      } else {
        setUser(null)
        setRole(null)
      }
    } catch (err) {
      console.error('Erro inesperado ao buscar dados do usuário:', err)
      setUser(null)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    // onAuthStateChange dispara automaticamente e atualiza o estado
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
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
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}