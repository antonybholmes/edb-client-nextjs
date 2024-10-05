import {
  OKCancelDialog,
  type IModalProps,
} from "@components/dialog/ok-cancel-dialog"
import { APP_NAME } from "@consts"

export interface IProps extends IModalProps {
  open?: boolean
  title?: string
  buttons?: string[]
}

export function BasicAlertDialog({
  open = true,
  title,
  buttons = ["OK"],
  onReponse,
  children,
}: IProps) {
  // useEffect(() => {
  //   console.log(osName)
  // }, [])

  return (
    <OKCancelDialog
      open={open}
      title={title ?? APP_NAME}
      onReponse={onReponse}
      buttons={buttons}
    >
      {children}
    </OKCancelDialog>
  )
}
