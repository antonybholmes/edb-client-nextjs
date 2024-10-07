import { Auth0Provider } from '@auth0/auth0-react'
import type { IChildrenProps } from '@interfaces/children-props'
import { useEffect, useState } from 'react'

const AUTH0_DOMAIN = process.env.NEXT_PUBLIC_AUTH0_DOMAIN!
const AUTH0_CLIENT_ID = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!
const AUTH0_AUDIENCE = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE!

interface IProps extends IChildrenProps {
  callbackUrl?: string
}

export function AuthProvider({ callbackUrl, children }: IProps) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(callbackUrl !== undefined ? callbackUrl : window.location.href)
  }, [callbackUrl])

  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: AUTH0_AUDIENCE,
        //scope: 'openid name email',
        redirect_uri: url,
      }}
    >
      {children}
    </Auth0Provider>
  )
}
