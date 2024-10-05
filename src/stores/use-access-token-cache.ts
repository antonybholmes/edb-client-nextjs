import { fetchAccessTokenUsingSession, validateToken } from '@modules/edb'
import { QueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

export function useAccessTokenCache(queryClient: QueryClient) {
  const [accessToken, setAccessToken] = useState('')

  /**
   * Attempts to return cached access token, but if it determines
   * it is expired, attempts to refresh it.
   * @returns
   */
  const refreshAccessToken = useCallback(async () => {
    //console.log(accessToken, validateToken(accessToken))
    if (validateToken(accessToken)) {
      return accessToken
    }

    const token = await fetchAccessTokenUsingSession(queryClient)

    setAccessToken(token)

    return token
  }, [accessToken])

  return { refreshAccessToken }
}
