import { TEXT_OPEN } from "@consts"
import { OpenIcon } from "@icons/open-icon"
import { ToolbarIconButton } from "./toolbar-icon-button"

interface IProps {
  onOpenChange?: (open: boolean) => void
  showText?: boolean
  multiple?: boolean
  fileTypes?: string[]
}

export function ToolbarOpenFile({ onOpenChange, showText = false }: IProps) {
  return (
    <ToolbarIconButton onClick={() => onOpenChange?.(true)} title="Open file">
      <OpenIcon fill="fill-foreground" />
      {showText && <span>{TEXT_OPEN}</span>}
    </ToolbarIconButton>
  )
}
