'use client'

import { ThemeIndexLink } from '@components/link/theme-index-link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CenteredCardContainer,
} from '@components/shadcn/ui/themed/card'
import { VCenterRow } from '@components/v-center-row'
import { FORWARD_DELAY_MS, SignInLayout } from '@layouts/signin-layout'
import { routeChange } from '@lib/utils'
import { CALLBACK_URL_PARAM, MYACCOUNT_ROUTE, TEXT_MY_ACCOUNT } from '@modules/edb'
import { QCP } from '@query'
import { useAccessTokenCache } from '@stores/use-access-token-cache'
import { useUserStore } from '@stores/use-user-store'
import { useQueryClient } from '@tanstack/react-query'

import { useEffect, useState } from 'react'

function SignedInPage() {
  const queryClient = useQueryClient()

  const { refreshAccessToken } = useAccessTokenCache(queryClient)

  const { user, refreshUser } = useUserStore(queryClient)

  const [callbackUrl, setCallbackUrl] = useState('')

  useEffect(() => {
    async function fetch() {
      const accessToken = await refreshAccessToken()

      refreshUser(accessToken)
    }

    console.log(window.location.search, 'ss')

    const queryParameters = new URLSearchParams(window.location.search)



    // used to reroute once authorized
    setCallbackUrl(queryParameters.get(CALLBACK_URL_PARAM)??"") // ?? MYACCOUNT_ROUTE)

    fetch()
  }, [])

 

  useEffect(() => {
    if (callbackUrl) {
      // if (process.env.NODE_ENV !== "development" && accessToken && url) {
      setTimeout(() => {
        routeChange(callbackUrl)
      }, FORWARD_DELAY_MS)
    }
  }, [callbackUrl])

  return (
    <SignInLayout>
      <CenteredCardContainer>
        <Card>
          <CardHeader>
            <CardTitle>
              {user.publicId !== ''
                ? `Hi ${user.firstName !== ''? user.firstName:user.email},`
                : 'There was an issue signing you in.'}
            </CardTitle>

            <CardDescription>
              You can now view your account profile.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <VCenterRow className="justify-end">
              <ThemeIndexLink
                href={MYACCOUNT_ROUTE}
                aria-label={TEXT_MY_ACCOUNT}
              >
                {TEXT_MY_ACCOUNT}
              </ThemeIndexLink>
            </VCenterRow>
          </CardContent>
        </Card>
      </CenteredCardContainer>
    </SignInLayout>
  )
}

export function SignedInQueryPage() {
  return (
    <QCP>
      <SignedInPage />
    </QCP>
  )
}