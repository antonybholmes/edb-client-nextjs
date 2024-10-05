import type { IHeatMapProps } from "@components/plot/heatmap-svg"
import type { IVolcanoProps } from "@components/plot/volcano-plot-svg"
import type { IElementProps } from "@interfaces/element-props"

import { createContext, useReducer, type Dispatch } from "react"

//export type CellStyle = "square" | "dot"

type PropsType = IHeatMapProps | IVolcanoProps

export type PlotPropsAction =
  | {
      type: "add"
      props: { id: string; props: PropsType }[]
    }
  | {
      type: "set"
      props: { id: string; props: PropsType }[]
    }
  | {
      type: "update"
      id: string
      props: PropsType
    }
  | {
      type: "remove"
      id: string
    }
  | { type: "clear" }

interface IPlotPropsState {
  props: Map<string, PropsType>
}

const DEFAULT_PROPS: IPlotPropsState = {
  props: new Map<string, PropsType>(),
}

export function plotPropsReducer(
  state: IPlotPropsState,
  action: PlotPropsAction,
): IPlotPropsState {
  switch (action.type) {
    case "add":
      return {
        ...state,
        props: new Map<string, PropsType>(
          [...state.props.entries()].concat(
            action.props
              .filter(plot => !state.props.has(plot.id))
              .map(plot => [plot.id, { ...plot.props }]),
          ),
        ),
      }

    case "set":
      return {
        ...state,
        props: new Map<string, PropsType>(
          action.props
            .filter(plot => !state.props.has(plot.id))
            .map(plot => [plot.id, { ...plot.props }]),
        ),
      }
    case "remove":
      return {
        ...state,
        props: new Map<string, PropsType>(
          [...state.props.entries()].filter(([id, _]) => id !== action.id),
        ),
      }
    case "update":
      state.props.set(action.id, action.props)
      return { ...state }

    case "clear":
      return { ...state, props: new Map<string, PropsType>() }

    default:
      return state
  }
}

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

export const PlotPropsContext = createContext<
  [IPlotPropsState, Dispatch<PlotPropsAction>]
>([{ ...DEFAULT_PROPS }, () => {}])

export function PlotPropsProvider({ children }: IElementProps) {
  const [state, plotPropsDispatch] = useReducer(plotPropsReducer, {
    ...DEFAULT_PROPS,
  })

  return (
    <PlotPropsContext.Provider value={[state, plotPropsDispatch]}>
      {children}
    </PlotPropsContext.Provider>
  )
}
