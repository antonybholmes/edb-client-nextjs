'use client'

import { IChildrenProps } from '@interfaces/children-props'
import { EdbAuthProvider } from '@providers/edb-auth-provider'
import { QCP } from '@query'

export function Providers({ children }: IChildrenProps) {
  // Add other providers nested here as needed
  return (
    <QCP>
      <EdbAuthProvider>{children}</EdbAuthProvider>
    </QCP>
  )
}
