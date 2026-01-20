"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface AsyncState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  immediate?: boolean
}

export function useAsync<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const { onSuccess, onError, immediate = false } = options

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  })

  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      }))

      try {
        const data = await asyncFunction(...args)

        if (mountedRef.current) {
          setState({
            data,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          })
          onSuccess?.(data)
        }

        return data
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))

        if (mountedRef.current) {
          setState({
            data: null,
            error: err,
            isLoading: false,
            isSuccess: false,
            isError: true,
          })
          onError?.(err)
        }

        return null
      }
    },
    [asyncFunction, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    })
  }, [])

  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args))
    }
  }, [immediate, execute])

  return {
    ...state,
    execute,
    reset,
  }
}

export function useMutation<T, Args extends unknown[] = []>(
  mutationFn: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  return useAsync(mutationFn, options)
}
