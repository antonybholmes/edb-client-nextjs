import { Alerts } from '@components/alerts/alerts'

import { makeInfoAlert } from '@components/alerts/alerts-provider'

import { HeaderLayout, type IHeaderLayoutProps } from '@layouts/header-layout'

import {
  SIGN_IN_ROUTE,
  SIGN_UP_ROUTE,
  TEXT_SIGN_IN,
  TEXT_SIGN_UP,
} from '@modules/edb'

import { ThemeIndexLink } from '@components/link/theme-index-link'
import { useEffect, useState } from 'react'

import { useUserStore } from '@stores/use-user-store'
import { useQueryClient } from '@tanstack/react-query'
import { redirect } from 'next/navigation'

export const FORWARD_DELAY_MS = 2000

//https://uibakery.io/regex-library/email
export const EMAIL_PATTERN =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
export const USERNAME_PATTERN = /^[\w@.]{4,}/

export const NAME_PATTERN = /^[\w ]*/

export const TEXT_USERNAME_REQUIRED = 'A username is required'
export const TEXT_NAME_REQUIRED = 'A first name is required'
export const TEXT_USERNAME_DESCRIPTION =
  'A username must contain at least 3 characters, which can be letters, numbers, and any of @.-'
export const TEXT_EMAIL_ERROR = 'This does not seem like a valid email address'

export function CreateAccountLink() {
  return (
    <span className="w-full">
      Don&apos;t have an account?{' '}
      <ThemeIndexLink href={SIGN_UP_ROUTE} aria-label={TEXT_SIGN_UP}>
        Create an account
      </ThemeIndexLink>
    </span>
  )
}

export function SignInLink() {
  return (
    <span className="w-full">
      Already have an account?{' '}
      <ThemeIndexLink href={SIGN_IN_ROUTE} aria-label={TEXT_SIGN_IN}>
        {TEXT_SIGN_IN}
      </ThemeIndexLink>
    </span>
  )
}

export function makeSignedInAlert() {
  return makeInfoAlert({
    title: 'You are signed in',
  })
}

interface IFormInput {
  username: string
  password1: string
  //passwordless: boolean
  staySignedIn: boolean
}

export interface ISignInLayoutProps extends IHeaderLayoutProps {
  signInEnabled?: boolean

  // if signin is success, which page of the app to jump to
  // so that user is not left on signin page
  callbackUrl?: string
}

export function SignInLayout({
  signInEnabled = true,

  callbackUrl,
  className,
  headerLeftChildren,
  headerCenterChildren,
  children,
}: ISignInLayoutProps) {
  const [_callbackUrl, setCallbackUrl] = useState<string | undefined>(
    callbackUrl
  )

  const queryClient = useQueryClient()

  const { user } = useUserStore(queryClient)

  const signInRequired = signInEnabled && user.publicId === ''

  useEffect(() => {
    // the sign in callback includes this url so that the app can signin and
    // then return user to the page they were signing into as a convenience
    if (!_callbackUrl) {
      // default to returning to current page if none specified. This is not
      // advantageous on the signin page itself as it may appear as though
      // user has not signed in even when they have. In this case it should
      // be manually set.
      setCallbackUrl(window.location.href)
    }
  }, [])

  if (!_callbackUrl) {
    return null // 'Checking callback url...'
  }

  if (signInRequired) {
    console.log('redirect', _callbackUrl)
    redirect(`${SIGN_IN_ROUTE}?callbackUrl=${_callbackUrl}`)
  }

  return (
    <HeaderLayout
      className={className}
      headerLeftChildren={headerLeftChildren}
      headerCenterChildren={headerCenterChildren}
    >
      <Alerts />

      {/* <OKCancelDialog
          open={checkUserWantsToSignIn}
          title={APP_NAME}
          onReponse={r => {
            if (r === TEXT_OK) {
              setForceSignIn(true)
            }

            setCheckUserWantsToSignIn(false)
          }}
        >
          You are already signed in. Are you sure you want to sign in again?
        </OKCancelDialog> */}

      {children}
    </HeaderLayout>
  )
}
