'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CenteredCardContainer,
} from '@components/shadcn/ui/themed/card'

import {
  AlertsContext,
  AlertsProvider,
  makeAlertFromAxiosError,
  makeInfoAlert,
} from '@components/alerts/alerts-provider'
import {
  EMAIL_PATTERN,
  NAME_PATTERN,
  SignInLayout,
  TEXT_EMAIL_ERROR,
  TEXT_NAME_REQUIRED,
  TEXT_USERNAME_DESCRIPTION,
  TEXT_USERNAME_REQUIRED,
  USERNAME_PATTERN,
} from '@layouts/signin-layout'

import {
  API_UPDATE_USER_URL,
  bearerHeaders,
  DEFAULT_USER,
  rolesFromAccessToken,
  TEXT_MY_ACCOUNT,
  type IUser,
} from '@modules/edb'

import {
  useContext,
  useEffect,
  useRef,
  useState,
  type BaseSyntheticEvent,
} from 'react'

import { PasswordDialog } from './password-dialog'

import { FormInputError } from '@components/input-error'
import { Button } from '@components/shadcn/ui/themed/button'
import { Form, FormField, FormItem } from '@components/shadcn/ui/themed/form'
import { VCenterRow } from '@components/v-center-row'
import { AccountSettingsProvider } from '@providers/account-settings-provider'

import { Input } from '@components/shadcn/ui/themed/input'
import { Label } from '@components/shadcn/ui/themed/label'

import { useAccessTokenCache } from '@stores/use-access-token-cache'

import { CenterRow } from '@components/center-row'
import { ReloadIcon } from '@components/icons/reload-icon'
import { QCP } from '@query'
import { useUserStore } from '@stores/use-user-store'
import { useQueryClient } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import type { IUserAdminView } from '../admin/edit-user-dialog'
import { EmailDialog } from './email-dialog'

// interface IFormInput {
//   publicId: string
//   username: string
//   email: string
//   firstName: string
//   lastName: string
//   roles: string
// }

function MyAccountPage() {
  const queryClient = useQueryClient()

  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  //const [password, setPassword] = useState("")
  const [, alertDispatch] = useContext(AlertsContext)

  //const [account, accountDispatch] = useContext(AccountContext)

  const btnRef = useRef<HTMLButtonElement>(null)

  const [user, setUser] = useState<IUser|null>(null)

  //const [account, setAccount] = useState<IAccount>({...DEFAULT_ACCOUNT})
  const { getCachedUser, reloadUser, updateUser } = useUserStore(queryClient)

  //const [accessToken, setAccessToken] = useState("")
  const { refreshAccessToken } = useAccessTokenCache(queryClient)

  const [roles, setRoles] = useState<string[]>([])
  //const roles = useMemo(() => rolesFromAccessToken(accessToken), [accessToken])

  const form = useForm<IUserAdminView>({
    defaultValues: {
      ...DEFAULT_USER,
      roles,
    },
  })

  useEffect(() => {
    async function fetch() {
      const accessToken = await refreshAccessToken()
      
      setUser(await getCachedUser(accessToken))

      setRoles(rolesFromAccessToken(accessToken))
    }

    fetch()
  }, [])

  // useEffect(()=> {
  //   if (accessToken && reload) {
  //     refreshAccount()
  //   }
  // },[accessToken])

  useEffect(() => {
    if (user && user.publicId !== '' && roles.length > 0) {
      form.reset({
        ...user,
        roles,
      })
    }
  }, [roles, user])

  async function updateRemoteUser(
    username: string,
    firstName: string,
    lastName: string
  ) {
    // force load of token in case it expired and needs
    // refresh
    const accessToken = await refreshAccessToken()

    try {
      // write update to remote
      const res = await queryClient.fetchQuery({
        queryKey: ['update'],
        queryFn: () =>
          axios.post(
            API_UPDATE_USER_URL, //SESSION_UPDATE_USER_URL,
            {
              username,
              firstName,
              lastName,
            },
            {
              headers: bearerHeaders(accessToken),
              //withCredentials: true,
            }
          ),
      })

      // what is returned is the updated user
      const user: IUser = res.data.data

      // force update
      updateUser(user)

      alertDispatch({
        type: 'set',
        alert: makeInfoAlert({
          title: 'Your account information was updated',
        }),
      })
    } catch (err) {
      console.log('update err', err)

      alertDispatch({
        type: 'add',
        alert: makeAlertFromAxiosError(err as AxiosError),
      })
    }
  }

  async function onSubmit(data: IUser, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()

    // if (password.length < 8) {
    //   alertDispatch({
    //     type: "add",
    //     alert: makeAlert({
    //       title:"Password",
    //       message: "Please enter your current password.",
    //       type: "error",
    //     }),
    //   })
    //   return
    // }

    updateRemoteUser(data.username, data.firstName, data.lastName)
  }

  // async function reloadAccount() {
  //   const account = await loadAccountFromCookie(true)

  //   setAccount(account)
  // }

  console.log('my account')

  return (
    <SignInLayout title={TEXT_MY_ACCOUNT} signInEnabled={true}>
      <>
        <PasswordDialog
          open={showPasswordDialog}
          onOpenChange={() => setShowPasswordDialog(false)}
          onReponse={() => setShowPasswordDialog(false)}
        />

        <EmailDialog
          open={showEmailDialog}
          onOpenChange={() => setShowEmailDialog(false)}
          onReponse={() => setShowEmailDialog(false)}
        />

        <CenteredCardContainer>
          <Card>
            <CardHeader>
              <VCenterRow className="justify-between">
                <CardTitle>{TEXT_MY_ACCOUNT}</CardTitle>
                <Button
                  onClick={async () => {
                    setUser(await reloadUser())
                  }}
                  variant="muted"
                  size="icon"
                  title="Reload account information"
                >
                  <ReloadIcon />
                </Button>
              </VCenterRow>
              <CardDescription>
                Update your account information. Some options cannot be changed
                unless you contact your administrator.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  className="flex flex-col gap-y-4 text-xs"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <Label className="font-medium">First Name</Label>
                    <FormField
                      control={form.control}
                      name="firstName"
                      rules={{
                        required: {
                          value: true,
                          message: TEXT_NAME_REQUIRED,
                        },
                        minLength: {
                          value: 1,
                          message: TEXT_NAME_REQUIRED,
                        },
                        pattern: {
                          value: NAME_PATTERN,
                          message: 'This does not seem like a valid name',
                        },
                      }}
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <Input
                            id="firstName"
                            className="w-full rounded-md"
                            placeholder="First Name"
                            //error={"name" in form.formState.errors}
                            {...field}
                          >
                            {/* {"firstName" in form.formState.errors && (
                              <WarningIcon />
                            )} */}
                          </Input>

                          <FormInputError
                            error={form.formState.errors.firstName}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <Label className="font-medium">Last Name</Label>
                    <FormField
                      control={form.control}
                      name="lastName"
                      rules={{
                        pattern: {
                          value: NAME_PATTERN,
                          message: 'This does not seem like a valid name',
                        },
                      }}
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <Input
                            id="lastName"
                            className="w-full rounded-md"
                            placeholder="Last Name"
                            //error={"name" in form.formState.errors}
                            {...field}
                          >
                            {/* {"lastName" in form.formState.errors && (
                              <WarningIcon />
                            )} */}
                          </Input>

                          <FormInputError
                            error={form.formState.errors.lastName}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  <span className="bg-border h-px w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <Label className="font-medium">Username</Label>
                    <FormField
                      control={form.control}
                      name="username"
                      rules={{
                        required: {
                          value: true,
                          message: TEXT_USERNAME_REQUIRED,
                        },
                        pattern: {
                          value: USERNAME_PATTERN,
                          message: TEXT_USERNAME_DESCRIPTION,
                        },
                      }}
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <Input
                            id="name"
                            placeholder="Username"
                            className="w-full rounded-md"
                            //error={"username" in form.formState.errors}
                            {...field}
                          >
                            {/* {"username" in form.formState.errors && (
                              <WarningIcon />
                            )} */}
                          </Input>
                          <FormInputError
                            error={form.formState.errors.username}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <Label className="font-medium">Email</Label>
                    <div className="flex flex-col md:flex-row md:items-center gap-x-4 gap-y-2 col-span-1">
                      <FormField
                        control={form.control}
                        name="email"
                        rules={{
                          required: {
                            value: true,
                            message: 'An email address is required',
                          },
                          pattern: {
                            value: EMAIL_PATTERN,
                            message: TEXT_EMAIL_ERROR,
                          },
                        }}
                        render={({ field }) => (
                          <FormItem className="grow">
                            <Input
                              id="email"
                              placeholder="Email"
                              readOnly
                              className="grow rounded-md"
                              {...field}
                            />
                            <FormInputError
                              error={form.formState.errors.email}
                            />
                          </FormItem>
                        )}
                      />
                      <Button
                        multiVariants="link"
                        onClick={() => setShowEmailDialog(true)}
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                  <span className="bg-border h-px w-full" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <Label className="font-medium">Roles</Label>
                    <FormField
                      control={form.control}
                      name="roles"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <Input
                            id="roles"
                            value={field.value.join(', ')}
                            className="w-full rounded-md"
                            placeholder="Roles"
                            readOnly
                            disabled
                            //{...field}
                          />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <Label className="font-medium">User Id</Label>
                    <FormField
                      control={form.control}
                      name="publicId"
                      render={({ field }) => (
                        <span className="text-muted-foreground">
                          {field.value}
                        </span>
                      )}
                    />
                  </div>

                  <button ref={btnRef} type="submit" className="hidden" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div></div>
                    <div></div>
                  </div>
                </form>
              </Form>
            </CardContent>
            {/* <CardFooter>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center w-full">
                <div></div>
                <div className="col-span-1">
                   <Button
                    variant="theme"
                    size="lg"
                    //className="w-full"
                    onClick={() => btnRef.current?.click()}
                  >
                    Save Changes
                  </Button> 
                </div>
              </div>
            </CardFooter> */}
          </Card>

          <div className="grid grid-cols-3">
            <div></div>
            <CenterRow>
              <Button
                variant="theme"
                size="lg"
                //className="w-full"
                onClick={() => btnRef.current?.click()}
              >
                Save Changes
              </Button>

              {/* <WarningButtonLink
              href={SIGN_OUT_ROUTE}
              aria-label={TEXT_SIGN_OUT}
              size="lg"
            >
              {TEXT_SIGN_OUT}
            </WarningButtonLink> */}
            </CenterRow>
            <div className="flex justify-end">
              <Button
                multiVariants="link"
                onClick={() => setShowPasswordDialog(true)}
                size="lg"
              >
                Change Password
              </Button>
            </div>
          </div>
        </CenteredCardContainer>
      </>
    </SignInLayout>
  )
}

export function MyAccountQueryPage() {
  return (
    <QCP>
      <AlertsProvider>
        <AccountSettingsProvider>
          <MyAccountPage />
        </AccountSettingsProvider>
      </AlertsProvider>
    </QCP>
  )
}
