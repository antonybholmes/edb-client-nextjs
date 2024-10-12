import { type IChildrenProps } from '@interfaces/children-props'
import { createContext, useReducer, type Dispatch } from 'react'
import { BaseDataFrame, type SheetId } from '../lib/dataframe/base-dataframe'
import { INF_DATAFRAME } from '../lib/dataframe/inf-dataframe'

function getStepIndex(step: SheetId, steps: HistoryStep[]): number {
  if (typeof step == 'string') {
    step = step.toLowerCase()
    const ms = steps
      .map((step, si) => [step, si] as [HistoryStep, number])
      .filter(s => s[0].name.toLowerCase().includes(step as string))
      .map(s => s[1])

    if (steps.length > 0) {
      step = ms[0]
    } else {
      step = -1
    }
  }

  return step
}

/**
 * Trys to find the index of a sheet by id or index. If not found returns -1
 * @param sheet
 * @param dataframes
 * @returns
 */
function getSheetIndex(sheet: SheetId, dataframes: BaseDataFrame[]): number {
  if (typeof sheet == 'string') {
    sheet = sheet.toLowerCase()
    const steps = dataframes
      .map((df, di) => [df, di] as [BaseDataFrame, number])
      .filter(s => s[0].name.toLowerCase().includes(sheet as string))
      .map(d => d[1])

    if (steps.length > 0) {
      sheet = steps[0]
    } else {
      sheet = -1
    }
  }

  return sheet
}

export class HistoryStep {
  private _name: string
  private _sheets: BaseDataFrame[]
  private _index: number
  private _sheetIndex: number

  constructor(
    index: number,
    name: string,
    sheets: BaseDataFrame[],
    sheetId: SheetId = 0
  ) {
    this._index = index
    this._name = name
    this._sheets = sheets
    this._sheetIndex = Math.min(
      sheets.length - 1,
      getSheetIndex(sheetId, sheets)
    )
  }

  get index(): number {
    return this._index
  }

  get name(): string {
    return this._name
  }

  get sheets(): BaseDataFrame[] {
    return this._sheets
  }

  /**
   * Returns the index of the current dataframe. This
   * is used to determine what the currently selected
   * sheet is a given history step.
   */
  get currentSheetIndex(): number {
    return this._sheetIndex
  }

  /**
   * Returns the current dataframe in the current history step.
   */
  get currentSheet(): BaseDataFrame {
    return this._sheets[this._sheetIndex]
  }

  get lastSheet(): BaseDataFrame {
    return this._sheets[this._sheets.length - 1]
  }

  getSheet(id: SheetId): BaseDataFrame {
    const idx = getSheetIndex(id, this._sheets)

    if (idx === -1) {
      throw new Error(`${id} is an invalid sheet id.`)
    }

    return this._sheets[idx]
  }
}

export class HistoryState {
  // a counter that increases with each history action
  //pc?: number
  private _stepIndex: number

  // maintains the current position in the history stack
  // since the stack can include redo actions if we undo
  // an action
  private _steps: HistoryStep[]

  constructor(steps: HistoryStep[], stepIndex: number) {
    this._steps = steps
    this._stepIndex = stepIndex
  }

  get currentStepIndex(): number {
    return this._stepIndex
  }

  /**
   * Returns a copy of the current history stack. This
   * is to preven the stack being modified incorrectly.
   * Use the historyDispatch to modify the history
   * stack.
   */
  get steps(): HistoryStep[] {
    return this._steps.slice()
  }

  /**
   * Returns the current history step
   */
  get currentStep(): HistoryStep {
    return this._steps[this._stepIndex]
  }

  get last(): HistoryStep {
    return this._steps[this._steps.length - 1]
  }
}

export type HistoryAction =
  | { type: 'undo' }
  | { type: 'redo' }
  | {
      type: 'reset'
      name: string
      sheets: BaseDataFrame[]
    }
  | {
      type: 'add_step'
      name: string
      sheets: BaseDataFrame[]
      sheetId?: SheetId
    }
  | { type: 'add_sheets'; sheets: BaseDataFrame[] }
  | { type: 'goto_sheet'; sheetId: SheetId }
  | {
      type: 'replace_sheet'
      //name: string
      sheetId: SheetId
      sheet: BaseDataFrame
    }
  | { type: 'goto'; stepId: SheetId }
  | { type: 'remove'; stepId: SheetId }
  | { type: 'clear' }

export function historyReducer(
  state: HistoryState,
  action: HistoryAction
): HistoryState {
  function addStep(name: string, sheets: BaseDataFrame[]) {
    // add from the current history point, deleting any steps
    // ahead of the current point
    const stepIndex = state.currentStepIndex + 1

    return new HistoryState(
      [
        ...state.steps.slice(0, stepIndex),
        new HistoryStep(stepIndex, name, sheets),
      ],
      stepIndex
    )
  }

  function removeStep(step: SheetId) {
    step = getStepIndex(step, state.steps)

    if (step === -1) {
      return state
    }

    return new HistoryState(
      [...state.steps.slice(0, step), ...state.steps.slice(step + 1)],
      Math.min(state.currentStepIndex, step - 1)
    )
  }

  function addSheets(sheets: BaseDataFrame[]): HistoryState {
    const steps = [
      ...state.steps.slice(0, state.currentStepIndex),
      new HistoryStep(
        state.currentStepIndex,
        state.currentStep.name,
        [...state.currentStep.sheets, ...sheets],
        state.currentStep.sheets.length + 1
      ),
      ...state.steps.slice(state.currentStepIndex + 1),
    ]

    return new HistoryState(steps, state.currentStepIndex)
  }

  function changeSheet(sheetId: SheetId): HistoryState {
    // add from the current history point, deleting any steps
    // ahead of the current point
    const stepIndex = state.currentStepIndex

    const sheetIndex = getSheetIndex(sheetId, state.steps[stepIndex].sheets)

    if (sheetIndex === -1) {
      return state
    }

    // eslint-disable-next-line no-case-declarations
    const steps = [...state.steps]

    steps[stepIndex] = new HistoryStep(
      state.currentStepIndex,
      steps[stepIndex].name,
      steps[stepIndex].sheets,
      sheetIndex
    )

    //modify the steps, but do not
    return new HistoryState(steps, stepIndex)
  }

  function replaceSheet(sheetId: SheetId, sheet: BaseDataFrame): HistoryState {
    // add from the current history point, deleting any steps
    // ahead of the current point
    const stepIndex = state.currentStepIndex

    // truncate up to current point
    const steps = state.steps.slice(0, stepIndex)

    const step = state.currentStep

    const sheets = [...step.sheets]

    const sheetIndex = getSheetIndex(sheetId, sheets)

    if (sheetIndex !== -1) {
      // found the sheet so replace it
      sheets[sheetIndex] = sheet
    } else {
      // sheet not found so add it
      sheets.push(sheet)
    }

    const newStep = new HistoryStep(steps.length, step.name, sheets, sheetId)

    steps.push(newStep)

    //console.log("replace", steps)

    //modify the steps, but do not
    return new HistoryState(steps, steps.length - 1)
  }

  switch (action.type) {
    case 'undo':
      return new HistoryState(
        state.steps,
        Math.max(0, state.currentStepIndex - 1)
      )
    case 'redo':
      return new HistoryState(
        state.steps,
        Math.min(state.steps.length - 1, state.currentStepIndex + 1)
      )
    case 'goto':
      return new HistoryState(
        state.steps,
        Math.max(
          0,
          Math.min(
            state.steps.length - 1,
            getStepIndex(action.stepId, state.steps)
          )
        )
      )
    case 'add_step':
      return addStep(action.name, action.sheets)
    case 'add_sheets':
      return addSheets(action.sheets)
    case 'goto_sheet':
      return changeSheet(action.sheetId)
    case 'replace_sheet':
      return replaceSheet(action.sheetId, action.sheet) //, action.name)
    case 'reset':
      console.log('hist', action.name, action.sheets)
      return new HistoryState(
        [new HistoryStep(0, action.name, action.sheets)],
        0
      )
    case 'remove':
      return removeStep(action.stepId)

    case 'clear':
      return new HistoryState(defaultHistory(), 0)
    default:
      return state
  }
}

function defaultHistory() {
  return [new HistoryStep(0, 'Load default sheet', [INF_DATAFRAME])]
}

export function useHistory(): [HistoryState, Dispatch<HistoryAction>] {
  const [history, historyDispatch] = useReducer(
    historyReducer,
    new HistoryState(defaultHistory(), 0)
  )

  return [history, historyDispatch]
}

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

// export const SettingsContext = createContext<
//   [ISettingsState, Dispatch<SettingAction>]
// >([{ ...DEFAULT_SETTINGS }, () => {}])

export const HistoryContext = createContext<
  [HistoryState, Dispatch<HistoryAction>]
>([new HistoryState(defaultHistory(), 0), () => {}])

// export const HistoryDispatchContext = createContext<Dispatch<IHistoryAction>>(
//   () => {},
// )

export function HistoryProvider({ children }: IChildrenProps) {
  const [history, historyDispatch] = useHistory()

  return (
    <HistoryContext.Provider value={[history, historyDispatch]}>
      {children}
    </HistoryContext.Provider>
  )
}

/**
 * Load a default empty sheet for showing  the user where the spreadsheet
 * appears in the UI. Similar to how Excel starts with a blank sheet.
 *
 * @param historyDispatch send table to history
 */
// export function loadDefaultSheet(historyDispatch: Dispatch<HistoryAction>) {
//   historyDispatch({
//     type: "reset",
//     title: `Load`,
//     dataframes: [INF_DATAFRAME],
//   })
// }
