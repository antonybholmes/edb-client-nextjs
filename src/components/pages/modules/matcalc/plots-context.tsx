import { type IChildrenProps } from "@interfaces/children-props"

import type { ClusterFrame } from "@lib/math/hcluster"
import { nanoid } from "@lib/utils"
import { createContext, useReducer, type Dispatch } from "react"

export type PlotStyle = "Heatmap" | "Dot Plot" | "Volcano Plot"

export interface IPlot {
  id: string
  index: number
  name: string
  cf: ClusterFrame
  style: PlotStyle
}

export type PlotAction =
  | {
      type: "add"
      cf: ClusterFrame
      style: PlotStyle
    }
  | {
      type: "set"
      cf: ClusterFrame
      style: PlotStyle
    }
  | {
      type: "remove"
      id: string
    }
  | { type: "clear" }

// export function makePlot(cf: ClusterFrame, type: PlotType, params:IFieldMap={}): IPlot {
//   return {
//     id: randId(),
//     type,
//     cf,
//     params
//   }
// }

interface IPlotsState {
  index: number
  plots: IPlot[]
}

const DEFAULT_PROPS: IPlotsState = {
  index: 1,
  plots: [],
}

export function plotsReducer(
  state: IPlotsState,
  action: PlotAction,
): IPlotsState {
  switch (action.type) {
    case "add":
      return {
        ...state,
        index: state.index + 1,
        plots: [
          ...state.plots,
          {
            id: nanoid(),
            cf: action.cf,
            style: action.style,

            index: state.index,
            name: `${action.style} ${state.index}`,
          },
        ],
      }

    case "set":
      return {
        ...state,
        index: 1,
        plots: [
          {
            id: nanoid(),
            cf: action.cf,
            style: action.style,
            index: state.index,
            name: `${action.style} 1`,
          },
        ],
      }
    case "remove":
      console.log(action.id)
      console.log(state.plots)
      return {
        ...state,
        plots: state.plots.filter(plot => plot.id != action.id),
      }
    case "clear":
      return { ...state, plots: [] }

    default:
      return state
  }
}

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

export const PlotsContext = createContext<[IPlotsState, Dispatch<PlotAction>]>([
  { ...DEFAULT_PROPS },
  () => {},
])

export function PlotsProvider({ children }: IChildrenProps) {
  const [state, plotDispatch] = useReducer(plotsReducer, { ...DEFAULT_PROPS })

  return (
    <PlotsContext.Provider value={[state, plotDispatch]}>
      {children}
    </PlotsContext.Provider>
  )
}
