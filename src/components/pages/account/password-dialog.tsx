import {
  OKCancelDialog,
  type IModalProps,
} from "@components/dialog/ok-cancel-dialog"
import axios, { AxiosError } from "axios"

import {
  AlertsContext,
  makeAlertFromAxiosError,
  makeErrorAlertFromResp,
  makeInfoAlert,
} from "@components/alerts/alerts-provider"
import { STATUS_CODE_OK, TEXT_OK } from "@consts"
import {
  API_RESET_PASSWORD_URL,
  APP_RESET_PASSWORD_URL,
  bearerHeaders,
} from "@modules/edb"

//import { AccountSettingsContext } from "@context/account-settings-context"

import { useAccessTokenCache } from "@stores/use-access-token-cache"

import { useUserStore } from "@stores/use-user-store"
import { useContext, useRef, type BaseSyntheticEvent } from "react"
import { useForm } from "react-hook-form"

import { AccountSettingsContext } from "@providers/account-settings-provider"
import { useQueryClient } from "@tanstack/react-query"

export const MIN_PASSWORD_LENGTH = 8
export const TEXT_MIN_PASSWORD_LENGTH =
  "A password must contain at least 8 characters"
export const PASSWORD_PATTERN = /^[\w!@#$%^&*.?]{8,}/

export const TEXT_PASSWORD_DESCRIPTION =
  "For security, a link to change your password will be sent to your current email address."

export const TEXT_PASSWORD_REQUIRED = "A password is required"

export type IPasswordAction =
  | {
      type: "password"
      password: string
    }
  | {
      type: "password1"
      password: string
    }
  | {
      type: "password2"
      password: string
    }

// interface PasswordState {
//   password: string
//   password1: string
//   password2: string
// }

// function passwordReducer(state: PasswordState, action: IPasswordAction) {
//   switch (action.type) {
//     case "password":
//       return { ...state, password: action.password }
//     case "password1":
//       return { ...state, password1: action.password }
//     case "password2":
//       return { ...state, password2: action.password }
//     default:
//       return state
//   }
// }

interface IFormInput {
  password: string
  password1: string
  password2: string
  passwordless: boolean
}

export interface IPasswordDialogProps extends IModalProps {}

export function PasswordDialog({
  open = false,
  onOpenChange,
  onReponse,
}: IPasswordDialogProps) {
  // const [passwords, passwordDispatch] = useReducer(passwordReducer, {
  //   password: "",
  //   password1: "",
  //   password2: "",
  // })

  //const { password, password1, password2 } = passwords

  const [settings, settingsDispatch] = useContext(AccountSettingsContext)
  //const [account, accountDispatch] = useContext(AccountContext)

  //const { accessToken } = useAccessTokenStore()
  const { user } = useUserStore()

  //const [passwordless, setPasswordless] = useState(settings.passwordless)
  const [, alertDispatch] = useContext(AlertsContext)

  const { refreshAccessToken } = useAccessTokenCache()

  const form = useForm<IFormInput>({
    defaultValues: {
      password: "",
      password1: "",
      password2: "",
      passwordless: settings.passwordless,
    },
  })

  const btnRef = useRef<HTMLButtonElement>(null)

  function _resp(resp: string) {
    onReponse?.(resp)
  }

  // async function updatePassword(
  //   password: string,
  //   newPassword: string,
  //   settings: ISettings,
  // ): Promise<AxiosResponse> {
  //   return await queryClient.fetchQuery({
  //     queryKey: ["update"],
  //     queryFn: () =>
  //       axios.post(
  //         SESSION_PASSWORD_UPDATE_URL,
  //         {
  //           password,
  //           newPassword: settings.passwordless ? "" : newPassword,
  //         },
  //         {
  //           headers: bearerHeaders(accessToken),
  //           //withCredentials: true,
  //         },
  //       ),
  //   })
  // }

  async function sendResetPasswordLink() {
    const queryClient = useQueryClient()

    try {
      const accessToken = await refreshAccessToken()

      const res = await queryClient.fetchQuery({
        queryKey: ["reset_password"],
        queryFn: () =>
          axios.post(
            API_RESET_PASSWORD_URL,
            {
              username: user.username,

              callbackUrl: APP_RESET_PASSWORD_URL,
            },
            {
              //withCredentials: true,
              headers: bearerHeaders(accessToken),
            },
          ),
      })

      if (res.status !== STATUS_CODE_OK) {
        alertDispatch({
          type: "add",
          alert: makeErrorAlertFromResp(res.data),
        })
        return
      }

      alertDispatch({
        type: "set",
        alert: makeInfoAlert({
          title: "Please check your email for a link to reset your password",
        }),
      })
    } catch (error) {
      alertDispatch({
        type: "add",
        alert: makeAlertFromAxiosError(error as AxiosError),
      })
    }
  }

  async function onSubmit(data: IFormInput, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()

    sendResetPasswordLink()
  }

  return (
    <OKCancelDialog
      title="Change Password"
      description={TEXT_PASSWORD_DESCRIPTION}
      showClose={true}
      open={open}
      onOpenChange={onOpenChange}
      //buttons={[TEXT_SAVE, TEXT_CANCEL]}
      onReponse={response => {
        switch (response) {
          case TEXT_OK:
            //update()
            //btnRef.current?.click()
            sendResetPasswordLink()

          default:
            _resp(response)
        }
      }}
    >
      {/* <Form {...form}>
        <form
          className="flex flex-col gap-y-2 text-sm"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="password"
            rules={{
              pattern: {
                value: PASSWORD_PATTERN,
                message: TEXT_PASSWORD_DESCRIPTION,
              },
            }}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-y-1">
                <Input
                  id="password"
                  type="password"
                  error={"password" in form.formState.errors}
                  rightChildren={
                    "password" in form.formState.errors && <WarningIcon />
                  }
                  placeholder="Current Password"
                  {...field}
                />
                <FormInputError error={form.formState.errors.password} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passwordless"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={state => {
                      settingsDispatch({ type: "passwordless", state })
                      field.onChange(state)
                    }}
                  ></Switch>
                </FormControl>
                <FormLabel className="p-0">
                  Switch to {TEXT_PASSWORDLESS.toLowerCase()}
                </FormLabel>
              </FormItem>
            )}
          />

          {!settings.passwordless && (
            <>
              <FormField
                control={form.control}
                name="password1"
                rules={{
                  required: {
                    value: !settings.passwordless,
                    message: TEXT_PASSWORD_REQUIRED,
                  },
                  pattern: {
                    value: PASSWORD_PATTERN,
                    message: TEXT_PASSWORD_DESCRIPTION,
                  },
                }}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-y-1">
                    <Input
                      id="password1"
                      type="password"
                      error={"password1" in form.formState.errors}
                      rightChildren={
                        "password1" in form.formState.errors && <WarningIcon />
                      }
                      placeholder="New Password"
                      {...field}
                    />
                    <FormInputError error={form.formState.errors.password1} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password2"
                rules={{
                  required: {
                    value: !settings.passwordless,
                    message: TEXT_PASSWORD_REQUIRED,
                  },
                  pattern: {
                    value: PASSWORD_PATTERN,
                    message: TEXT_PASSWORD_DESCRIPTION,
                  },
                }}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-y-1">
                    <Input
                      id="password2"
                      type="password"
                      error={"password2" in form.formState.errors}
                      rightChildren={
                        "password2" in form.formState.errors && <WarningIcon />
                      }
                      placeholder="Re-type New Password"
                      {...field}
                    />
                    <FormInputError error={form.formState.errors.password2} />
                  </FormItem>
                )}
              />
            </>
          )}

          <button ref={btnRef} type="submit" className="hidden" />
        </form>
      </Form> */}
    </OKCancelDialog>
  )
}
