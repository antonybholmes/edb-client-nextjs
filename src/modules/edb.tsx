import { APP_ID } from "@consts"

import type { IStringMap } from "@interfaces/string-map"
import type { UndefNullStr } from "@lib/text/text"
import { useQueryClient } from "@tanstack/react-query"

//import { useUserStore } from "@stores/account-store"

import axios from "axios"

import Cookies from "js-cookie"
import { jwtDecode, type JwtPayload } from "jwt-decode"

export interface IUser {
  publicId: string
  username: string
  email: string
  firstName: string
  lastName: string
  //roles: string
}

export const DEFAULT_USER: IUser = {
  publicId: "",
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  //roles: "",
}

export const EDB_API_URL = import.meta.env.PUBLIC_EDB_API_URL
export const APP_URL = import.meta.env.PUBLIC_SITE_URL

export const ROLE_SUPER = "Super"
export const ROLE_ADMIN = "Admin"

export const TEXT_SIGN_IN = "Sign In"
export const TEXT_PASSWORDLESS = "Passwordless"
export const TEXT_SIGN_OUT = "Sign Out"
export const TEXT_SIGN_UP = "Sign Up"
export const TEXT_CONNECTION_ISSUE = "Connection issue with server"

export const TEXT_MY_ACCOUNT = "My Account"

export const EDB_TOKEN_PARAM = "jwt"
export const EDB_URL_PARAM = "url"

export const TEXT_SERVER_ISSUE =
  "Hmm, the server does not seem to be available. Please try again at a later time."

export const SIGN_IN_ROUTE = "/account/signin"
export const SIGN_OUT_ROUTE = "/account/signout"
export const AUTHORIZE_ROUTE = "/account/authorize"
export const MYACCOUNT_ROUTE = "/account/myaccount"
export const SIGN_UP_ROUTE = "/signup"
export const RESET_PASSWORD_ROUTE = "/account/password/reset"

export const EDB_ACCESS_TOKEN_COOKIE = `${APP_ID}-access-token-v1`
export const EDB_SESSION_COOKIE = `${APP_ID}-session-v2`
export const EDB_USER_COOKIE = `${APP_ID}-user-v1`
//export const EDB_REFRESH_TOKEN_COOKIE = "edb-refresh-token"

//export const EDB_NAME_COOKIE = "edb-name"
//export const EDB_EMAIL_COOKIE = "edb-email"
//export const EDB_USERNAME_COOKIE = "edb-username"
//export const EDB_USER_INFO_COOKIE = "edb-user-info"
export const APP_VERIFY_EMAIL_URL = `${APP_URL}/account/verify`
export const APP_ADMIN_USERS_URL = `${APP_URL}/admin/users`

export const API_ABOUT_URL = `${EDB_API_URL}/about`
export const API_AUTH_URL = `${EDB_API_URL}/auth`
export const API_VERIFY_EMAIL_URL = `${API_AUTH_URL}/email/verify`
export const API_USER_URL = `${API_AUTH_URL}/users`
export const API_UPDATE_USER_URL = `${API_USER_URL}/update`

export const API_RESET_PASSWORD_URL = `${API_AUTH_URL}/passwords/reset`
export const API_RESET_EMAIL_URL = `${API_AUTH_URL}/email/reset`

// the urls that perform the updates when signed with a jwt
export const API_UPDATE_PASSWORD_URL = `${API_AUTH_URL}/passwords/update`
export const API_UPDATE_EMAIL_URL = `${API_AUTH_URL}/email/update`

export const API_DNA_URL = `${EDB_API_URL}/modules/dna`
export const API_DNA_ASSEMBLIES_URL = `${EDB_API_URL}/modules/dna/assemblies`
export const API_GENECONV_URL = `${EDB_API_URL}/modules/geneconv`

export const API_MUTATIONS_URL = `${EDB_API_URL}/modules/mutations`
export const API_MUTATIONS_DATABASES_URL = `${API_MUTATIONS_URL}/datasets`

export const API_ADMIN_URL = `${EDB_API_URL}/admin`
export const API_ADMIN_ROLES_URL = `${API_ADMIN_URL}/roles`
export const API_ADMIN_USERS_URL = `${API_ADMIN_URL}/users`
export const API_ADMIN_ADD_USER_URL = `${API_ADMIN_USERS_URL}/add`
export const API_ADMIN_UPDATE_USER_URL = `${API_ADMIN_USERS_URL}/update`
export const API_ADMIN_DELETE_USER_URL = `${API_ADMIN_USERS_URL}/delete`
export const API_ADMIN_USER_STATS_URL = `${API_ADMIN_USERS_URL}/stats`

export const API_GEX_URL = `${EDB_API_URL}/modules/gex`
export const API_GEX_PLATFORMS_URL = `${API_GEX_URL}/platforms`
export const API_GEX_VALUE_TYPES_URL = `${API_GEX_URL}/types`
export const API_GEX_DATASETS_URL = `${API_GEX_URL}/datasets`
export const API_GEX_EXP_URL = `${API_GEX_URL}/exp`

export const API_MOTIFS_URL = `${EDB_API_URL}/modules/motifs`
export const API_MOTIF_DATASETS_URL = `${API_MOTIFS_URL}/datasets`
export const API_MOTIF_SEARCH_URL = `${API_MOTIFS_URL}/search`

export const API_PATHWAY_URL = `${EDB_API_URL}/modules/pathway`
export const API_PATHWAY_GENES_URL = `${API_PATHWAY_URL}/genes`
export const API_PATHWAY_DATASET_URL = `${API_PATHWAY_URL}/dataset`
export const API_PATHWAY_DATASETS_URL = `${API_PATHWAY_URL}/datasets`
export const API_PATHWAY_OVERLAP_URL = `${API_PATHWAY_URL}/overlap`

export const API_GENES_URL = `${EDB_API_URL}/modules/genes`
export const API_GENES_ASSEMBLIES_URL = `${API_GENES_URL}/assemblies`

export const API_MUTATIONS_PILEUP_URL = `${API_MUTATIONS_URL}/pileup`
export const API_MICROARRAY_URL = `${EDB_API_URL}/modules/microarray`
export const API_MICROARRAY_EXPRESSION_URL = `${API_MICROARRAY_URL}/expression`
export const API_TOKEN_VALIDATE_URL = `${EDB_API_URL}/tokens/validate`

export const APP_SIGNIN_URL = `${APP_URL}${SIGN_IN_ROUTE}`
//export const APP_PASSWORDLESS_SIGNIN_URL = `${APP_URL}/account/passwordless/signin`
export const SESSION_URL = `${EDB_API_URL}/sessions`
export const SESSION_SIGNIN_URL = `${SESSION_URL}/signin`
export const SESSION_SIGNOUT_URL = `${SESSION_URL}/signout`
export const SESSION_PASSWORD_UPDATE_URL = `${SESSION_URL}/passwords/update`
export const SESSION_PASSWORDLESS_SIGNIN_URL = `${SESSION_URL}/passwordless/signin`
export const SESSION_ACCESS_TOKEN_URL = `${SESSION_URL}/tokens/access`
export const SESSION_USER_URL = `${SESSION_URL}/users`
export const SESSION_UPDATE_USER_URL = `${SESSION_USER_URL}/update`

// initiate resets
//export const SESSION_RESET_PASSWORD_URL = `${SESSION_URL}/password/reset`
//export const SESSION_UPDATE_EMAIL_URL = `${SESSION_URL}/email/reset`

export const API_SIGNUP_URL = `${EDB_API_URL}/signup`

export const APP_RESET_PASSWORD_URL = `${APP_URL}/account/password/reset`
export const APP_UPDATE_EMAIL_URL = `${APP_URL}/account/email/update`

export const COOKIE_EXPIRE_DAYS = 365

export const MIME_JSON = "application/json"

export const JSON_HEADERS = { "Content-Type": MIME_JSON }

export interface IRole {
  publicId: string
  name: string
  description: string
}

export interface IEdbJwtPayload extends JwtPayload {
  publicId: string
}

export interface IAccessJwtPayload extends IEdbJwtPayload {
  roles: string
}

export interface IResetJwtPayload extends IEdbJwtPayload {
  data?: string
}

// export function validateRefreshToken(): boolean {
//   //check token exists
//   return validateToken(localStorage.getItem(EDB_REFRESH_TOKEN_COOKIE))
// }

export function sessionCookieExists(): boolean {
  //check token exists

  return (
    Cookies.get(EDB_SESSION_COOKIE) !== undefined &&
    Cookies.get(EDB_SESSION_COOKIE) !== null
  )
}

export function validateAccessToken(): boolean {
  //check token exists
  return validateToken(Cookies.get(EDB_ACCESS_TOKEN_COOKIE))
}

export function validateToken(token: UndefNullStr): boolean {
  if (!token) {
    return false
  }

  try {
    return validateJwt(jwtDecode<IEdbJwtPayload>(token))
  } catch (err) {
    throw err
  }
}

export function validateJwt(jwt: IEdbJwtPayload, window: number = 30): boolean {
  if (!jwt) {
    return false
  }

  const jwtExpInSeconds = jwt.exp ?? 0

  const nowInSeconds = Math.floor(new Date().getTime() / 1000)

  // invalidate if now is within window seconds of expiry date.
  // we use 30 secs for example to ensure that the accesstoken is
  // valid into the future so that (hopefully) if a function makes
  // multiple uses of the the access token, it will not become
  // invalid during invocation
  return nowInSeconds < jwtExpInSeconds - window
}

/**
 * Checks a user's jwt is valid and if not, will attempt to renew it.
 *
 * @returns A valid jwt token or null if user is not allowed a token
 */
export async function fetchAccessTokenUsingSession(): Promise<string> {
  let token: string = ""

  const queryClient = useQueryClient()

  try {
    // token not valid so attempt to use session to refresh
    const res = await queryClient.fetchQuery({
      queryKey: ["access_token"],
      queryFn: () =>
        axios.post(
          SESSION_ACCESS_TOKEN_URL,
          {},
          {
            withCredentials: true,
          },
        ),
    })

    token = res.data.data.accessToken
  } catch (err) {
    console.error("cannot fetch access token from remote")
  }

  return token
}

export async function fetchUser(accessToken: string): Promise<IUser> {
  const queryClient = useQueryClient()

  let ret: IUser = { ...DEFAULT_USER }

  console.log(API_USER_URL)

  try {
    const res = await queryClient.fetchQuery({
      queryKey: ["info"],
      queryFn: () =>
        axios.post(
          API_USER_URL,
          {},
          {
            headers: bearerHeaders(accessToken),
            // the server is allowed access to the session in local
            // storage so it knows we are logged in. Since the session
            // is validated on the server, we don't need to provide
            // extra credentials. If we are logged in, we will get
            // the account info back.
            //withCredentials: true,
          },
        ),
    })

    console.log(res.data.data)

    ret = res.data.data
  } catch (err) {
    console.error("cannot fetch user from remote")
  }

  return ret
}

/**
 * Returns true if user has signed in and has a valid session.
 *
 * @returns true if signed in with session
 */
export function userIsSignedInWithSession(): boolean {
  return Boolean(Cookies.get(EDB_SESSION_COOKIE))
}

/**
 * Force load account info from server, so cache the the
 * account where possible.
 *
 * @returns The account info
 */
// export async function loadAccount(): Promise<IAccount> {
//   const res = await queryClient.fetchQuery("info", () =>
//     axios.get(SESSION_USER_URL, {
//       // the server is allowed access to the session in local
//       // storage so it knows we are logged in. Since the session
//       // is validated on the server, we don't need to provide
//       // extra credentials. If we are logged in, we will get
//       // the account info back.
//       withCredentials: true,
//     }),
//   )

//   const userInfo: IAccount = res.data.data

//   console.log("user", userInfo)

//   return userInfo
// }

// export async function loadAccount(): Promise<IUser> {
//   try {
//     const token = await fetchAccessToken()

//     const res = await queryClient.fetchQuery({
//       queryKey: ["info"],
//       queryFn: () =>
//         axios.post(
//           API_USER_URL,
//           {},
//           {
//             headers: bearerHeaders(token),
//             // the server is allowed access to the session in local
//             // storage so it knows we are logged in. Since the session
//             // is validated on the server, we don't need to provide
//             // extra credentials. If we are logged in, we will get
//             // the account info back.
//             //withCredentials: true,
//           },
//         ),
//     })

//     const userInfo: IUser = res.data.data

//     return userInfo
//   } catch (err) {
//     throw err
//   }
// }

// export async function loadAccountFromCookie(
//   force: boolean = false,
// ): Promise<IUser> {
//   if (!force) {
//     //check token exists
//     const token = Cookies.get(EDB_USER_COOKIE)

//     if (token) {
//       return JSON.parse(token)
//     }
//   }

//   try {
//     const userInfo: IUser = await loadAccount()

//     Cookies.set(EDB_USER_COOKIE, JSON.stringify(userInfo))

//     return userInfo
//   } catch (err) {
//     throw err
//   }
// }

interface IUseAccountReturnType {
  account: IUser
  refreshAccount: () => void
  isLoading: boolean
  error: Error | null
}

// export function useAccount(): IUseAccountReturnType {
//   const [account, setAccount] = useState<IAccount>({ ...DEFAULT_ACCOUNT })
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<Error | null>(null)

//   useEffect(() => {
//     async function fetch() {
//       try {
//         const ac = await loadAccountFromCookie()

//         setAccount(ac)
//       } catch (err) {
//         setError(err)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     if (isLoading) {
//       fetch()
//     }
//   }, [isLoading])

//   function refreshAccount() {
//     setIsLoading(true)
//   }

//   return { account, refreshAccount, isLoading, error }
// }

// export function useLoadUserInfo(
//   setUserInfo: Dispatch<SetStateAction<IUserInfo | null>>,
// ) {
//   useEffect(() => {
//     async function load() {
//       setUserInfo(await LoadUserInfo())
//     }

//     load()
//   }, [])
// }

// export async function getAuthJWT(): Promise<string> {
//   const dj = await queryClient.fetchQuery("login", async () => {
//     const data = new FormData()
//     data.append("email", "antony@antonyholmes.dev")
//     data.append("password", "tod4EwVHEyCRK8encuLE")

//     const res = await fetch(API_LOGIN_URL, {
//       method: "POST",
//       body: data,
//     })

//     if (!res.ok) {
//       throw null
//     }

//     return res.json()
//   })

//   console.log(dj)

//   const jwt = dj.data.jwt

//   const jwtData = jwtDecode(jwt)

//   console.log(jwtData)

//   return jwt
// }

/**
 * Log user out of EDB service
 */

/**
 * Log user out of EDB service
 */

export function bearerToken(token: UndefNullStr): string {
  return `Bearer ${token}`
}

export function bearerHeaders(accessToken: UndefNullStr): IStringMap {
  return {
    "Content-Type": MIME_JSON,
    Authorization: bearerToken(accessToken),
  }
}

// export function isAdmin(account: IAccount) {
//   for (let role of account.roles) {
//     if (role.includes(ROLE_SUPER) || role.includes(ROLE_ADMIN)) {
//       return true
//     }
//   }

//   return false
// }

export function rolesFromAccessToken(accessToken: string): string[] {
  if (accessToken === "") {
    return []
  }

  try {
    const contents = jwtDecode<IAccessJwtPayload>(accessToken)
    return contents.roles.split(" ")
  } catch (err) {
    return []
  }
}

export function isAdminFromAccessToken(
  contents: IAccessJwtPayload | null,
): boolean {
  if (!contents) {
    return false
  }

  const roles = contents.roles

  return roles.includes(ROLE_SUPER) || roles.includes(ROLE_ADMIN)
}

/**
 * Returns the payload of a JWT.
 *
 * @param jwt
 * @returns the payload based on the generic type T or null if
 *          there is an error.
 */
export function getJwtContents<T extends IEdbJwtPayload>(
  jwt: string,
): T | null {
  if (!jwt) {
    return null
  }

  try {
    return jwtDecode<T>(jwt)
  } catch (err) {
    return null
  }
}

/**
 * Given an access jwt, return the contents to look at roles, claims etc.
 *
 * @param jwt
 * @returns  the jwt payload or null if the jwt is invalid
 */
export function getAccessTokenContents(jwt: string): IAccessJwtPayload | null {
  return getJwtContents<IAccessJwtPayload>(jwt)
}

// export function isAdmin(claim: string) {
//   return claim.includes(ROLE_SUPER) || claim.includes(ROLE_ADMIN)
// }
