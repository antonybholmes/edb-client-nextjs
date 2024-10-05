import { APP_ID } from "@consts"
import { DEFAULT_USER, fetchUser, type IUser } from "@modules/edb"
import { persistentAtom } from "@nanostores/persistent"
import { useStore } from "@nanostores/react"
import { useCallback } from "react"

export const PLOT_W = 600

// const DEFAULT_ACCOUNT_LOCAL_STORAGE = {
//   uuid: "",
//   username: "",
//   email: "",
//   firstName: "",
//   lastName: "",
// }

const localStorageMap = persistentAtom<IUser>(
  `${APP_ID}-account-v3`,
  {
    ...DEFAULT_USER,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  },
)

interface IUseUserStoreReturnType {
  user: IUser
  reloadUser: (accessToken: string) => Promise<IUser>
  refreshUser: (accessToken: string) => Promise<IUser>
  setUser: (user: IUser) => void
  resetUser: () => void
}

// https://www.geeksforgeeks.org/how-to-handle-async-operations-with-custom-hooks/

export function useUserStore(): IUseUserStoreReturnType {
  const user = useStore(localStorageMap)

  /**
   * Reload details from remote
   */
  const reloadUser = useCallback(
    async (accessToken: string) => {
      console.log("reload")
      const ret = await fetchUser(accessToken)
      setUser(ret)

      return ret
    },
    [user],
  )

  /**
   * Reload the user only if it appears user
   * is currently invalid, otherwise use the
   * cached version
   */
  const refreshUser = useCallback(
    async (accessToken: string) => {
      if (user.publicId !== "") {
        return user
      }

      const u = await reloadUser(accessToken)
      return u
    },
    [user],
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

  function setUser(user: IUser) {
    localStorageMap.set(user)
  }

  function resetUser() {
    localStorageMap.set({ ...DEFAULT_USER })
  }

  return { user, refreshUser, reloadUser, setUser, resetUser }
}
