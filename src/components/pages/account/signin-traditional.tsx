'use client'

import {
  AlertsContext,
  AlertsProvider,
  makeAlertFromAxiosError,
} from '@components/alerts/alerts-provider'
import { FORWARD_DELAY_MS, makeSignedInAlert } from '@layouts/signin-layout'
import {
  SIGNEDIN_ROUTE,
  bearerHeaders,
  EDB_TOKEN_PARAM as EDB_JWT_PARAM,
  SESSION_PASSWORDLESS_SIGNIN_URL,
} from '@modules/edb'

import { AccountSettingsProvider } from '@providers/account-settings-provider'
import { AuthProvider } from '@providers/auth-provider'

import { SignIn } from '@components/auth/signin'
import { VCenterCol } from '@components/v-center-col'
import { QCP } from '@query'
import { useQueryClient } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { jwtDecode } from 'jwt-decode'
import { redirect } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
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
        redirect(`${SIGNEDIN_ROUTE}${visitUrl ? `?url=${visitUrl}` : ''}`)
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

  return (
    <VCenterCol className="grow">
      <SignIn />
    </VCenterCol>
  )
}

export function SignInQueryPage() {
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(window.location.href)
  }, [])

  if (!url) {
    return 'Getting page url...'
  }

  return (
    <QCP>
      <AuthProvider callbackUrl={url}>
        <AlertsProvider>
          <AccountSettingsProvider>
            <SignInPage />
          </AccountSettingsProvider>
        </AlertsProvider>
      </AuthProvider>
    </QCP>
  )
}
