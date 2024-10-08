import { BaseCol } from '@components/base-col'

import { HCenterRow } from '@components/h-center-row'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/shadcn/ui/themed/card'

import {
  getAccessTokenContents,
  isAdminFromAccessToken,
  type IAccessJwtPayload,
} from '@modules/edb'

import { useEdbAuth } from '@providers/edb-auth-provider'
import { useEffect, useState } from 'react'
import { SignInLayout, type ISignInLayoutProps } from './signin-layout'

function notAllowedContent() {
  return (
    <HCenterRow className="grow items-center">
      <BaseCol className="w-4/5 gap-y-8 text-sm lg:w-1/2 xl:w-1/3">
        <Card className="text-sm">
          <CardHeader>
            <CardTitle>Permission not granted</CardTitle>
          </CardHeader>
          <CardContent>
            You do not have sufficient permissions to view this page.
          </CardContent>
        </Card>
      </BaseCol>
    </HCenterRow>
  )
}

interface IRolesLayout extends ISignInLayoutProps {
  roles?: string[]
}

export function RolesLayout({
  roles,

  children,
  ...props
}: IRolesLayout) {
  //const queryParameters = new URLSearchParams(window.location.search)

  //const signedIn = userIsSignedIn()

  // some other page needs to force reload account details either
  // passwordless or regular so that on refresh this page can see if
  // the details have been loaded
  //const { accessToken } = useAccessTokenStore()
  const { refreshAccessToken } = useEdbAuth()

  const [accessToken, setAccessToken] = useState('')
  const [accessContents, setAccessContents] =
    useState<IAccessJwtPayload | null>(null)

  useEffect(() => {
    async function fetch() {
      setAccessToken(await refreshAccessToken())
    }

    fetch()
  }, [])

  useEffect(() => {
    if (accessToken) {
      setAccessContents(getAccessTokenContents(accessToken))
    }
  }, [accessToken])

  let notAllowed = true

  if (notAllowed) {
    notAllowed = !isAdminFromAccessToken(accessContents)
  }

  //if we are not admin assume cannot view page
  // and verify we can
  if (accessContents && notAllowed && roles) {
    for (let role of roles) {
      if (accessContents.roles.includes(role)) {
        notAllowed = false
        break
      }
    }
  }

  return (
    <SignInLayout {...props}>
      {notAllowed ? notAllowedContent() : children}
    </SignInLayout>
  )
}
