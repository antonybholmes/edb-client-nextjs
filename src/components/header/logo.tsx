import { LogoIcon } from "@icons/logo-icon"
import { cn } from "@lib/class-names"
import { CENTERED_ROW_CLS, FOCUS_RING_CLS, HEADER_ICON_SIZE_CLS } from "@theme"

const LOGO_CLS = cn(FOCUS_RING_CLS, HEADER_ICON_SIZE_CLS, CENTERED_ROW_CLS)

export function Logo() {
  //const [hover, setHover] = useState(false)
  //const [down, setDown] = useState(false)

  return (
    <a href="/" className={LOGO_CLS} aria-label="Home">
      <div className="flex h-6 w-6 flex-row items-center justify-center rounded-full bg-theme fill-white">
        <LogoIcon />
      </div>
    </a>
  )
}
