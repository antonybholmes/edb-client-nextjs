import { SignInQueryPage } from '@components/pages/account/signin'

import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('Sign In')

export default function Page() {
  return <SignInQueryPage />
}
