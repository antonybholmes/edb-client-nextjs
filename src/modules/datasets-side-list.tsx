import { useDataSets, type IDataSetExt } from "@hooks/use-datasets"
import { cn } from "@lib/class-names"
import { useState, type Dispatch, type KeyboardEvent } from "react"

interface IProps {
  selectedDataSets: any
  selectedDataSetsDispatch: Dispatch<any>
}

export function DataSetsSideList({
  selectedDataSets,
  selectedDataSetsDispatch,
}: IProps) {
  const [multiSelect, setMultiSelect] = useState(false)

  const dataSets = useDataSets({ dataset: "RNASeq", species: "Human" })

  function setSelected(name: string, isSelected: boolean) {
    // if multi-select not enabled, we always make the
    // item selected
    selectedDataSetsDispatch({
      type: multiSelect ? "update" : "set",
      name,
      isSelected: multiSelect ? isSelected : true,
    })
  }

  function onKeyDown(e: KeyboardEvent) {
    let preventDefault = false

    switch (e.code) {
      case "Shift":
      case "ShiftLeft":
      case "ShiftRight":
        setMultiSelect(true)
        preventDefault = true
        break
      default:
        break
    }

    if (preventDefault) {
      e.preventDefault()
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    let preventDefault = false

    switch (e.code) {
      case "Shift":
      case "ShiftLeft":
      case "ShiftRight":
        setMultiSelect(false)
        preventDefault = true
        break
      default:
        break
    }

    if (preventDefault) {
      e.preventDefault()
    }
  }

  return (
    <ul
      className="flex flex-col text-sm"
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    >
      {dataSets.map((set: IDataSetExt, seti: number) => {
        return (
          <li
            key={set.name}
            className={cn(
              "flex flex-row items-center justify-between border-b border-blue-200 px-4 py-1",
              [
                selectedDataSets.selected[set.name],
                "bg-blue-100",
                "bg-blue-50",
              ],
            )}
            tabIndex={0}
            onClick={() =>
              setSelected(set.name, !selectedDataSets.selected[set.name])
            }
          >
            <span>{set.name}</span>
            <span className="text-blue flex h-6 w-7 flex-row items-center justify-center border border-blue-200 bg-white p-2">
              {set.samples.length}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
