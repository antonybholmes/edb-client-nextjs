import { SignedOutQueryPage } from '@components/pages/account/signedout'

import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('Signed Out')

export default function Page() {
  return <SignedOutQueryPage />
}
