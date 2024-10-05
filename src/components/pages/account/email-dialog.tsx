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
  API_RESET_EMAIL_URL,
  APP_UPDATE_EMAIL_URL,
  bearerHeaders,
} from "@modules/edb"

import { FormInputError } from "@components/input-error"
import { Form, FormField, FormItem } from "@components/shadcn/ui/themed/form"
import { Input } from "@components/shadcn/ui/themed/input"
//import { AccountContext } from "@hooks/use-account"
import { EMAIL_PATTERN } from "@layouts/signin-layout"
import { useAccessTokenCache } from "@stores/use-access-token-cache"
import { useUserStore } from "@stores/use-user-store"
import { useQueryClient } from "@tanstack/react-query"
import { useContext, useRef, type BaseSyntheticEvent } from "react"
import { useForm } from "react-hook-form"

export const TEXT_EMAIL_DESCRIPTION =
  "To change your email address, a link will be sent to your new email address to verify ownership. Click the Ok button to send the link."

export type IPasswordAction = {
  type: "email"
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
  email: string
}

export interface IEmailDialogProps extends IModalProps {}

export function EmailDialog({
  open = false,
  onOpenChange,
  onReponse,
}: IEmailDialogProps) {
  const queryClient = useQueryClient()

  //const { password, password1, password2 } = passwords

  //const [settings, settingsDispatch] = useContext(SettingsContext)
  //const [account, accountDispatch] = useContext(AccountContext)
  const { refreshAccessToken } = useAccessTokenCache()
  const { user } = useUserStore()

  //const [passwordless, setPasswordless] = useState(settings.passwordless)
  const [, alertDispatch] = useContext(AlertsContext)

  const form = useForm<IFormInput>({
    defaultValues: {
      email: user.email,
    },
  })

  const btnRef = useRef<HTMLButtonElement>(null)

  function _resp(resp: string) {
    onReponse?.(resp)
  }

  async function sendResetEmailLink(email: string) {
    const accessToken = await refreshAccessToken()

    try {
      const res = await queryClient.fetchQuery({
        queryKey: ["reset"],
        queryFn: () =>
          axios.post(
            API_RESET_EMAIL_URL,
            {
              email,
              callbackUrl: APP_UPDATE_EMAIL_URL,
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
          title:
            "Please check your email for a link to change your email address",
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

    sendResetEmailLink(data.email)
  }

  return (
    <OKCancelDialog
      title="Change Email Address"
      description={TEXT_EMAIL_DESCRIPTION}
      showClose={true}
      open={open}
      onOpenChange={onOpenChange}
      //buttons={[TEXT_SAVE, TEXT_CANCEL]}
      onReponse={response => {
        switch (response) {
          case TEXT_OK:
            //update()
            btnRef.current?.click()

          default:
            _resp(response)
        }
      }}
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-y-2 text-sm"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="email"
            rules={{
              required: {
                value: true,
                message: "An email address is required",
              },
              pattern: {
                value: EMAIL_PATTERN,
                message: TEXT_EMAIL_DESCRIPTION,
              },
            }}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-y-1">
                <Input
                  id="email"
                  placeholder="New email address"
                  //error={"email" in form.formState.errors}
                  {...field}
                ></Input>
                <FormInputError error={form.formState.errors.email} />
              </FormItem>
            )}
          />

          <button ref={btnRef} type="submit" className="hidden" />
        </form>
      </Form>
    </OKCancelDialog>
  )
}
