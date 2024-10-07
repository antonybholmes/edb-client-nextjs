'use client'

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
  API_AUTH0_VALIDATE_TOKEN_URL,
  AUTHORIZE_ROUTE,
  bearerHeaders,
  EDB_TOKEN_PARAM as EDB_JWT_PARAM,
  MYACCOUNT_ROUTE,
  SESSION_PASSWORDLESS_SIGNIN_URL,
} from '@modules/edb'

import { useAuth0 } from '@auth0/auth0-react'
import { routeChange } from '@lib/utils'
import { AccountSettingsProvider } from '@providers/account-settings-provider'
import { AuthProvider } from '@providers/auth-provider'

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
  //const url = queryParameters.get(EDB_URL_PARAM) ?? MYACCOUNT_ROUTE
  const queryClient = useQueryClient()

  const [, alertDispatch] = useContext(AlertsContext)
  //const [, acountDispatch] = useContext(AccountContext)

  async function signin() {
    const queryParameters = new URLSearchParams(window.location.search)
    const jwt = queryParameters.get(EDB_JWT_PARAM) ?? ''

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

  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    getIdTokenClaims,
    getAccessTokenSilently,
    loginWithRedirect,
    logout,
  } = useAuth0()

  useEffect(() => {
    async function load() {
      console.log('usser', user)

      const x = await getIdTokenClaims()

      console.log(x)

      const auth0Token = await getAccessTokenSilently()

      console.log('sliden', auth0Token)

      try {
        const res = await queryClient.fetchQuery({
          queryKey: ['update'],
          queryFn: () =>
            axios.post(
              API_AUTH0_VALIDATE_TOKEN_URL, //SESSION_UPDATE_USER_URL,
              {},
              {
                headers: bearerHeaders(auth0Token),
                //withCredentials: true,
              }
            ),
        })

        // what is returned is the updated user
        console.log(res.data.data)
      } catch (error) {
        console.error(error)
      }
    }

    if (isAuthenticated) {
      load()
    }
  }, [isAuthenticated])

  // if (isLoading) {
  //   return <div>Loading...</div>
  // }
  if (error) {
    return <div>Oops... {error.message}</div>
  }

  if (isAuthenticated && user) {
    console.log(user)
    return (
      <SignInLayout signInEnabled={false} visitUrl={MYACCOUNT_ROUTE}>
        <div>
          Hello {user.name}{' '}
          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.href } })
            }
          >
            Log out
          </button>
        </div>
      </SignInLayout>
    )
  } else {
    return (
      <SignInLayout signInEnabled={false} visitUrl={MYACCOUNT_ROUTE}>
        <button onClick={() => loginWithRedirect()}>Log in</button>
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
      <AuthProvider>
        <AlertsProvider>
          <AccountSettingsProvider>
            <SignInPage />
          </AccountSettingsProvider>
        </AlertsProvider>
      </AuthProvider>
    </QCP>
  )
}
