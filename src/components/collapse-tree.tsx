import { BaseCol } from '@components/base-col'
import { ChevronRightIcon } from '@icons/chevron-right-icon'
import type { IChildrenProps } from '@interfaces/children-props'
import type { IClassProps } from '@interfaces/class-props'
import { type IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'
import gsap from 'gsap'
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { FileIcon } from './icons/file-icon'
import { FolderClosedIcon } from './icons/folder-closed-icon'
import { FolderOpenIcon } from './icons/folder-open-icon'
import { TrashIcon } from './icons/trash-icon'
import { CheckboxSmall } from './shadcn/ui/themed/check-box-small'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './shadcn/ui/themed/dropdown-menu'

import { getTabId, type ITab } from './tab-provider'
import { VCenterRow } from './v-center-row'
import { VScrollPanel } from './v-scroll-panel'

const SettingsContext = createContext<{
  value: ITab | undefined
  onValueChange: (tab: ITab) => void
  onCheckedChange: (tab: ITab, state: boolean) => void
}>({
  value: undefined,
  onValueChange: () => {},
  onCheckedChange: () => {},
})

interface ISettingsProviderProps extends IChildrenProps {
  value: ITab | undefined
  onValueChange: (tab: ITab) => void
  onCheckedChange?: (tab: ITab, state: boolean) => void
}

export const SettingsProvider = ({
  value = undefined,
  onValueChange,
  onCheckedChange,
  children,
}: ISettingsProviderProps) => {
  const [_value, setValue] = useState<ITab | undefined>(undefined)

  useEffect(() => {
    // sync internal value to external if it changes
    setValue(value)
  }, [value])

  //console.log("context", value, _value)

  function _onValueChange(tab: ITab) {
    setValue(tab)
    onValueChange?.(tab)
  }

  function _onCheckedChange(tab: ITab, state: boolean) {
    onCheckedChange?.(tab, state)
  }

  return (
    <SettingsContext.Provider
      value={{
        value: _value,
        onValueChange: _onValueChange,
        onCheckedChange: _onCheckedChange,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

interface ICollapseTreeProps extends IElementProps {
  tab: ITab
  value?: ITab
  onValueChange?: (tab: ITab) => void
  onCheckedChange?: (tab: ITab, state: boolean) => void
  asChild?: boolean
}

export function CollapseTree({
  tab,
  value,
  onValueChange,
  onCheckedChange,
  asChild = false,
  className,
}: ICollapseTreeProps) {
  // When not a direct child, will be absolute placed in its
  // own scroll container
  let ret: ReactNode = (
    <CollapseTreeNode
      tab={tab}
      className={cn('w-full', [!asChild, 'absolute'], className)}
      level={0}
    />
  )

  if (!asChild) {
    ret = (
      <VScrollPanel asChild={true} className="grow">
        {ret}
      </VScrollPanel>
    )
  }

  return (
    <SettingsProvider
      value={value}
      onValueChange={t => {
        onValueChange?.(t)
      }}
      onCheckedChange={(tab: ITab, state: boolean) => {
        onCheckedChange?.(tab, state)
      }}
    >
      {ret}
    </SettingsProvider>
  )
}

const CONTAINER_CLS = `relative h-8 rounded
  overflow-hidden cursor-pointer gap-x-1 outline-none
  data-[root=true]:text-sm data-[root=true]:font-semibold 
  data-[root=false]:data-[selected=true]:font-semibold`

const EXPAND_CLS =
  'flex flex-row items-center justify-start outline-none ring-0 aspect-square w-3 h-3 shrink-0 grow-0'

const ICON_CLS =
  'flex flex-row items-center justify-start outline-none ring-0 aspect-square w-4 h-4 shrink-0 grow-0'

interface ICollapseTreeNodeProps extends IClassProps {
  tab: ITab
  level: number
}

function CollapseTreeNode({ tab, level, className }: ICollapseTreeNodeProps) {
  const {
    value,
    onValueChange: onValueChanged,
    onCheckedChange,
  } = useContext(SettingsContext)

  const [isOpen, setIsOpen] = useState(!tab.children || tab.isOpen)
  const [hover, setHover] = useState(false)
  const [focus, setFocus] = useState(false)
  //const [buttonHover, setButtonHover] = useState(false) //level === 0 || (tab.isOpen??true))
  //const [buttonFocus, setButtonFocus] = useState(false)
  const [secondaryHover, setSecondaryHover] = useState(false)
  const [secondaryFocus, setSecondaryFocus] = useState(false) //level === 0 || (tab.isOpen??true))
  const contentRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const tabId = getTabId(tab)
  const valueId = getTabId(value)

  const selected = tabId === valueId
  const dataMenu = menuOpen ? 'open' : 'closed'
  const closable = tab.closable ?? true

  useEffect(() => {
    if (!contentRef || !contentRef.current) {
      return
    }

    const content = contentRef.current

    gsap.timeline().to(content, {
      height: isOpen ? 'auto' : 0,
      duration: 0,
      ease: 'power2.out',
    })
  }, [isOpen])

  //console.log(tab.name, tab.id, value?.id)

  let icon: ReactNode = tab.icon

  if (!icon) {
    if (tab.children) {
      if (isOpen) {
        icon = <FolderOpenIcon fill="fill-sky-400" />
      } else {
        icon = <FolderClosedIcon fill="fill-sky-400" />
      }
    } else {
      icon = <FileIcon />
    }
  }

  return (
    <BaseCol className={cn('w-full text-xs', className)}>
      {tab.name !== '' && (
        <VCenterRow
          className={cn(CONTAINER_CLS, [
            !secondaryHover,
            [
              hover && !menuOpen,
              'bg-accent/50',
              [
                (selected || focus) && !secondaryFocus && !menuOpen,
                'bg-theme/20',
              ],
            ],
          ])}
          style={{
            paddingLeft: `${(level + 1) * 0.5 + (tab.children ? 0 : 1.25)}rem`,
            //paddingRight: `${tab.onDelete ? 2 : 0}rem`,
          }}
          data-root={level === 0}
          data-selected={selected}
          data-focus={focus}
          data-hover={hover}
          data-secondary-hover={secondaryHover}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onMouseEnter={() => {
            setHover(true)
          }}
          onMouseLeave={() => setHover(false)}
          onClick={() => {
            tab.onClick?.()
            onValueChanged(tab)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              tab.onClick?.()

              onValueChanged(tab)
            }
          }}
          tabIndex={0}
        >
          {tab.children && (
            <button
              data-open={isOpen}
              className={EXPAND_CLS}
              onClick={e => {
                if (closable && tab.children) {
                  setIsOpen(!isOpen)
                }
              }}
              data-root={level === 0}
              data-selected={selected}
              data-focus={focus}
              data-hover={hover}
              aria-label={tab.name}
            >
              <ChevronRightIcon
                className={cn('trans-300 transition-transform', [
                  isOpen,
                  'rotate-90',
                ])}
                aria-label="Open chevron"
              />
            </button>
          )}

          {tab.checked !== undefined && (
            <CheckboxSmall
              checked={tab.checked}
              onCheckedChange={state => {
                onCheckedChange?.(tab, state)
                //tab.onClick?.()
                onValueChanged(tab)
              }}
            />
          )}

          {icon && <span className={ICON_CLS}>{icon}</span>}

          <span className="grow truncate">{tab.name}</span>

          {tab.onDelete && (
            // <button
            //   className={cn(
            //     "w-8 h-8 shrink-0 rounded-md flex flex-row items-center justify-center fill-foreground",
            //     [hover, "opacity-100", "opacity-0"],
            //     [secondaryButtonHover, "bg-accent/50"],
            //   )}
            //   onMouseEnter={() => setSecondaryButtonHover(true)}
            //   onMouseLeave={() => setSecondaryButtonHover(false)}
            //   title={`Delete ${tab.name}`}
            //   onClick={() => tab.onDelete!()}
            // >
            //   <TrashIcon w="w-3.5" />
            // </button>

            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger
                className={cn(
                  'w-8 h-8 shrink-0 grow-0 rounded-md flex flex-row items-center justify-center fill-foreground outline-none group hover:bg-accent/50 focus:bg-accent/50 data-[menu=open]:bg-accent/50'
                )}
                onMouseEnter={() => setSecondaryHover(true)}
                onMouseLeave={() => setSecondaryHover(false)}
                onFocus={() => {
                  setSecondaryFocus(true)
                }}
                onBlur={() => {
                  setSecondaryFocus(false)
                }}
                name={`Delete ${tab.name}`}
                data-focus={focus}
                data-hover={hover}
                data-secondary-hover={secondaryHover}
                data-menu={dataMenu}
              >
                <span
                  className="text-sm invisible data-[menu=open]:visible data-[hover=true]:visible group-hover:visible group-focus:visible"
                  data-focus={focus}
                  data-hover={hover}
                  //data-button-focus={buttonFocus}
                  data-menu={dataMenu}
                >
                  ...
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                // onEscapeKeyDown={() => {
                //   setMenuOpen(false)
                // }}
                // onInteractOutside={() => {
                //   setMenuOpen(false)
                // }}
                // onPointerDownOutside={() => {
                //   setMenuOpen(false)
                // }}
                align="start"
                //className="fill-foreground"
              >
                <DropdownMenuItem
                  onClick={() => tab.onDelete!()}
                  aria-label="Set theme to light"
                >
                  <TrashIcon w="w-3.5" />

                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </VCenterRow>
      )}

      {tab.children && (
        <BaseCol ref={contentRef}>
          {tab.children.map((t, ti) => (
            <CollapseTreeNode tab={t} level={level + 1} key={ti} />
          ))}
        </BaseCol>
      )}
    </BaseCol>
  )
}

export function makeFoldersRootNode(name: string = 'Folders'): ITab {
  return {
    id: 'root',
    name: name,
    //icon: <FolderIcon />,
    isOpen: true,
    closable: true,
  }
}
