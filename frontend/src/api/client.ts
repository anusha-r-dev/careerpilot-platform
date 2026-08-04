export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '')

export async function apiRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (response.status === 204) {
    return undefined as T
  }

  const body = (await response.json()) as {
    error?: string
    errors?: string[]
  }

  if (!response.ok) {
    throw new ApiError(
      body.error ??
        body.errors?.join(', ') ??
        `Request failed with HTTP ${response.status}.`,
      response.status,
    )
  }

  return body as T
}
