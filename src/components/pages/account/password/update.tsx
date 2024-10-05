import { Alerts } from "@components/alerts/alerts"
import {
  AlertsContext,
  AlertsProvider,
  makeAlertFromAxiosError,
  makeErrorAlert,
  makeInfoAlert,
} from "@components/alerts/alerts-provider"
import { BaseCol } from "@components/base-col"
import { PrimaryButton } from "@components/button/primary-button"
import { HCenterRow } from "@components/h-center-row"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/shadcn/ui/themed/card"
import { HeaderLayout } from "@layouts/header-layout"
import {
  API_UPDATE_PASSWORD_URL,
  bearerHeaders,
  EDB_TOKEN_PARAM,
  type IResetJwtPayload,
} from "@modules/edb"

import { jwtDecode } from "jwt-decode"
import { useContext, useRef, useState, type BaseSyntheticEvent } from "react"

import { WarningIcon } from "@components/icons/warning-icon"
import { FormInputError } from "@components/input-error"
import { Form, FormField, FormItem } from "@components/shadcn/ui/themed/form"
import { Input5 } from "@components/shadcn/ui/themed/input5"
import { TEXT_CONTINUE } from "@consts"
import { AccountSettingsProvider } from "@providers/account-settings-provider"

import {
  SignInLink,
  TEXT_USERNAME_DESCRIPTION,
  TEXT_USERNAME_REQUIRED,
  USERNAME_PATTERN,
} from "@layouts/signin-layout"
import type { NullStr } from "@lib/text/text"

import { QCP } from "@query"
import { useUserStore } from "@stores/use-user-store"
import { useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useForm } from "react-hook-form"
import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_PATTERN,
  TEXT_MIN_PASSWORD_LENGTH,
  TEXT_PASSWORD_DESCRIPTION,
} from "../password-dialog"

interface IFormInput {
  userId: string
  password1: string
  password2: string
  passwordless: boolean
}

function UpdatePasswordPage() {
  const queryClient = useQueryClient()

  const queryParameters = new URLSearchParams(window.location.search)

  // the one time token for changing the email address
  // this contains the signed user to be updated so even if the ui
  // is messed with, only that user can be changed
  const jwt: NullStr = queryParameters.get(EDB_TOKEN_PARAM) ?? null

  let jwtData: IResetJwtPayload | null = null

  if (jwt) {
    try {
      jwtData = jwtDecode<IResetJwtPayload>(jwt)
    } catch (error) {
      console.error("jwt parse error")
    }
  }

  //const { accessToken } = useAccessTokenStore()
  const { user } = useUserStore()

  const btnRef = useRef<HTMLButtonElement>(null)

  const [hasErrors, setHasErrors] = useState(false)

  // try to get name from either account or token
  const userId = jwtData?.publicId ?? ""

  // try to get name from either account or token
  const name = user.firstName ?? jwtData?.data ?? "User"

  const form = useForm<IFormInput>({
    defaultValues: {
      userId: userId,
      password1: "",
      password2: "",
      passwordless: false,
    },
  })

  //const [resetLinkSent, setResetLinkSent] = useState(false)
  //const [checkUserWantsToSendReset, setCheckUserWantsToSendReset] =
  //  useState<boolean>(false)
  //const [checkUserWantsToReset, setCheckUserWantsToReset] =
  //  useState<boolean>(false)

  //const [forceSignIn, setForceSignIn] = useState(0)

  const [, alertDispatch] = useContext(AlertsContext)

  // useEffect(() => {
  //   if (forceSignIn > 0) {
  //     btnRef.current?.click()
  //   }
  // }, [forceSignIn])

  // async function sendResetLink(data: IFormInput) {
  //   // question if user wants to keep signing in
  //   if (!forceSignIn && resetLinkSent) {
  //     setCheckUserWantsToSendReset(true)
  //     return
  //   }

  //   try {
  //     const res = await queryClient.fetchQuery("reset", async () => {
  //       return await axios.post(API_UPDATE_PASSWORD_URL, {

  //         password:data.password1,

  //       })
  //     })

  //     if (res.status !== STATUS_CODE_OK) {
  //       alertDispatch({
  //         type: "add",
  //         alert: makeErrorAlertFromResp(res.data),
  //       })
  //       return
  //     }

  //     alertDispatch({
  //       type: "set",
  //       alert: makeInfoAlert({
  //         title: "Please check your email for a link to reset your password",
  //       }),
  //     })

  //     setResetLinkSent(true)
  //   } catch (error) {
  //     alertDispatch({
  //       type: "add",
  //       alert: makeAlertFromAxiosError(error),
  //     })
  //   }
  // }

  async function update(data: IFormInput) {
    // if (!forceSignIn && resetLinkSent) {
    //   setCheckUserWantsToReset(true)
    //   return
    // }

    if (
      data.password1.length > 0 &&
      data.password1.length < MIN_PASSWORD_LENGTH
    ) {
      alertDispatch({
        type: "add",
        alert: makeErrorAlert({
          title: TEXT_MIN_PASSWORD_LENGTH,
        }),
      })

      return
    }

    try {
      await queryClient.fetchQuery({
        queryKey: ["update"],
        queryFn: () =>
          axios.post(
            API_UPDATE_PASSWORD_URL,
            {
              //username: data.username,
              password: data.password1,
              //callbackUrl: APP_RESET_PASSWORD_URL,
            },
            {
              headers: bearerHeaders(jwt),
            },
          ),
      })

      if (data.password1.length === 0) {
        alertDispatch({
          type: "add",
          alert: makeInfoAlert({
            title: "You have switched to passwordless login",
            content: "Look for a passwordless email when you sign in.",
          }),
        })
      } else {
        alertDispatch({
          type: "add",
          alert: makeInfoAlert({
            title: "Your password was updated",
            content: "Please use your new password to sign in.",
          }),
        })
      }

      //setResetLinkSent(true)
    } catch (error) {
      alertDispatch({
        type: "set",
        alert: makeAlertFromAxiosError(error as AxiosError),
      })

      setHasErrors(true)
    }
  }

  function onSubmit(data: IFormInput, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()

    if (!hasErrors && jwtData) {
      update(data)
    }
  }

  return (
    <HeaderLayout>
      <>
        <Alerts />

        {/* <OKCancelDialog
          open={checkUserWantsToSendReset}
          title={APP_NAME}
          onReponse={r => {
            if (r === TEXT_OK) {
              setForceSignIn(forceSignIn + 1)
            }

            setCheckUserWantsToSendReset(false)
          }}
        >
          A reset link has already been sent to your email address. Are you sure
          you want to send it again?
        </OKCancelDialog> */}

        {/* <OKCancelDialog
          open={checkUserWantsToReset}
          title={APP_NAME}
          onReponse={r => {
            if (r === TEXT_OK) {
              setForceSignIn(forceSignIn + 1)
            }

            setCheckUserWantsToReset(false)
          }}
        >
          You have already reset your password. Are you sure you want to
          continue?
        </OKCancelDialog> */}

        <HCenterRow className="grow items-center border">
          <BaseCol className="w-4/5 gap-y-8 text-sm lg:w-1/2 xl:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                {!hasErrors && jwtData ? (
                  <CardDescription>
                    Hi <span className="font-bold">{name}</span>. Please type
                    your new password. It must contain at least 8 characters and
                    may contain letters, numbers, and special characters. If you
                    leave the password blank, you will be switched to
                    passwordless sign in.
                  </CardDescription>
                ) : (
                  <CardDescription>
                    Tell us the username or email address associated with your
                    account, and we&apos;ll email you a link to reset your
                    password.
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    className="flex flex-col gap-y-2"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <FormField
                      control={form.control}
                      name="userId"
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
                        <FormItem>
                          <Input5
                            id="userId"
                            error={"userId" in form.formState.errors}
                            placeholder="User Id"
                            disabled
                            {...field}
                          >
                            {"userId" in form.formState.errors && (
                              <WarningIcon />
                            )}
                          </Input5>
                          <FormInputError
                            error={form.formState.errors.userId}
                          />
                        </FormItem>
                      )}
                    />
                    {!hasErrors && jwtData && (
                      <>
                        <FormField
                          control={form.control}
                          name="password1"
                          rules={{
                            pattern: {
                              value: PASSWORD_PATTERN,
                              message: TEXT_PASSWORD_DESCRIPTION,
                            },
                          }}
                          render={({ field }) => (
                            <FormItem>
                              <Input5
                                id="password1"
                                error={"password1" in form.formState.errors}
                                type="password"
                                placeholder="Password"
                                {...field}
                              >
                                {"password1" in form.formState.errors && (
                                  <WarningIcon />
                                )}
                              </Input5>
                              <FormInputError
                                error={form.formState.errors.password1}
                              />
                            </FormItem>
                          )}
                        />

                        {/* <FormField
                          control={form.control}
                          name="passwordless"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center gap-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={state => {
                                    settingsDispatch({
                                      type: "passwordless",
                                      state,
                                    })
                                    field.onChange(state)
                                  }}
                                ></Switch>
                              </FormControl>
                              <FormLabel className="p-0">
                                {TEXT_PASSWORDLESS}
                              </FormLabel>
                            </FormItem>
                          )}
                        /> */}
                      </>
                    )}

                    <button ref={btnRef} type="submit" className="hidden" />
                  </form>
                </Form>
              </CardContent>
              <CardFooter>
                <PrimaryButton
                  size="lg"
                  onClick={() => btnRef.current?.click()}
                  className="w-full"
                >
                  {hasErrors ? "Re-send reset link" : TEXT_CONTINUE}
                </PrimaryButton>
              </CardFooter>
            </Card>
            <SignInLink />
          </BaseCol>
        </HCenterRow>
      </>
    </HeaderLayout>
  )
}

export function UpdatePasswordQueryPage() {
  return (
    <QCP>
      <AlertsProvider>
        <AccountSettingsProvider>
          <UpdatePasswordPage />
        </AccountSettingsProvider>
      </AlertsProvider>
    </QCP>
  )
}
