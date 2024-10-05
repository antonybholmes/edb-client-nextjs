import {
  EDB_ACCESS_TOKEN_COOKIE,
  fetchAccessTokenUsingSession,
  validateToken,
} from '@modules/edb'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'

//const localStorageMap = persistentAtom<string>(`${APP_ID}-access-token-v1`, "")

interface IUseAccessTokenStoreReturnType {
  accessToken: string
  //setAccount: (account: IAccount) => void
  refreshAccount: () => void
  resetAccount: () => void
  isLoading: boolean
  error: Error | null
}

// https://www.geeksforgeeks.org/how-to-handle-async-operations-with-custom-hooks/

export function useAccessTokenStore(): IUseAccessTokenStoreReturnType {
  //const accessToken = useStore(localStorageMap)//Cookies.get(EDB_ACCESS_TOKEN_COOKIE) ?? "" //useStore(localStorageMap)
  const [accessToken, setAccessToken] = useState('')
  const [error, setError] = useState<Error | null>(null)
  const [isRefreshed, setIsRefreshed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function fetch() {
    setIsLoading(true)

    const token = await fetchAccessTokenUsingSession()

    //localStorageMap.set(token)
    setAccessToken(token)

    setIsRefreshed(false)
    setIsLoading(false)
  }

  useEffect(() => {
    //sync
    Cookies.set(EDB_ACCESS_TOKEN_COOKIE, accessToken)
  }, [accessToken])

  useEffect(() => {
    if (!validateToken(accessToken)) {
      fetch()
    }
  }, [])

  // force a refresh from the server
  useEffect(() => {
    if (isRefreshed) {
      fetch()
    }
  }, [isRefreshed])

  function refreshAccount() {
    setIsRefreshed(true)
  }

  function resetAccount() {
    //localStorageMap.set("")
    setAccessToken('')
  }

  return { accessToken, refreshAccount, resetAccount, isLoading, error }
}

//check token exists
// let token: string = Cookies.get(EDB_ACCESS_TOKEN_COOKIE) ?? ""

// console.log(token)
// console.log("load access token test", validateToken(token))

// //if (!token) {
// //  return undefined
// //}

// // if token still valid, return it
// if (validateToken(token)) {
//   return token
// }

//check token exists
//token = localStorage.getItem(EDB_REFRESH_TOKEN_COOKIE)

// if token still valid, return it
//if (!validateToken(token)) {
//  return null
//}
