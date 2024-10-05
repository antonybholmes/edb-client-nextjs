import { type IChildrenProps } from "@interfaces/children-props"

import type { IClusterGroup } from "@lib/cluster-group"
import { createContext, useReducer, type Dispatch } from "react"

export type GroupAction =
  | {
      type: "add"
      group: IClusterGroup
    }
  | {
      type: "set"
      groups: IClusterGroup[]
    }
  | {
      type: "remove"
      id: string
    }
  | { type: "clear" }

export function groupsReducer(
  state: IClusterGroup[],
  action: GroupAction,
): IClusterGroup[] {
  switch (action.type) {
    case "add":
      return [...state, action.group]

    case "set":
      return action.groups
    case "remove":
      return state.filter(plot => plot.id != action.id)

    case "clear":
      return []

    default:
      return state
  }
}

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

export const GroupsContext = createContext<
  [IClusterGroup[], Dispatch<GroupAction>]
>([[], () => {}])

export function GroupsProvider({ children }: IChildrenProps) {
  const [state, groupsDispatch] = useReducer(groupsReducer, [])

  return (
    <GroupsContext.Provider value={[state, groupsDispatch]}>
      {children}
    </GroupsContext.Provider>
  )
}
