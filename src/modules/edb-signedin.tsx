import { ComputerIcon } from '@components/icons/computer'
import { MoonIcon } from '@components/icons/moon-icon'
import { SignOutIcon } from '@components/icons/sign-out-icon'
import { SunIcon } from '@components/icons/sun'
import { UserIcon } from '@components/icons/user-icon'
import { Button } from '@components/shadcn/ui/themed/button'

import {
  DropdownMenu,
  DropdownMenuAnchorItem,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuSeparator,
} from '@components/shadcn/ui/themed/dropdown-menu'
import { truncate } from '@lib/text/text'

import { useSettingsStore, type Theme } from '@stores/use-settings-store'

import { EdbAuthContext } from '@providers/edb-auth-provider'
import { useQueryClient } from '@tanstack/react-query'
import { useContext, useEffect, useState } from 'react'
import {
  getAccessTokenContents,
  isAdminFromAccessToken,
  IUser,
  MYACCOUNT_ROUTE,
  SIGN_IN_ROUTE,
  SIGN_OUT_ROUTE,
  TEXT_MY_ACCOUNT,
  TEXT_SIGN_IN,
  TEXT_SIGN_OUT,
} from './edb'

export function EDBSignedIn() {
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)

  const { theme, applyTheme } = useSettingsStore()

  const [user, setUser] = useState<IUser | null>(null)

  const { getCachedUser, refreshAccessToken } = useContext(EdbAuthContext)
  const [accessToken, setAccessToken] = useState('')
  //const [accessContents, setAccessContents] = useState<IAccessJwtPayload | null >(null)

  useEffect(() => {
    async function fetch() {
      const accessToken = await refreshAccessToken()

      setUser(await getCachedUser(accessToken))

      setAccessToken(accessToken)
    }

    fetch()
  }, [])

  // useEffect(() => {
  //   if (accessToken) {
  //     setAccessContents(getAccessTokenContents(accessToken))
  //   }
  // }, [accessToken])

  //const account: IAccount = { ...DEFAULT_ACCOUNT }

  function clickTheme(theme: Theme) {
    //applySettings({ ...settings, theme })
    //console.log("te", theme)
    applyTheme(theme)
    setOpen(false)
  }

  // if (!Cookies.get(EDB_SESSION_COOKIE)) {
  //   return (
  //     <BasePrimaryButtonLink
  //       href="/account/signin"
  //       aria-label={TEXT_SIGN_IN}
  //       className="h-8 px-4 text-sm"
  //     >
  //       {TEXT_SIGN_IN}
  //     </BasePrimaryButtonLink>
  //   )
  // }

  if (!user) {
    return null
  }

  let name: string

  if (user.firstName) {
    name = user.firstName.split(' ')[0]
  } else {
    name = user.username
  }

  const isSignedIn = user.publicId !== '' //userIsSignedInWithSession()

  return (
    <>
      {/* {isAdminFromAccessToken(getAccessTokenContents(accessToken)) && (
        <a href={APP_ADMIN_USERS_URL}>Users</a>
      )} */}
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="trans"
            size="icon"
            rounded="full"
            selected={open}
            aria-label="Account"
            // @ts-ignore
            title="Account"
          >
            <UserIcon className="fill-white/90" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          onEscapeKeyDown={() => setOpen(false)}
          onInteractOutside={() => setOpen(false)}
          align="end"
          className="w-64"
        >
          {isSignedIn ? (
            <>
              {name && (
                <DropdownMenuLabel>
                  {truncate(name, { length: 25 })}
                </DropdownMenuLabel>
              )}

              <DropdownMenuAnchorItem
                href={MYACCOUNT_ROUTE}
                aria-label={TEXT_MY_ACCOUNT}
              >
                {TEXT_MY_ACCOUNT}
              </DropdownMenuAnchorItem>

              {/* <DropdownMenuItem
                  onClick={() => {
                    window.location.href = "/account/mypassword"
                  }}
                  aria-label="My Password"
                >
                  <></>
  
                  <span>My Password</span>
                </DropdownMenuItem> */}

              {isAdminFromAccessToken(getAccessTokenContents(accessToken)) && (
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = '/admin/users'
                  }}
                  aria-label="Admin users"
                >
                  Users
                </DropdownMenuItem>
              )}

              <MenuSeparator />

              <DropdownMenuAnchorItem
                href={SIGN_OUT_ROUTE}
                aria-label={TEXT_SIGN_OUT}
              >
                <SignOutIcon className="w-4" />

                <>{TEXT_SIGN_OUT}</>
              </DropdownMenuAnchorItem>
            </>
          ) : (
            // <PrimaryButtonLink
            //   href={ROUTE_SIGN_IN}
            //   aria-label={TEXT_SIGN_IN}
            //   className=" text-sm"
            // >
            //   {TEXT_SIGN_IN}
            // </PrimaryButtonLink>

            <DropdownMenuItem
              onClick={() => {
                window.location.href = SIGN_IN_ROUTE
              }}
              aria-label={TEXT_SIGN_IN}
            >
              <span>{TEXT_SIGN_IN}</span>
            </DropdownMenuItem>
          )}

          <MenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem
                  onClick={() => clickTheme('light')}
                  aria-label="Set theme to light"
                  checked={theme === 'light'}
                >
                  <SunIcon className="w-4 " />
                  <>Light theme</>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                  onClick={() => clickTheme('dark')}
                  aria-label="Set theme to dark"
                  checked={theme === 'dark'}
                >
                  <MoonIcon className="w-3.5" />
                  <>Dark theme</>
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                  onClick={() => clickTheme('system')}
                  aria-label="Set theme to system"
                  checked={theme === 'system'}
                >
                  <ComputerIcon className="w-4 -scale-x-100" />
                  <>System theme</>
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
