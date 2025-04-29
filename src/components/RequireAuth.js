import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function RequireAuth({ children }) {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user === null) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) return <p className="text-white p-6">Checking authentication...</p>

  return children
}
