import {
  AlertsContext,
  AlertsProvider,
  makeAlertFromAxiosError,
} from '@components/alerts/alerts-provider'
import {
  FORWARD_DELAY_MS,
  makeSignedInAlert,
  SignInLayout,
} from '@layouts/signin-layout'
import {
  AUTHORIZE_ROUTE,
  bearerHeaders,
  EDB_TOKEN_PARAM as EDB_JWT_PARAM,
  MYACCOUNT_ROUTE,
  SESSION_PASSWORDLESS_SIGNIN_URL,
} from '@modules/edb'

//import { useAuth0 } from "@auth0/auth0-react"
import { routeChange } from '@lib/utils'
import { AccountSettingsProvider } from '@providers/account-settings-provider'

import { getAccessToken } from '@auth0/nextjs-auth0'
import { useUser } from '@auth0/nextjs-auth0/client'
import { QCP } from '@query'
import { useQueryClient } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useContext, useEffect } from 'react'
import type { ICallbackJwtPayload } from './verify'

// async function signIn(jwt: string): Promise<AxiosResponse> {
//   console.log("signin")

//   return await queryClient.fetchQuery("signin", async () => {
//     //const callbackUrl = `${SITE_URL}/login`

//     return axios.post(
//       SESSION_PASSWORDLESS_SIGNIN_URL,
//       {},

//       {
//         headers: bearerHeaders(jwt),
//         withCredentials: true,
//       },
//     )
//   })
// }

function SignInPage() {
  const queryParameters = new URLSearchParams(window.location.search)
  const jwt = queryParameters.get(EDB_JWT_PARAM) ?? ''
  //const url = queryParameters.get(EDB_URL_PARAM) ?? MYACCOUNT_ROUTE
  const queryClient = useQueryClient()

  const { user, error, isLoading } = useUser()

  const [, alertDispatch] = useContext(AlertsContext)
  //const [, acountDispatch] = useContext(AccountContext)

  async function signin() {
    if (!jwt) {
      return
    }

    try {
      // first validate jwt and ensure no errors
      await queryClient.fetchQuery({
        queryKey: ['signin'],
        queryFn: () =>
          axios.post(
            SESSION_PASSWORDLESS_SIGNIN_URL,
            {},

            {
              headers: bearerHeaders(jwt),
              withCredentials: true,
            }
          ),
      })

      alertDispatch({
        type: 'set',
        alert: makeSignedInAlert(),
      })

      // now extract visit url from token

      const jwtData = jwtDecode<ICallbackJwtPayload>(jwt)

      // url encoded in jwt to make it more tamper proof
      const visitUrl = jwtData.url

      setTimeout(() => {
        routeChange(`${AUTHORIZE_ROUTE}${visitUrl ? `?url=${visitUrl}` : ''}`)
      }, FORWARD_DELAY_MS)
    } catch (error) {
      // we encounted a login error
      alertDispatch({
        type: 'add',
        alert: makeAlertFromAxiosError(error as AxiosError),
      })
    }
  }

  useEffect(() => {
    signin()
  }, [])

  // const {
  //   isLoading,
  //   isAuthenticated,
  //   error,
  //   user,
  //   getIdTokenClaims,
  //   getAccessTokenSilently,
  //   loginWithRedirect,
  //   logout,
  // } = useAuth0()

  useEffect(() => {
    async function load() {
      const auth0Token = await getAccessToken()

      console.log('sliden', auth0Token)

      console.log(bearerHeaders(auth0Token.accessToken))

      const res = await queryClient.fetchQuery({
        queryKey: ['update'],
        queryFn: () =>
          axios.post(
            'http://localhost:8080/auth/auth0/validate', //SESSION_UPDATE_USER_URL,
            {},
            {
              headers: bearerHeaders(auth0Token.accessToken),
              //withCredentials: true,
            }
          ),
      })

      // what is returned is the updated user
      console.log(res.data.data)
    }

    if (user) {
      load()
    }
  }, [user])

  // if (isLoading) {
  //   return <div>Loading...</div>
  // }
  if (error) {
    return <div>Oops... {error.message}</div>
  }

  if (user) {
    return (
      <SignInLayout signInEnabled={false} visitUrl={MYACCOUNT_ROUTE}>
        <div>
          Hello {user.name} <a href="/api/auth/logout">Logout</a>
        </div>
      </SignInLayout>
    )
  } else {
    return (
      <SignInLayout signInEnabled={false} visitUrl={MYACCOUNT_ROUTE}>
        <a href="/api/auth/login">Login</a>
      </SignInLayout>
    )
  }

  // return (
  //   <SignInLayout alwaysShowSignIn={true} visitUrl={MYACCOUNT_ROUTE}>

  //   </SignInLayout>
  // )
}

export function SignInQueryPage() {
  return (
    <QCP>
      <AlertsProvider>
        <AccountSettingsProvider>
          <SignInPage />
        </AccountSettingsProvider>
      </AlertsProvider>
    </QCP>
  )
}
