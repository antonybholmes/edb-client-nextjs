import { HistoryContext } from '@components/history-provider'
import { useContext } from 'react'

import { RedoIcon } from '@components/icons/redo-icon'
import { UndoIcon } from '@components/icons/undo-icon'
import { IconButton } from '@components/shadcn/ui/themed/icon-button'

export function UndoShortcuts() {
  const [history, historyDispatch] = useContext(HistoryContext)

  return (
    <>
      <IconButton
        onClick={() => historyDispatch({ type: 'undo' })}
        aria-label="Undo"
        title={`Undo ${history.currentStep.name}`}
      >
        <UndoIcon />
      </IconButton>
      <IconButton
        onClick={() => historyDispatch({ type: 'redo' })}
        aria-label="Redo"
        title={`Redo ${history.currentStep.name}`}
      >
        <RedoIcon />
      </IconButton>
    </>
  )
}
