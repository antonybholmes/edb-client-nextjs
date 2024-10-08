'use client'

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CenteredCardContainer,
} from '@components/shadcn/ui/themed/card'

import { HeaderLayout } from '@layouts/header-layout'

import {
  APP_ACCOUNT_SIGNED_OUT_URL,
  EDB_ACCESS_TOKEN_COOKIE,
  EDB_SESSION_COOKIE,
  EDB_USER_COOKIE,
  SESSION_SIGNOUT_URL,
  SIGN_IN_ROUTE,
  TEXT_SIGN_IN,
} from '@modules/edb'

import { useAuth0 } from '@auth0/auth0-react'
import { ButtonLink } from '@components/link/button-link'
import { AuthProvider } from '@providers/auth-provider'

import { useEdbAuth } from '@providers/edb-auth-provider'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'

function SignOutPage() {
  const queryClient = useQueryClient()
  const { resetUser } = useEdbAuth()

  const { logout } = useAuth0()

  useEffect(() => {
    // call signout
    async function signout() {
      try {
        await axios.get(SESSION_SIGNOUT_URL)

        Cookies.remove(EDB_SESSION_COOKIE)
        Cookies.remove(EDB_ACCESS_TOKEN_COOKIE)
        Cookies.remove(EDB_USER_COOKIE)
        resetUser()
      } catch (err) {
        console.error(err)
      }

      // auth0 logout
      logout({ logoutParams: { returnTo: APP_ACCOUNT_SIGNED_OUT_URL } }) // window.location.href } })
    }

    signout()
  }, [])

  return (
    <HeaderLayout>
      <CenteredCardContainer>
        <Card>
          <CardHeader>
            <CardTitle>You have been signed out</CardTitle>
            <CardDescription>
              It&apos;s a good idea to close all browser windows.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-row items-start gap-2">
            <ButtonLink
              variant="theme"
              //className="w-full"
              size="lg"
              href={SIGN_IN_ROUTE}
              aria-label={TEXT_SIGN_IN}
            >
              {TEXT_SIGN_IN}
            </ButtonLink>
          </CardFooter>
        </Card>

        {/* <CreateAccountLink /> */}
      </CenteredCardContainer>
    </HeaderLayout>
  )
}

export function SignOutQueryPage() {
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(window.location.href)
  }, [])

  if (!url) {
    return 'Getting page url...'
  }

  return (
    <AuthProvider callbackUrl={url}>
      <SignOutPage />
    </AuthProvider>
  )
}
