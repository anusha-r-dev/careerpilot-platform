import {
  useCallback,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'
import { ApiError, apiRequest } from '../api/client'
import type {
  AuthStatus,
  LoginPortal,
  RegistrationInput,
  User,
} from '../types'
import { AuthContext } from './auth-context'

interface AuthState {
  status: AuthStatus
  user: User | null
  error: string | null
}

type AuthAction =
  | { type: 'loading' }
  | { type: 'authenticated'; user: User }
  | { type: 'anonymous' }
  | { type: 'clear_error' }
  | { type: 'error'; message: string }

const initialState: AuthState = {
  status: 'loading',
  user: null,
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'loading':
      return { ...state, status: 'loading', error: null }
    case 'authenticated':
      return { status: 'authenticated', user: action.user, error: null }
    case 'anonymous':
      return { status: 'anonymous', user: null, error: null }
    case 'clear_error':
      return { ...state, error: null }
    case 'error':
      return { status: 'anonymous', user: null, error: action.message }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    let mounted = true

    apiRequest<{ user: User }>('/api/v1/session')
      .then((response) => {
        if (mounted) {
          dispatch({ type: 'authenticated', user: response.user })
        }
      })
      .catch((error) => {
        if (!mounted) {
          return
        }

        if (error instanceof ApiError && error.status === 401) {
          dispatch({ type: 'anonymous' })
        } else {
          dispatch({
            type: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'The current session could not be checked.',
          })
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string, portal: LoginPortal) => {
      dispatch({ type: 'loading' })

      try {
        const response = await apiRequest<{ user: User }>('/api/v1/session', {
          method: 'POST',
          body: JSON.stringify({ session: { email, password, portal } }),
        })
        dispatch({ type: 'authenticated', user: response.user })
        return response.user
      } catch (error) {
        dispatch({
          type: 'error',
          message:
            error instanceof Error ? error.message : 'Sign in was unsuccessful.',
        })
        throw error
      }
    },
    [],
  )

  const register = useCallback(async (input: RegistrationInput) => {
    dispatch({ type: 'loading' })

    try {
      const response = await apiRequest<{ user: User }>(
        '/api/v1/registration',
        {
          method: 'POST',
          body: JSON.stringify({ registration: input }),
        },
      )
      dispatch({ type: 'authenticated', user: response.user })
      return response.user
    } catch (error) {
      dispatch({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Your account could not be created.',
      })
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiRequest<void>('/api/v1/session', { method: 'DELETE' })
    } finally {
      dispatch({ type: 'anonymous' })
    }
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: 'clear_error' })
  }, [])

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  )
}
