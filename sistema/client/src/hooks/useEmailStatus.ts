import { useCallback, useEffect, useState } from 'react'
import { emailApi, type EmailStatus } from '../services/api'

export function useEmailStatus() {
  const [status, setStatus] = useState<EmailStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      setStatus(await emailApi.status())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { status, loading, refetch: fetch }
}
