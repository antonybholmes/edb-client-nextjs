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

import { SIGN_IN_ROUTE, TEXT_SIGN_IN } from '@modules/edb'

import { ButtonLink } from '@components/link/button-link'
import { QCP } from '@query'

function SignedOutPage() {
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

export function SignedOutQueryPage() {
  return (
    <QCP>
      <SignedOutPage />
    </QCP>
  )
}
