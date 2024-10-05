import { Auth0Provider } from "@auth0/auth0-react"
import type { IChildrenProps } from "@interfaces/children-props"

const AUTH0_DOMAIN = import.meta.env.PUBLIC_AUTH0_DOMAIN
const AUTH0_CLIENT_ID = import.meta.env.PUBLIC_AUTH0_CLIENT_ID
const AUTH0_AUDIENCE = import.meta.env.PUBLIC_AUTH0_AUDIENCE

interface IProps extends IChildrenProps {
  callbackUrl?: string
}

export function AuthProvider({ callbackUrl, children }: IProps) {
  console.log("auth", AUTH0_DOMAIN, window.location.href)
  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        audience: AUTH0_AUDIENCE,
        scope: "openid name email",
        redirect_uri:
          callbackUrl !== undefined ? callbackUrl : window.location.href,
      }}
    >
      {children}
    </Auth0Provider>
  )
}
