import { VCenterRow } from '@components/v-center-row'
import { cn } from '@lib/class-names'
import { type ReactNode } from 'react'

import { APP_NAME } from '@consts'
import type { IChildrenProps } from '@interfaces/children-props'
import { EDBSignedIn } from '@modules/edb-signedin'
import { HeaderMenu } from './header-menu'

export interface IHeaderChildrenProps {
  headerLeftChildren?: ReactNode
  headerCenterChildren?: ReactNode
  headerRightChildren?: ReactNode
}

export interface IHeaderProps extends IHeaderChildrenProps, IChildrenProps {
  name?: string
  tab?: string
}

export function Header({
  className = 'bg-gradient-to-r from-blue-500 to-indigo-500',
  headerLeftChildren,
  headerRightChildren,
  children,
}: IHeaderProps) {
  //const [, setScrollY] = useState(0)
  //const [showMenu, setShowMenu] = useState(false)

  // const handleScroll = () => {
  //   setScrollY(window.scrollY)
  // }

  //useWindowScrollListener(handleScroll)

  // useWindowResize(({ width, height }) => {
  //   // If larger than medium, auto close menu
  //   if (width > 800) {
  //     setShowMenu(false)
  //   }
  // })

  // function onClick() {
  //   setShowMenu(!showMenu) //toggleHeight()
  // }

  return (
    <header className={cn('text-white grid grid-cols-3 h-12', className)}>
      <VCenterRow className="gap-x-2">
        {/* <HeaderMenuPopover /> */}
        <HeaderMenu />
        {/* <HeaderMenuSheet />   */}
        {/* <Logo /> */}

        <VCenterRow className="hidden md:flex gap-x-4 shrink-0">
          <a className="font-semibold" href="/">
            {APP_NAME}
          </a>
          {headerLeftChildren && (
            <span className="shrink-0 h-6 border-l-2 border-white/50"></span>
          )}
        </VCenterRow>
        {headerLeftChildren}
      </VCenterRow>

      <VCenterRow className="justify-center">{children}</VCenterRow>

      <VCenterRow className="gap-x-2 justify-end pr-2">
        {headerRightChildren}

        <EDBSignedIn />
        {/* <ThemeMenu /> */}
      </VCenterRow>
    </header>
  )
}
