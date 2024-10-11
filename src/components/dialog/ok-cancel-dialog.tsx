import { BaseCol } from '@components/base-col'
import { CloseIcon } from '@components/icons/close-icon'
import { Button } from '@components/shadcn/ui/themed/button'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/shadcn/ui/themed/dialog'

import { VCenterRow } from '@components/v-center-row'
import { APP_NAME, TEXT_CANCEL, TEXT_OK } from '@consts'
import { type IChildrenProps } from '@interfaces/children-props'
import { type IOpenChange } from '@interfaces/open-change'
import { cn } from '@lib/class-names'
import type { CSSProperties, ReactNode } from 'react'

import { osName } from 'react-device-detect'

// Try to determine the operating system
const OS = osName

export interface IModalProps extends IOpenChange, IChildrenProps {
  onReponse?: (response: string) => void
  buttonOrder?: 'auto' | 'primary-first' | 'primary-last'
}

export interface IOKCancelDialogProps extends IModalProps {
  title?: string
  description?: string
  mainVariant?: string
  onReponse?: (response: string) => void
  buttons?: string[]
  showClose?: boolean
  leftHeaderChildren?: ReactNode
  headerChildren?: ReactNode
  headerStyle?: CSSProperties
  innerClass?: string
}

export function OKCancelDialog({
  title = APP_NAME,
  description,

  open = true,
  onOpenChange,
  onReponse,
  showClose = true,
  buttons = [TEXT_OK, TEXT_CANCEL],
  buttonOrder = 'auto',
  mainVariant = 'theme',
  innerClass = 'gap-y-2',
  className = 'w-11/12 sm:w-3/4 md:w-8/12 lg:w-1/2 3xl:w-1/3',
  leftHeaderChildren,
  headerChildren,
  headerStyle,
  children,
}: IOKCancelDialogProps) {
  function _resp(resp: string) {
    onReponse?.(resp)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onEscapeKeyDown={() => _resp(TEXT_CANCEL)}
        className={cn('text-sm flex flex-col gap-y-2', className)}
      >
        <DialogHeader style={headerStyle}>
          <VCenterRow className="-mr-3 -mt-3 justify-between">
            <VCenterRow className="gap-x-2">
              {leftHeaderChildren && leftHeaderChildren}
              <DialogTitle>{title}</DialogTitle>
            </VCenterRow>
            <VCenterRow className="gap-x-2">
              {headerChildren && headerChildren}
              {showClose && (
                <Button
                  variant="muted"
                  size="icon-lg"
                  rounded="full"
                  pad="none"
                  onClick={() => _resp(TEXT_CANCEL)}
                >
                  <CloseIcon w="w-3 fill-foreground" />
                </Button>
              )}
            </VCenterRow>
          </VCenterRow>

          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <BaseCol className={innerClass}>{children}</BaseCol>

        {buttons.length > 0 && (
          <DialogFooter
            className={cn('pt-4 text-sm gap-x-2', [
              (buttonOrder === 'auto' && OS !== 'Windows') ||
                buttonOrder === 'primary-last',
              'flex-row-reverse justify-start',
              'justify-end',
            ])}
          >
            <Button
              variant={mainVariant}
              onClick={() => _resp(buttons[0])}
              className="w-24"
              size="lg"
            >
              {buttons[0]}
            </Button>

            {buttons.slice(1).map((button, bi) => (
              <Button
                key={bi}
                onClick={() => _resp(button)}
                className="w-24 justify-center"
                size="lg"
                variant="secondary"
              >
                {button}
              </Button>
            ))}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>

    // <TextDialog
    //   title={title}
    //   text={text}
    //   visible={visible}
    //   onCancel={onCancel}
    //   className={className}
    // >
    //   <VCenterRow className="mt-4 justify-end gap-x-2">
    //     <Button aria-label="OK" onClick={onClick}>
    //       OK
    //     </Button>

    //     <DialogCancel aria-label="Cancel" onClick={onCancel}>
    //       Cancel
    //     </DialogCancel>
    //   </VCenterRow>
    // </TextDialog>
  )
}
