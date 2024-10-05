import { BaseCol } from "@components/base-col"

import { OKCancelDialog } from "@components/dialog/ok-cancel-dialog"
import { WarningIcon } from "@components/icons/warning-icon"
import { FormInputError } from "@components/input-error"
import { Form, FormField, FormItem } from "@components/shadcn/ui/themed/form"
import { Input5 } from "@components/shadcn/ui/themed/input5"
import { Label } from "@components/shadcn/ui/themed/label"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@components/shadcn/ui/themed/toggle-group"
import { TEXT_OK } from "@consts"
import {
  EMAIL_PATTERN,
  NAME_PATTERN,
  TEXT_EMAIL_ERROR,
  TEXT_NAME_REQUIRED,
  TEXT_USERNAME_DESCRIPTION,
  TEXT_USERNAME_REQUIRED,
  USERNAME_PATTERN,
} from "@layouts/signin-layout"
import type { IRole, IUser } from "@modules/edb"
import { useRef, type BaseSyntheticEvent } from "react"
import { useForm } from "react-hook-form"
import {
  PASSWORD_PATTERN,
  TEXT_PASSWORD_DESCRIPTION,
} from "../account/password-dialog"

// export interface INewUser extends IUser {
//   password: string
// }

export interface IUserAdminView extends IUser {
  roles: string[]
}

export interface INewUser extends IUserAdminView {
  password: string
}

export const NEW_USER: INewUser = {
  password: "",
  publicId: "",
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  roles: [],
}

interface IEditUserDialogProps {
  title?: string
  user: INewUser | undefined
  setUser: (user: INewUser | undefined, response: string) => void
  roles: IRole[]
}

export function EditUserDialog({
  title,
  user,
  setUser,
  roles,
}: IEditUserDialogProps) {
  if (!user) {
    return null
  }

  if (!title) {
    title = `Edit ${user?.username}`
  }

  const btnRef = useRef<HTMLButtonElement>(null)

  function onSubmit(data: INewUser, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()

    // if (!hasErrors && jwtData) {
    //   update(data)
    // }

    setUser(data, TEXT_OK)
  }

  const form = useForm<INewUser>({
    defaultValues: {
      ...user,
      password: "",
    },
  })

  return (
    <OKCancelDialog
      title={title}
      onReponse={r => {
        if (r === TEXT_OK) {
          btnRef.current?.click()
        } else {
          setUser(undefined, r)
        }
      }}
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-y-4 text-sm"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  message: "This does not seem like a valid name",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <Input5
                    id="firstName"
                    className="w-full"
                    placeholder="First Name"
                    error={"name" in form.formState.errors}
                    {...field}
                  >
                    {"firstName" in form.formState.errors && <WarningIcon />}
                  </Input5>

                  <FormInputError error={form.formState.errors.firstName} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              rules={{
                pattern: {
                  value: NAME_PATTERN,
                  message: "This does not seem like a valid name",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <Input5
                    id="lastName"
                    className="w-full"
                    placeholder="Last Name"
                    error={"name" in form.formState.errors}
                    {...field}
                  >
                    {"lastName" in form.formState.errors && <WarningIcon />}
                  </Input5>

                  <FormInputError error={form.formState.errors.lastName} />
                </FormItem>
              )}
            />
          </div>
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
              <FormItem className="flex flex-col gap-y-1">
                <Input5
                  id="name"
                  placeholder="Username"
                  error={"username" in form.formState.errors}
                  {...field}
                >
                  {"username" in form.formState.errors && <WarningIcon />}
                </Input5>
                <FormInputError error={form.formState.errors.username} />
              </FormItem>
            )}
          />

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
                message: TEXT_EMAIL_ERROR,
              },
            }}
            render={({ field }) => (
              <FormItem className="grow">
                <Input5
                  id="email"
                  placeholder="Email"
                  error={"email" in form.formState.errors}
                  {...field}
                />

                <FormInputError error={form.formState.errors.email} />
              </FormItem>
            )}
          />

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
              <FormItem>
                <Input5
                  id="password"
                  error={"password" in form.formState.errors}
                  type="password"
                  placeholder="Password"
                  {...field}
                >
                  {"password" in form.formState.errors && <WarningIcon />}
                </Input5>
                <FormInputError error={form.formState.errors.password} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publicId"
            render={({ field }) => {
              if (field.value) {
                return (
                  <FormItem>
                    <Input5
                      id="publicId"
                      className="w-full"
                      placeholder="User Id"
                      readOnly
                      disabled
                      {...field}
                    />
                  </FormItem>
                )
              } else {
                return <></>
              }
            }}
          />

          <FormField
            control={form.control}
            name="roles"
            render={({ field }) => (
              <BaseCol className="gap-y-2">
                <Label>Roles</Label>
                <ToggleGroup
                  type="multiple"
                  rounded="base"
                  justify="start"
                  variant="outline"
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-row gap-x-1"
                >
                  {roles.map((role, ri) => {
                    return (
                      <ToggleGroupItem value={role.name} key={ri}>
                        {role.name}
                      </ToggleGroupItem>
                    )
                  })}
                </ToggleGroup>
              </BaseCol>
            )}
          />

          <button ref={btnRef} type="submit" className="hidden" />
        </form>
      </Form>
    </OKCancelDialog>
  )
}
