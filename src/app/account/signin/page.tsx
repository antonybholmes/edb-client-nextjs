import { SignInQueryPage } from '@components/pages/account/signin-auth0'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('Sign In')

export default function Page() {
  return <SignInQueryPage />
}
