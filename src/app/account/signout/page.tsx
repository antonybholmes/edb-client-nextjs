import { SignOutQueryPage } from '@components/pages/account/signout-auth0'

import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('Sign Out')

export default function Page() {
  return <SignOutQueryPage />
}
