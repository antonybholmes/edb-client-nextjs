import { type IChildrenProps } from '@interfaces/children-props'
import {
  DEFAULT_USER,
  fetchAccessTokenUsingSession,
  fetchUser,
  IUser,
  validateToken,
} from '@modules/edb'

import { useQueryClient } from '@tanstack/react-query'
import {
  Context,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'

export interface IEdbAuthContext {
  reloadUser: (accessToken?: string) => Promise<IUser>
  getCachedUser: (accessToken?: string) => Promise<IUser>
  updateUser: (user: IUser) => void
  resetUser: () => void
  refreshAccessToken: () => Promise<string>
}

export const EdbAuthContext = createContext<IEdbAuthContext>({
  reloadUser: () => {
    return new Promise(resolve => resolve({ ...DEFAULT_USER }))
  },
  getCachedUser: () => {
    return new Promise(resolve => resolve({ ...DEFAULT_USER }))
  },
  updateUser: () => {},
  resetUser: () => {},
  refreshAccessToken: () => {
    return new Promise(resolve => resolve(''))
  },
})

export function EdbAuthProvider({ children }: IChildrenProps) {
  const queryClient = useQueryClient()

  const [user, setUser] = useState<IUser>({ ...DEFAULT_USER })

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

  /**
   * Reload details from remote
   */
  const reloadUser = useCallback(
    async (accessToken?: string) => {
      console.log('reload')
      if (!accessToken) {
        accessToken = await refreshAccessToken()
      }

      const ret = await fetchUser(accessToken, queryClient)
      updateUser(ret)

      return ret
    },
    [user]
  )

  /**
   * Reload the user only if it appears user
   * is currently invalid, otherwise use the
   * cached version
   */
  const getCachedUser = useCallback(
    async (accessToken?: string) => {
      if (user.publicId !== '') {
        return user
      }

      const u = await reloadUser(accessToken)
      return u
    },
    [user]
  )

  // // first load in the default values from the store
  // const [account, setAccountStore] = useState<IAccount>({
  //   uuid: localStore.uuid,
  //   username: localStore.username,
  //   email: localStore.email,
  //   firstName: localStore.firstName,
  //   lastName: localStore.lastName,
  // })

  // // when the in memory store is updated, trigger a write to localstorage.
  // // There may be an unnecessary write at the start where the localstorage
  // // is overwritten with a copy of itself, but this is ok.
  // useEffect(() => {
  //   // Write to store when there are changes
  //   localStorageMap.set({
  //     uuid: account.uuid,
  //     username: account.username,
  //     email: account.email,
  //     firstName: account.firstName,
  //     lastName: account.lastName,
  //   })
  // }, [account])

  function updateUser(user: IUser) {
    setUser(user)
  }

  function resetUser() {
    setUser({ ...DEFAULT_USER })
  }

  return (
    <EdbAuthContext.Provider
      value={{
        getCachedUser,
        reloadUser,
        updateUser,
        resetUser,
        refreshAccessToken,
      }}
    >
      {children}
    </EdbAuthContext.Provider>
  )
}

export function useEdbAuth(
  context: Context<IEdbAuthContext> = EdbAuthContext
): IEdbAuthContext {
  return useContext(context)
}
