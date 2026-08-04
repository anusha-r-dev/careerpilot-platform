import { useCallback, useEffect, useState } from 'react'

export function useNavigation() {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    function handlePopState() {
      setPathname(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path)
    setPathname(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return { pathname, navigate }
}
