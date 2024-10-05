import {
  AlertsContext,
  AlertsProvider,
  makeAlert,
  makeAlertFromAxiosError,
} from "@components/alerts/alerts-provider"

import {
  API_ADMIN_ADD_USER_URL,
  API_ADMIN_DELETE_USER_URL,
  API_ADMIN_ROLES_URL,
  API_ADMIN_UPDATE_USER_URL,
  API_ADMIN_USER_STATS_URL,
  API_ADMIN_USERS_URL,
  bearerHeaders as authHeaders,
  type IRole,
  type IUser,
} from "@modules/edb"

import { useContext, useEffect, useState } from "react"

import { RolesLayout } from "@layouts/roles-layout"
import { AccountSettingsProvider } from "@providers/account-settings-provider"

import axios, { AxiosError } from "axios"

import { OKCancelDialog } from "@components/dialog/ok-cancel-dialog"
import { PenIcon } from "@components/icons/pen-icon"
import { PlusIcon } from "@components/icons/plus-icon"
import { TrashIcon } from "@components/icons/trash-icon"
import { PaginationComponent } from "@components/pagination-component"
import { Button } from "@components/shadcn/ui/themed/button"
import {
  Card,
  CardContainer,
  CardContent,
} from "@components/shadcn/ui/themed/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/shadcn/ui/themed/table"
import { VCenterRow } from "@components/v-center-row"
import { NO_DIALOG, TEXT_NEW, TEXT_OK, type IDialogParams } from "@consts"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

import { CenterRow } from "@components/center-row"
import { QCP } from "@query"
import { useAccessTokenCache } from "@stores/use-access-token-cache"
import { useQueryClient } from "@tanstack/react-query"
import {
  EditUserDialog,
  NEW_USER,
  type INewUser,
  type IUserAdminView,
} from "./edit-user-dialog"

interface IUserStats {
  users: number
}

function AdminUsersPage() {
  const queryClient = useQueryClient()

  const [userStats, setUserStats] = useState<IUserStats | null>(null)

  const [roles, setRoles] = useState<IRole[]>([])

  const [page, setPage] = useState(1)

  const [, alertDispatch] = useContext(AlertsContext)

  const [itemsPerPage, setItemsPerPage] = useState(100)

  const [users, setUsers] = useState<IUserAdminView[]>([])

  const { refreshAccessToken } = useAccessTokenCache()

  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  async function loadRoles() {
    const token = await refreshAccessToken()

    if (!token) {
      return
    }

    try {
      const res = await queryClient.fetchQuery({
        queryKey: ["admin_roles"],
        queryFn: () => {
          return axios.get(API_ADMIN_ROLES_URL, {
            headers: authHeaders(token),
          })
        },
      })

      setRoles(res.data.data)
    } catch (err) {
      console.error("could not fetch remote roles")
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  async function loadUserStats() {
    const accessToken = await refreshAccessToken()

    if (!accessToken) {
      return
    }

    try {
      const res = await queryClient.fetchQuery({
        queryKey: ["user_stats"],
        queryFn: () => {
          return axios.get(API_ADMIN_USER_STATS_URL, {
            headers: authHeaders(accessToken),
          })
        },
      })

      const stats: IUserStats = res.data.data

      setUserStats(stats)
    } catch (err) {
      console.error("could not load user stats")
    }
  }

  useEffect(() => {
    if (roles.length > 0) {
      loadUserStats()
    }
  }, [roles])

  async function loadUsers() {
    const accessToken = await refreshAccessToken()

    if (!accessToken) {
      return
    }

    try {
      const res = await queryClient.fetchQuery({
        queryKey: ["users"],
        queryFn: () => {
          return axios.post(
            API_ADMIN_USERS_URL,
            { offset: (page - 1) * itemsPerPage, records: itemsPerPage },
            {
              headers: authHeaders(accessToken),
            },
          )
        },
      })

      console.log(res.data.data)

      setUsers(res.data.data)
    } catch (err) {
      console.error("could not load users from remote")
    }
  }

  useEffect(() => {
    if (userStats) {
      loadUsers()
    }

    // reset offset if number of records changes significantly
    // and we are no longer on a valid page
    //if (userStats.users < (page - 1) * itemsPerPage) {
    ///  setPage(1)
    //}
  }, [page, itemsPerPage, userStats])

  //const form = useForm<IUserAdminView>({
  // defaultValues: {
  //   // username: account.username,
  //   // email: account.email,
  //   // firstName: account.firstName,
  //   // lastName: account.lastName,
  //   // publicId: account.publicId,
  //   // roles: account.roles.join(", "),
  //   ...user,
  // },
  //})

  // useEffect(() => {
  //   if (!user) {
  //     return
  //   }

  //   form.reset({
  //     ...user,
  //   })
  // }, [user])

  const columnHelper = createColumnHelper<IUserAdminView>()

  
  const columns: ColumnDef<IUserAdminView>[] = [
    // @ts-ignore 
    columnHelper.accessor("username", {
      header: "Username",
    }),
    // @ts-ignore 
    columnHelper.accessor("email", {
      header: "Email",
    }),
    // @ts-ignore 
    columnHelper.accessor("firstName", {
      header: "First Name",
    }),
    // @ts-ignore 
    columnHelper.accessor("lastName", {
      header: "Last Name",
    }),
    // @ts-ignore 
    columnHelper.accessor("roles", {
      header: "Roles",
      cell: props => <span>{props.getValue().join(", ")}</span>,
    }),
    // @ts-ignore 
    columnHelper.accessor("publicId", {
      header: "User Id",
    }),
    // @ts-ignore 
    columnHelper.accessor(row => row, {
      id: "edit",
      header: "",
      cell: props => (
        <VCenterRow className="gap-x-3 justify-end">
          <button
            title="Edit user"
            onClick={() => {
              //setUser(props.getValue())

              setShowDialog({
                name: "edit",
                params: { title: "Edit User", user: props.getValue() },
              })
            }}
            className="group"
          >
            <PenIcon
              fill="fill-foreground/25"
              className="trans-color group-hover:fill-theme"
            />
          </button>

          <button
            title="Delete user"
            onClick={() => {
              setShowDialog({
                name: "delete",
                params: { user: props.getValue() },
              })
            }}
            className="group"
          >
            <TrashIcon
              fill="fill-foreground/25"
              className="trans-color group-hover:fill-red-500"
            />
          </button>
        </VCenterRow>
      ),
    }),
  ]

  const table = useReactTable({
    // @ts-ignore
    columns,
    data: users,
    getCoreRowModel: getCoreRowModel(),
  })

  async function newUser(user: INewUser) {
    const accessToken = await refreshAccessToken()

    if (!accessToken) {
      return
    }

    try {
      await queryClient.fetchQuery({
        queryKey: ["new_user"],
        queryFn: () => {
          return axios.post(
            API_ADMIN_ADD_USER_URL,
            { ...user },
            {
              headers: authHeaders(accessToken),
            },
          )
        },
      })

      // force refresh
      await loadUsers()
    } catch (err) {
      console.error("error making new user")
    }
  }

  async function updateUser(user: INewUser) {
    const accessToken = await refreshAccessToken()

    if (!accessToken) {
      return
    }

    try {
      await queryClient.fetchQuery({
        queryKey: ["update_user"],
        queryFn: () => {
          return axios.post(
            API_ADMIN_UPDATE_USER_URL, ///${user.publicId}`,
            { ...user },
            {
              headers: authHeaders(accessToken),
            },
          )
        },
      })

      await loadUsers()

      alertDispatch({
        type: "set",
        alert: makeAlert({ title: "User updated" }),
      })
    } catch (err) {
      alertDispatch({
        type: "set",
        alert: makeAlertFromAxiosError(err as AxiosError),
      })
    }
  }

  async function deleteUser(user: IUser) {
    const accessToken = await refreshAccessToken()

    if (!accessToken) {
      return
    }

    try {
      await queryClient.fetchQuery({
        queryKey: ["update_user"],
        queryFn: () => {
          return axios.delete(
            `${API_ADMIN_DELETE_USER_URL}/${user.publicId}`,

            {
              headers: authHeaders(accessToken),
            },
          )
        },
      })

      await loadUsers()
    } catch (err) {
      alertDispatch({
        type: "set",
        alert: makeAlertFromAxiosError(err as AxiosError),
      })

      throw err
    }
  }

  return (
    <>
      <OKCancelDialog
        open={showDialog.name === "delete"}
        showClose={true}
        onReponse={r => {
          if (r === TEXT_OK) {
            deleteUser(showDialog.params!["user"])
          }
          setShowDialog(NO_DIALOG)
        }}
      >
        Are you sure you want to delete the user?
      </OKCancelDialog>

      {showDialog.name === "new" && (
        <EditUserDialog
          title={showDialog.params!.title}
          user={showDialog.params!.user}
          setUser={(user: INewUser|undefined, response: string) => {
            console.log("new", user)

            if (user) {
              newUser(user)
            }

            setShowDialog(NO_DIALOG)
          }}
          roles={roles}
        />
      )}

      {showDialog.name === "edit" && (
        <EditUserDialog
          user={showDialog.params!.user}
          setUser={(user: INewUser|undefined, response: string) => {
            console.log("update", user)

            if (user) {
              updateUser(user)
            }

            setShowDialog(NO_DIALOG)
          }}
          roles={roles}
        />
      )}

      <RolesLayout title="Users">
        <CardContainer gap="gap-y-4">
          <CenterRow>
            <CenterRow className="col-span-2">
              <PaginationComponent
                currentPage={page}
                setCurrentPage={page => {
                  setPage(page)
                }}
                itemsPerPage={itemsPerPage}
                itemCount={users.length}
              />
            </CenterRow>
          </CenterRow>
          <Card>
            <CardContent className="flex flex-col gap-y-4">
              <VCenterRow>
                <Button
                  variant="theme"
                  multiVariants="lg"
                  onClick={() => {
                    setShowDialog({
                      name: "new",
                      params: { title: "New User", user: { ...NEW_USER } },
                    })
                  }}
                >
                  <PlusIcon fill="fill-white" /> {TEXT_NEW}
                </Button>
              </VCenterRow>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => {
                    return (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <TableHead key={header.id} colSpan={header.colSpan}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    )
                  })}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CardContainer>
      </RolesLayout>
    </>
  )
}

export function AdminUsersQueryPage() {
  return (
    <QCP>
      <AlertsProvider>
        <AccountSettingsProvider>
          <AdminUsersPage />
        </AccountSettingsProvider>
      </AlertsProvider>
    </QCP>
  )
}
