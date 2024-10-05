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
import { EDB_URL_PARAM, MYACCOUNT_ROUTE, TEXT_MY_ACCOUNT } from '@modules/edb'
import { useAccessTokenCache } from '@stores/use-access-token-cache'

import { useEffect, useState } from 'react'

export function AuthorizePage() {
  const queryParameters = new URLSearchParams(window.location.search)

  // used to reroute once authorized
  const url = queryParameters.get(EDB_URL_PARAM) ?? MYACCOUNT_ROUTE

  //const [, alertDispatch] = useContext(AlertContext)

  const { refreshAccessToken } = useAccessTokenCache()

  const [accessToken, setAccessToken] = useState('')

  useEffect(() => {
    async function fetch() {
      setAccessToken(await refreshAccessToken())
    }

    fetch()
  }, [])

  useEffect(() => {
    if (accessToken && url) {
      // if (process.env.NODE_ENV !== "development" && accessToken && url) {
      setTimeout(() => {
        routeChange(url)
      }, FORWARD_DELAY_MS)
    }
  }, [accessToken])

  return (
    <SignInLayout>
      <CenteredCardContainer>
        <Card>
          <CardHeader>
            <CardTitle>
              {accessToken !== ''
                ? 'You are signed in'
                : 'There was an issue signing you in'}
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
      {/* <HCenterRow className="grow items-center">
        <Card className="w-120">
          <CardHeader>
            <CardTitle>You are signed in</CardTitle>
            <CardDescription>
              To log out click the sign out button.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <PrimaryButtonLink
              className="w-full"
              href="/account/signout"
              aria-label="Sign In"
            >
              Sign Out
            </PrimaryButtonLink>
          </CardFooter>
        </Card>
      </HCenterRow> */}
    </SignInLayout>
  )
}
