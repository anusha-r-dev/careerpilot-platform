import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
import type {
  ApplicationStatus,
  JobApplication,
  LoadStatus,
  MemberDashboard,
  NewApplicationInput,
} from '../types'

interface MemberState {
  status: LoadStatus
  data: MemberDashboard | null
  error: string | null
}

const initialState: MemberState = {
  status: 'loading',
  data: null,
  error: null,
}

function messageFor(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Your job search data could not be loaded.'
}

export function useMemberDashboard() {
  const [state, setState] = useState<MemberState>(initialState)

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setState((current) => ({
      status: 'loading',
      data: current.data,
      error: null,
    }))

    try {
      const data = await apiRequest<MemberDashboard>('/api/v1/dashboard', {
        signal,
      })
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

  const createApplication = useCallback(
    async (input: NewApplicationInput) => {
      try {
        await apiRequest<{ application: JobApplication }>(
          '/api/v1/applications',
          {
            method: 'POST',
            body: JSON.stringify({ application: input }),
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

  const updateStatus = useCallback(
    async (id: number, status: ApplicationStatus) => {
      try {
        await apiRequest<{ application: JobApplication }>(
          `/api/v1/applications/${id}`,
          {
            method: 'PATCH',
            body: JSON.stringify({ application: { status } }),
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

  return { ...state, refresh, createApplication, updateStatus }
}
