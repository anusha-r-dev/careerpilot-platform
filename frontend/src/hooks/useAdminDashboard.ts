import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
import type {
  AdminDashboard,
  AdminMember,
  JobSource,
  LoadStatus,
} from '../types'

interface AdminState {
  status: LoadStatus
  data: AdminDashboard | null
  error: string | null
}

const initialState: AdminState = {
  status: 'loading',
  data: null,
  error: null,
}

function messageFor(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'The administrator overview could not be loaded.'
}

export function useAdminDashboard() {
  const [state, setState] = useState<AdminState>(initialState)

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setState((current) => ({
      status: 'loading',
      data: current.data,
      error: null,
    }))

    try {
      const data = await apiRequest<AdminDashboard>(
        '/api/v1/admin/dashboard',
        { signal },
      )
      setState({ status: 'ready', data, error: null })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      setState((current) => ({
        status: 'error',
        data: current.data,
        error: messageFor(error),
      }))
      throw error
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void refresh(controller.signal).catch(() => undefined)
    return () => controller.abort()
  }, [refresh])

  const setMemberActive = useCallback(
    async (member: AdminMember, active: boolean) => {
      try {
        await apiRequest<{ user: AdminMember }>(
          `/api/v1/admin/users/${member.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify({ user: { active } }),
          },
        )
        await refresh()
      } catch (error) {
        setState((current) => ({ ...current, error: messageFor(error) }))
        throw error
      }
    },
    [refresh],
  )

  const setSourceActive = useCallback(
    async (source: JobSource, active: boolean) => {
      try {
        await apiRequest<{ source: JobSource }>(
          `/api/v1/admin/sources/${source.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify({ source: { active } }),
          },
        )
        await refresh()
      } catch (error) {
        setState((current) => ({ ...current, error: messageFor(error) }))
        throw error
      }
    },
    [refresh],
  )

  return { ...state, refresh, setMemberActive, setSourceActive }
}
