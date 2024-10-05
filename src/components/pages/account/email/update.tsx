import { Alerts } from "@components/alerts/alerts"
import {
  AlertsContext,
  AlertsProvider,
  makeAlertFromAxiosError,
  makeInfoAlert,
} from "@components/alerts/alerts-provider"
import { PrimaryButton } from "@components/button/primary-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CenteredCardContainer,
} from "@components/shadcn/ui/themed/card"
import {
  API_UPDATE_EMAIL_URL,
  EDB_TOKEN_PARAM,
  MYACCOUNT_ROUTE,
  bearerHeaders,
  getJwtContents,
  type IResetJwtPayload,
} from "@modules/edb"

import { useContext, useRef, useState, type BaseSyntheticEvent } from "react"

import { FormInputError } from "@components/input-error"
import { Form, FormField, FormItem } from "@components/shadcn/ui/themed/form"
import { TEXT_CANCEL, TEXT_CONFIRM } from "@consts"
import { AccountSettingsProvider } from "@providers/account-settings-provider"

import { WarningButtonLink } from "@components/link/warning-button-link"
import { Input } from "@components/shadcn/ui/themed/input"
import { Label } from "@components/shadcn/ui/themed/label"
import { VCenterRow } from "@components/v-center-row"
import {
  EMAIL_PATTERN,
  FORWARD_DELAY_MS,
  SignInLayout,
  TEXT_EMAIL_ERROR,
} from "@layouts/signin-layout"
import { routeChange } from "@lib/utils"
import { QCP } from "@query"
import { useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useForm } from "react-hook-form"

interface IFormInput {
  email1: string
  email2: string
}

function UpdateEmailPage() {
  const queryClient = useQueryClient()

  const queryParameters = new URLSearchParams(window.location.search)

  const accessToken = queryParameters.get(EDB_TOKEN_PARAM) ?? ""
  //const url = queryParameters.get(EDB_URL_PARAM)

  const jwtData: IResetJwtPayload | null =
    getJwtContents<IResetJwtPayload>(accessToken)

  //const { accessToken } = useAccessTokenStore()
  //const { account } = useUserStore(accessToken)

  const btnRef = useRef<HTMLButtonElement>(null)

  const [, setHasErrors] = useState(false)

  const form = useForm<IFormInput>({
    defaultValues: {
      email1: jwtData ? jwtData.data : "",
      email2: "",
    },
  })

  const [, alertDispatch] = useContext(AlertsContext)

  async function update(data: IFormInput) {
    try {
      await queryClient.fetchQuery({
        queryKey: ["update"],
        queryFn: () =>
          axios.post(
            API_UPDATE_EMAIL_URL,
            {
              email: data.email1,
            },
            {
              headers: bearerHeaders(accessToken),
            },
          ),
      })

      alertDispatch({
        type: "add",
        alert: makeInfoAlert({
          title: "Your email address was updated",
          content: "Please use your new email address to sign in.",
        }),
      })

      setTimeout(() => {
        routeChange(`${MYACCOUNT_ROUTE}?refresh=true`)
      }, FORWARD_DELAY_MS)
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

    if (jwtData) {
      update(data)
    }
  }

  return (
    <SignInLayout title="Change Email Address">
      <>
        <Alerts />

        <CenteredCardContainer>
          <Card>
            <CardHeader>
              <CardTitle>Change Email Address</CardTitle>

              <CardDescription>
                If you wish to change your email address to the one shown below,
                please click Confirm to continue. Otherwise, click Cancel or
                navigate away from this page to prevent changes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  className="flex flex-col gap-y-2"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <Label className="font-medium">New Email Address</Label>
                    <FormField
                      control={form.control}
                      name="email1"
                      rules={{
                        required: {
                          value: true,
                          message: "An email address is required",
                        },
                        pattern: {
                          value: EMAIL_PATTERN,
                          message: TEXT_EMAIL_ERROR,
                        },
                      }}
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <Input
                            id="email1"
                            //error={"email1" in form.formState.errors}
                            readOnly
                            placeholder="New Email address"
                            {...field}
                          >
                            {/* {"email1" in form.formState.errors && <WarningIcon />} */}
                          </Input>
                          <FormInputError
                            error={form.formState.errors.email1}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  <button ref={btnRef} type="submit" className="hidden" />
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center w-full">
                <div></div>
                <div className="col-span-2">
                  <PrimaryButton
                    size="lg"
                    onClick={() => btnRef.current?.click()}
                  >
                    {TEXT_CONFIRM}
                  </PrimaryButton>
                </div>
              </div>
            </CardFooter>
          </Card>
          <VCenterRow className="justify-end">
            <WarningButtonLink
              href="/"
              aria-label="Cancel changing email address"
              size="lg"
            >
              {TEXT_CANCEL}
            </WarningButtonLink>
          </VCenterRow>
        </CenteredCardContainer>
      </>
    </SignInLayout>
  )
}

export function UpdateEmailQueryPage() {
  return (
    <QCP>
      <AlertsProvider>
        <AccountSettingsProvider>
          <UpdateEmailPage />
        </AccountSettingsProvider>
      </AlertsProvider>
    </QCP>
  )
}
