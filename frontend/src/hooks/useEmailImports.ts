import { useCallback, useEffect, useRef, useState } from 'react'
import { apiRequest } from '../api/client'
import type {
  ConfirmEmailImportInput,
  EmailImportCenterData,
  LoadStatus,
} from '../types'

interface EmailImportState {
  status: LoadStatus
  data: EmailImportCenterData | null
  error: string | null
  notice: string | null
  busyAction: string | null
}

const initialState: EmailImportState = {
  status: 'loading',
  data: null,
  error: null,
  notice: null,
  busyAction: null,
}

function messageFor(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'The Gmail import center could not complete that action.'
}

export function useEmailImports() {
  const [state, setState] = useState(initialState)
  const automaticSyncStarted = useRef(false)

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setState((current) => ({ ...current, status: 'loading', error: null }))

    try {
      const data = await apiRequest<EmailImportCenterData>(
        '/api/v1/email_imports',
        { signal },
      )
      setState((current) => ({
        ...current,
        status: 'ready',
        data,
        error: null,
      }))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
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
    const gmailResult = new URLSearchParams(window.location.search).get('gmail')

    if (gmailResult) {
      setState((current) => ({
        ...current,
        notice: gmailResult === 'connected'
          ? 'Gmail connected successfully. CareerPilot is preparing the first synchronization.'
          : 'Gmail could not be connected. No mailbox access was saved.',
      }))
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${window.location.hash}`,
      )
    }

    void refresh(controller.signal).catch(() => undefined)
    return () => controller.abort()
  }, [refresh])

  const startConnection = useCallback(async () => {
    setState((current) => ({ ...current, busyAction: 'connect', error: null }))
    try {
      const result = await apiRequest<{ authorization_url: string }>(
        '/api/v1/integrations/gmail/start',
        { method: 'POST', body: JSON.stringify({}) },
      )
      window.location.assign(result.authorization_url)
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: messageFor(error),
      }))
    }
  }, [])

  const sync = useCallback(async () => {
    const connection = state.data?.connection
    if (!connection) return

    setState((current) => ({ ...current, busyAction: 'sync', error: null }))
    try {
      const result = await apiRequest<{ scanned: number; discovered: number }>(
        `/api/v1/integrations/${connection.id}/sync`,
        { method: 'POST', body: JSON.stringify({}) },
      )
      await refresh()
      setState((current) => ({
        ...current,
        busyAction: null,
        notice: `Gmail synchronization complete: ${result.discovered} new application emails found.`,
      }))
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: messageFor(error),
      }))
    }
  }, [refresh, state.data?.connection])

  useEffect(() => {
    const connection = state.data?.connection
    if (
      state.status !== 'ready' ||
      !connection ||
      connection.demo ||
      connection.status !== 'active' ||
      automaticSyncStarted.current
    ) {
      return
    }

    const lastSync = connection.last_synced_at
      ? new Date(connection.last_synced_at).getTime()
      : 0
    const stale = Date.now() - lastSync > 15 * 60 * 1000
    if (stale) {
      automaticSyncStarted.current = true
      void sync()
    }
  }, [state.data?.connection, state.status, sync])

  const confirmImport = useCallback(
    async (id: number, input: ConfirmEmailImportInput) => {
      setState((current) => ({ ...current, busyAction: `confirm-${id}`, error: null }))
      try {
        await apiRequest(`/api/v1/email_imports/${id}/confirm`, {
          method: 'POST',
          body: JSON.stringify({ email_import: input }),
        })
        await refresh()
        setState((current) => ({
          ...current,
          busyAction: null,
          notice: 'Application reviewed and added to your private pipeline.',
        }))
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

  const ignoreImport = useCallback(
    async (id: number) => {
      setState((current) => ({ ...current, busyAction: `ignore-${id}`, error: null }))
      try {
        await apiRequest(`/api/v1/email_imports/${id}/ignore`, {
          method: 'PATCH',
          body: JSON.stringify({}),
        })
        await refresh()
        setState((current) => ({ ...current, busyAction: null }))
      } catch (error) {
        setState((current) => ({
          ...current,
          busyAction: null,
          error: messageFor(error),
        }))
      }
    },
    [refresh],
  )

  const disconnect = useCallback(async () => {
    const connection = state.data?.connection
    if (!connection) return

    setState((current) => ({ ...current, busyAction: 'disconnect', error: null }))
    try {
      await apiRequest(`/api/v1/integrations/${connection.id}`, {
        method: 'DELETE',
      })
      await refresh()
      setState((current) => ({
        ...current,
        busyAction: null,
        notice: 'Mailbox disconnected and its stored OAuth tokens removed.',
      }))
    } catch (error) {
      setState((current) => ({
        ...current,
        busyAction: null,
        error: messageFor(error),
      }))
    }
  }, [refresh, state.data?.connection])

  return {
    ...state,
    refresh,
    startConnection,
    sync,
    confirmImport,
    ignoreImport,
    disconnect,
  }
}
