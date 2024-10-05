import { type IChildrenProps } from '@interfaces/children-props'

import { createContext, useReducer, type Dispatch } from 'react'

import { nanoid } from '@lib/utils'
import type { ILollipopDataFrame } from './plot-context'

export interface IPlot {
  id: string
  name: string
  /**
   * The dataframe storing all properties of the plot
   */
  df: ILollipopDataFrame
}

export interface IPlotProps {
  id?: string
  name?: string
  df: ILollipopDataFrame
}

export type PlotAction =
  | {
      type: 'add'
      plot: IPlotProps
    }
  | {
      type: 'set'
      plot: IPlotProps
    }
  | {
      type: 'remove'
      id: string
    }
  | { type: 'clear' }

// export function makePlot(cf: ClusterFrame, type: PlotType, params:IFieldMap={}): IPlot {
//   return {
//     id: randId(),
//     type,
//     cf,
//     params
//   }
// }

interface IPlotsState {
  plots: IPlot[]
}

const DEFAULT_PROPS: IPlotsState = {
  plots: [],
}

export function plotsReducer(
  state: IPlotsState,
  action: PlotAction
): IPlotsState {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        plots: [
          ...state.plots,
          {
            id: action.plot.id ?? nanoid(),
            name: action.plot.name ?? `Lollipop ${state.plots.length + 1}`,
            df: action.plot.df,
          },
        ],
      }

    case 'set':
      return {
        ...state,
        plots: [
          {
            id: action.plot.id ?? nanoid(),
            name: action.plot.name ?? `Lollipop ${state.plots.length + 1}`,
            df: action.plot.df,
          },
        ],
      }
    case 'remove':
      return {
        ...state,
        plots: state.plots.filter(plot => plot.id != action.id),
      }
    case 'clear':
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
