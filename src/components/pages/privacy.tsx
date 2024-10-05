import { BaseCol } from "@components/base-col"
import { ContentDiv } from "@components/content-div"

import { HeaderLayout } from "@layouts/header-layout"

export function PrivacyPage() {
  return (
    <HeaderLayout name="Privacy">
      <ContentDiv className="mt-8 text-sm">
        <></>
        <BaseCol className="gap-y-4">
          <h1 className="text-2xl font-semibold">Privacy</h1>
          <p>
            Your privacy is important to us. This privacy statement explains the
            personal data we process, how we processes it, and for what
            purposes.
          </p>
          <p>
            These services are built to collect as little info about users as
            possible. We try to ensure that apps run as single page applications
            entirely within your web browser with minimal external calls to
            third party services. Thus your data remains local on your device
            and is not transmitted to our servers unless otherwise specified.
          </p>
          <p>
            We do not use cookies for tracking purposes. We may use cookies to
            establish a session if you sign in to make use of restricted
            service, but this is only for the purposes of establishing your
            identity. We do not track your activity once you are signed in.
          </p>
        </BaseCol>
        <></>
      </ContentDiv>
    </HeaderLayout>
  )
}
