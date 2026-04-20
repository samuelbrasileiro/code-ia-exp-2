import { useCallback, useEffect, useState } from 'react'

export function useResource<T>(fetcher: () => Promise<T[]>, errorMessage: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await fetcher())
    } catch {
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [fetcher, errorMessage])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}
