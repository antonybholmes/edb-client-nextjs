import { SignedInQueryPage } from '@components/pages/account/signedin'

import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('Signed In')

export default function Page() {
  return <SignedInQueryPage />
}
