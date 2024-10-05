import { type IElementProps } from "@interfaces/element-props"
import { cn } from "@lib/class-names"
import { BaseSideMenu } from "./base-side-menu"

import { BaseCol } from "@components/base-col"
import { BaseRow } from "@components/base-row"
import { ThemeLink } from "@components/link/theme-link"

import { SITE_NAME, UPDATED, VERSION } from "@consts"
import { CircleLeftIcon } from "@icons/circle-left-icon"
import { type IOpenChange } from "@interfaces/open-change"
import { getCopyright } from "@lib/copyright"
import {
  H2_CLS,
  H3_CLS,
  STAGGER_ANIMATION_DURATION_S,
  TAB_ANIMATION_DURATION_S,
} from "@theme"
import { gsap } from "gsap"
import {
  Children,
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ForwardedRef,
} from "react"

 
import { Button, type IButtonProps } from "@components/shadcn/ui/themed/button"

import type { IModuleInfo } from "@interfaces/module-info"
import { nanoid } from "@lib/utils"
 
import { ToolbarTabButton } from "./toolbar-tab-button"
import { ITab, TabChange } from "@components/tab-provider"

export const SIDE_OVERLAY_CLS = cn(
  "fixed inset-0 z-overlay bg-overlay/30 backdrop-blur-sm duration-500 ease-in-out",
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
)

const BASE_LINE_CLS = cn("rounded-full absolute left-0 top-0 block")

const LINE_CLS = cn(BASE_LINE_CLS, "z-20 bg-primary")
const HIGHLIGHT_CLS = cn(BASE_LINE_CLS, "z-10 bg-foreground/20")

const HIGHLIGHT_WIDTH = 2

const FileMenuButton = forwardRef(function FileMenuButton(
  {
    className,
    variant = "ghost",
    size = "lg",
    justify = "start",
    animation = "color",
    children,
    ...props
  }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  //const [hover, setHover] = useState(false)
  //const [down, setDown] = useState(false)
  const c = Children.toArray(children)
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      justify={justify}
      animation={animation}
      ripple={false}
      className={cn(
        "w-full gap-x-3 px-3 text-foreground/75 data-[selected=false]:hover:text-foreground data-[selected=true]:text-foreground",
        className,
      )}
      role="tab"
      {...props}
    >
      <span className="flex w-6 shrink-0 flex-row">{c.length > 1 && c[0]}</span>
      {c[c.length - 1]}
    </Button>
  )
})

const SideMenuButton = forwardRef(function SideMenuButton(
  { children, ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <FileMenuButton
      animation="none"
      className="data-[selected=true]:font-semibold"
      {...props}
    >
      {children}
    </FileMenuButton>
  )
})

interface ISideBarButtonProps extends IElementProps {
  tabs: ITab[]
  activeTabIndex: number
  defaultWidth?: number
  onTabChange?: TabChange
}

export function SideBarButtons({
  tabs,
  activeTabIndex,
  defaultWidth = 2.25,
  onTabChange,
  className,
}: ISideBarButtonProps) {
  const [highlight, setHighlight] = useState(-1)
  const [highlightTabProps, setHighlightTabProps] = useState<[number, number]>([
    -1, -1,
  ])

  const [tabUnderlineProps, setTabUnderlineProps] = useState<[number, number]>([
    -1, -1,
  ])

  const tabLineRef1 = useRef<HTMLSpanElement>(null)
  const tabLineRef2 = useRef<HTMLSpanElement>(null)
  const tabLineRef3 = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (highlight > -1) {
      setHighlightTabProps([highlight * defaultWidth, defaultWidth])
    } else {
      setHighlightTabProps([-1, -1])
    }
  }, [highlight])

  useEffect(() => {
    if (activeTabIndex > -1) {
      setTabUnderlineProps([activeTabIndex * defaultWidth, defaultWidth])
    }
  }, [activeTabIndex])

  useEffect(() => {
    gsap.timeline().to([tabLineRef1.current, tabLineRef2.current], {
      left: 3,
      height: `${tabUnderlineProps[1]}rem`,
      transform: `translateY(${tabUnderlineProps[0]}rem)`,
      duration: TAB_ANIMATION_DURATION_S,
      stagger: STAGGER_ANIMATION_DURATION_S,
      ease: "power2.out",
    })
  }, [tabUnderlineProps])

  const buttons = (
    <BaseCol className="ml-2" role="tablist">
      {tabs.map((tab, ti) => {
        return (
          <SideMenuButton
            key={ti}
            size="none"
            selected={ti === activeTabIndex}
            onClick={() => {
              onTabChange?.({index:ti,tab})
            }}
            onMouseEnter={() => {
              setHighlight(ti)
            }}
            onMouseLeave={() => setHighlight(-1)}
            variant=""
            style={{ height: `${defaultWidth}rem` }}
          >
            {tab.icon && tab.icon}
            {tab.name}
          </SideMenuButton>
        )
      })}
    </BaseCol>
  )

  return (
    <div className={cn("relative", className)}>
      {buttons}
      <span
        ref={tabLineRef1}
        className={LINE_CLS}
        style={{
          left: 3,
          width: HIGHLIGHT_WIDTH,
        }}
      />
      <span
        ref={tabLineRef2}
        className={LINE_CLS}
        style={{
          left: 3,
          width: HIGHLIGHT_WIDTH,
        }}
      />

      <span
        ref={tabLineRef3}
        className={cn(HIGHLIGHT_CLS, "trans-300 transition-opacity", [
          highlightTabProps[0] !== -1,
          "opacity-100",
          "opacity-0",
        ])}
        style={{
          left: 3,
          width: HIGHLIGHT_WIDTH,
          height: `${highlightTabProps[1]}rem`,
          transform: `translateY(${highlightTabProps[0]}rem)`,
        }}
      />
    </div>
  )
}

interface IFileMenu extends IElementProps, IOpenChange {
  tabs?: ITab[]
  info?: IModuleInfo
}

export function FileMenu({
  open = false,
  onOpenChange,
  tabs = [],
  info,
}: IFileMenu) {
  const [selectedTab, setSelectedTab] = useState(0)

  const _tabs: ITab[] = [
    ...tabs,
    {
      id: nanoid(),
      name: "About",
      content: (
        <BaseCol className="gap-y-8 p-8 text-sm">
          <h2 className={H2_CLS}>About</h2>
          <BaseCol className="gap-y-1 rounded-md bg-accent/50 p-4 text-sm">
            <p className="font-medium">{SITE_NAME}</p>
            <p>{`Version ${VERSION}`}</p>
            <p>{`Updated ${UPDATED}`}</p>

            <p>
              {getCopyright()}{" "}
              <ThemeLink
                href="https://www.antonyholmes.dev"
                aria-label="Email Antony Holmes"
              >
                Antony Holmes
              </ThemeLink>
              . All rights reserved.
            </p>
          </BaseCol>
          {info && (
            <BaseCol className="gap-y-1 text-sm">
              <h3 className={H3_CLS}>Module</h3>
              <p>{info.name}</p>
              <p>{`Version ${info.version}`}</p>
              <p>{info.copyright}</p>
            </BaseCol>
          )}
          <BaseCol className="gap-y-1 text-sm">
            <h3 className={H3_CLS}>Additional</h3>

            <p>
              This application is made possible by open source software and
              other services:
            </p>

            <ul className="flex flex-col flex-wrap gap-1 text-sm">
              <li>
                <ThemeLink href="https://astro.build/" aria-label="View tool">
                  Astro
                </ThemeLink>
              </li>
              <li>
                <ThemeLink href="https://reactjs.org" aria-label="View tool">
                  React
                </ThemeLink>
              </li>
              <li>
                <ThemeLink
                  href="https://tailwindcss.com/"
                  aria-label="View tool"
                >
                  Tailwind
                </ThemeLink>
              </li>
              <li>
                <ThemeLink
                  href="https://fontawesome.com/"
                  aria-label="View tool"
                >
                  Font Awesome
                </ThemeLink>
              </li>
              <li>
                <ThemeLink
                  href="https://fonts.google.com/"
                  aria-label="View tool"
                >
                  Google Fonts
                </ThemeLink>
              </li>
              {/* <li >
              <PrimaryLink href="https://www.w3.org/html" aria-label="View tool">
                HTML5
              </PrimaryLink>
            </li> */}
              {/* <li>
                <ThemeLink
                  href="https://www.npmjs.com"
                  aria-label="View tool"
                >
                  NPM
                </ThemeLink>
              </li> */}
              <li>
                <ThemeLink href="https://nodejs.org/" aria-label="View tool">
                  Node.js
                </ThemeLink>
              </li>
              <li>
                <ThemeLink href="https://go.dev/" aria-label="View tool">
                  Go
                </ThemeLink>
              </li>
              <li>
                <ThemeLink href="https://github.com" aria-label="View tool">
                  GitHub
                </ThemeLink>
              </li>
              <li>
                <ThemeLink
                  href="https://code.visualstudio.com"
                  aria-label="View tool"
                >
                  Visual Studio Code
                </ThemeLink>
              </li>

              {/* <li >
              <PrimaryLink href="https://www.cloudflare.com/">Cloudflare</PrimaryLink>
            </li> */}
            </ul>
          </BaseCol>
        </BaseCol>
      ),
    },
  ]

  return (
    <BaseSideMenu open={open} onOpenChange={onOpenChange} className="w-[48rem]">
      <ToolbarTabButton
        aria-label="Open File Menu"
        className="w-12 text-xs"
        size="tab"
        role="button"
        onClick={() => onOpenChange?.(true)}
      >
        File
      </ToolbarTabButton>

      <BaseRow className="h-full">
        <BaseCol className="h-full w-1/3 shrink-0 bg-accent/50 px-2 py-4 text-sm">
          <div className="ml-2">
            <FileMenuButton onClick={() => onOpenChange?.(false)}>
              <CircleLeftIcon className="fill-foreground" w="w-5" />
              <span>Close</span>
            </FileMenuButton>
          </div>

          <div className="p-8">
            <hr className="border-border" />
          </div>
          <SideBarButtons
            tabs={_tabs}
            activeTabIndex={selectedTab}
            onTabChange={selectedTab=>setSelectedTab(selectedTab.index)}
          />
        </BaseCol>
        <div className="grow">
          {selectedTab !== -1 && _tabs[selectedTab].content}
        </div>
      </BaseRow>
    </BaseSideMenu>
  )
}
