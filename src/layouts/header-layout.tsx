import { Header, type IHeaderChildrenProps } from '@components/header/header'
import { cn } from '@lib/class-names'
import { type ILayoutProps } from '../interfaces/layout-props'
// import { Toaster } from "@components/shadcn/ui/toaster"

export interface IHeaderLayoutProps extends IHeaderChildrenProps, ILayoutProps {
  headerClassName?: string
}

export function HeaderLayout({
  headerLeftChildren,
  headerCenterChildren,
  headerRightChildren,
  headerClassName,
  className,
  children,
}: IHeaderLayoutProps) {
  return (
    <>
      <Header
        headerLeftChildren={headerLeftChildren}
        headerRightChildren={headerRightChildren}
        className={headerClassName}
      >
        {headerCenterChildren}
      </Header>
      <main
        className={cn('flex flex-col grow relative', className)}
        id="basic-layout-main"
      >
        {children}
      </main>
    </>
  )
}
