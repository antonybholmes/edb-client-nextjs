import { PrimaryButton } from "@components/button/primary-button"
import { WorkingIcon } from "@icons/working"
import { type IElementProps } from "@interfaces/element-props"

interface IProps extends IElementProps {
  onClick?: any
  isLoading?: boolean
}

export function LoadButton({ onClick, isLoading = false, children }: IProps) {
  return (
    <PrimaryButton onClick={onClick} className="gap-x-2">
      {children}
      {isLoading && <WorkingIcon className="h-5 w-5" />}
    </PrimaryButton>
  )
}
