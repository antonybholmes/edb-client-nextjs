import { type IButtonProps } from "@components/shadcn/ui/themed/button"
import { VCenterRow } from "@components/v-center-row"
import { type IOpenChange } from "@interfaces/open-change"
import { cn } from "@lib/class-names"
import { TRANS_COLOR_CLS } from "@theme"
import { BaseButton } from "./base-button"

// export const RADIO_SIZE = "18px"
// export const ORB_SIZE = "10px"
// export const ORB_OFFSET = "3px"

interface IRadioButtonProps extends IOpenChange, IButtonProps {
  index: number
  open: boolean
  onRadioClick: (index: number) => void
}

export function RadioButton({
  index,
  open,
  onRadioClick,
  children,
  ...props
}: IRadioButtonProps) {
  return (
    <VCenterRow className="gap-x-2 text-left">
      <BaseButton
        onClick={() => onRadioClick && onRadioClick(index)}
        className="group cursor-pointer"
        {...props}
      >
        {/* <div
          className={cn(
            `relative overflow-hidden rounded-full border bg-white`,
            [
              selected,
              "border-theme-600",
              cn("trans-300 transition-colors", [hover, "!border-theme-400", "!border-gray-300"]),
            ]
          )}
          style={{ width: RADIO_SIZE, height: RADIO_SIZE }}
        >
          {selected && (
            <div
              className="absolute rounded-full bg-theme-600"
              style={{
                width: ORB_SIZE,
                height: ORB_SIZE,
                left: ORB_OFFSET,
                top: ORB_OFFSET,
              }}
            />
          )}
        </div> */}

        <svg
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 shrink-0"
        >
          <circle
            cx="8"
            cy="8"
            r="7"
            className={cn(TRANS_COLOR_CLS, "fill-white", [
              open,
              "stroke-primary",
              "stroke-accent",
            ])}
          />

          {open && <circle cx="8" cy="8" r="4" className="fill-primary" />}
        </svg>
      </BaseButton>
      <span className="grow">{children}</span>
    </VCenterRow>
  )
}
