import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
      const { data } = await supabase
        .from('users')
        .select('name, signup_time, avatar_url')
        .eq('id', session.user.id)
        .single()
      setProfile(data)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  return (
    <UserContext.Provider value={{ user, profile, setProfile, fetchUserData }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
