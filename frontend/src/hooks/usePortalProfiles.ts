import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
import type {
  JobPortalHubData,
  JobPortalProfile,
  JobPortalProfileInput,
  LoadStatus,
} from '../types'

interface PortalProfileState {
  status: LoadStatus
  data: JobPortalHubData | null
  error: string | null
  busyAction: string | null
}

const initialState: PortalProfileState = {
  status: 'loading',
  data: null,
  error: null,
  busyAction: null,
}

function messageFor(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Your job portal links could not be updated.'
}

export function usePortalProfiles() {
  const [state, setState] = useState(initialState)

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setState((current) => ({ ...current, status: 'loading', error: null }))

    try {
      const data = await apiRequest<JobPortalHubData>('/api/v1/portal_profiles', {
        signal,
      })
      setState((current) => ({
        ...current,
        status: 'ready',
        data,
        error: null,
      }))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return

      setState((current) => ({
        ...current,
        status: 'error',
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

  const save = useCallback(
    async (profileId: number | null, input: JobPortalProfileInput) => {
      const action = `save-${input.job_source_id}`
      setState((current) => ({ ...current, busyAction: action, error: null }))

      try {
        await apiRequest<{ profile: JobPortalProfile }>(
          profileId
            ? `/api/v1/portal_profiles/${profileId}`
            : '/api/v1/portal_profiles',
          {
            method: profileId ? 'PATCH' : 'POST',
            body: JSON.stringify({ portal_profile: input }),
          },
        )
        await refresh()
        setState((current) => ({ ...current, busyAction: null }))
      } catch (error) {
        setState((current) => ({
          ...current,
          busyAction: null,
          error: messageFor(error),
        }))
        throw error
      }
    },
    [refresh],
  )

  const disconnect = useCallback(
    async (profileId: number) => {
      setState((current) => ({
        ...current,
        busyAction: `disconnect-${profileId}`,
        error: null,
      }))
      try {
        await apiRequest(`/api/v1/portal_profiles/${profileId}`, {
          method: 'DELETE',
        })
        await refresh()
        setState((current) => ({ ...current, busyAction: null }))
      } catch (error) {
        setState((current) => ({
          ...current,
          busyAction: null,
          error: messageFor(error),
        }))
        throw error
      }
    },
    [refresh],
  )

  const markOpened = useCallback(async (profileId: number) => {
    try {
      const result = await apiRequest<{ profile: JobPortalProfile }>(
        `/api/v1/portal_profiles/${profileId}/opened`,
        { method: 'PATCH', body: JSON.stringify({}) },
      )
      setState((current) => ({
        ...current,
        data: current.data
          ? {
              portals: current.data.portals.map((entry) =>
                entry.profile?.id === profileId
                  ? { ...entry, profile: result.profile }
                  : entry,
              ),
            }
          : current.data,
      }))
    } catch {
      // Opening the official portal must never be blocked by visit analytics.
    }
  }, [])

  return { ...state, refresh, save, disconnect, markOpened }
}
