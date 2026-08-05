import { createContext } from 'react'
import type {
  AuthStatus,
  LoginPortal,
  RegistrationInput,
  User,
} from '../types'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  error: string | null
  login: (email: string, password: string, portal: LoginPortal) => Promise<User>
  register: (input: RegistrationInput) => Promise<User>
  logout: () => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
