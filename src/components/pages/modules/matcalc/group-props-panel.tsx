import { OpenFiles } from '@components/pages/open-files'

import { OpenIcon } from '@icons/open-icon'
import { SaveIcon } from '@icons/save-icon'
import { type IClusterGroup } from '@lib/cluster-group'

import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'

import { BaseCol } from '@components/base-col'
import { PenIcon } from '@components/icons/pen-icon'
import { PlusIcon } from '@components/icons/plus-icon'
import { TrashIcon } from '@components/icons/trash-icon'
import { PropsPanel } from '@components/props-panel'
import { Button } from '@components/shadcn/ui/themed/button'
import { SelectionRangeContext } from '@components/table/use-selection-range'
import { VCenterRow } from '@components/v-center-row'
import { TEXT_OK } from '@consts'
import { cn } from '@lib/class-names'
import {
  getColIdxFromGroup,
  getColNamesFromGroup,
  type IBaseClusterGroup,
} from '@lib/cluster-group'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { download, downloadJson } from '@lib/download-utils'
import { range } from '@lib/math/range'
import { makeRandId, nanoid } from '@lib/utils'
import { TRANS_COLOR_CLS } from '@theme'
import {
  forwardRef,
  useContext,
  useEffect,
  useState,
  type ForwardedRef,
  type ReactElement,
  type RefObject,
} from 'react'
import { GroupDialog } from './group-dialog'
import { GroupsContext } from './groups-context'

import { DraggableListFramer } from '@components/draggable-list/draggable-list-framer'
import { VerticalGripIcon } from '@components/icons/vertical-grip-icon'
import { VScrollPanel } from '@components/v-scroll-panel'
import MODULE_INFO from './module.json'

const MAX_LABELS = 8

export interface IGroupCallback {
  group?: IBaseClusterGroup
  callback?: (name: string, search: string[], color: string) => void
}

interface IGroupPanelButtonProps {
  index: number
  df: BaseDataFrame | null
  group: IClusterGroup
  editGroup: (group: IClusterGroup) => void
  setDelGroup: (group: IClusterGroup) => void
}

export function GroupsPanelButton({
  index,
  df,
  group,
  editGroup,
  setDelGroup,
}: IGroupPanelButtonProps) {
  const [hover, setHover] = useState(false)
  //const [delHover, setDelHover] = useState(false)

  const cols = getColNamesFromGroup(df, group)

  return (
    <li
      key={group.id}
      className="trans-color flex flex-row justify-center overflow-hidden rounded-md p-3 gap-x-4"
      style={{
        backgroundColor: hover ? `${group.color}30` : `${group.color}15`,
        //borderColor: hover ? `${group.color}` : `${group.color}00`,
        color: group.color,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <BaseCol className="gap-y-0 grow">
        <p className="font-semibold">
          {index + 1}. {group.name} (
          {`${cols.length} column${cols.length !== 1 ? 's' : ''}`})
        </p>
        {/* <p>{`${cols.length} column${cols.length !== 1 ? "s" : ""}`}</p> */}
        {cols.length > 0 && (
          <p>
            {cols.slice(0, MAX_LABELS).join(', ')}
            {cols.length > MAX_LABELS ? '...' : ''}
          </p>
        )}
      </BaseCol>

      <BaseCol className="gap-y-2 items-start">
        <button
          name={`Edit ${group.name} group`}
          className={cn(TRANS_COLOR_CLS, 'opacity-50 hover:opacity-100 ')}
          style={{
            fill: group.color,
          }}
          onClick={() => editGroup(group)}
        >
          <PenIcon fill="" />
        </button>

        <button
          onClick={() => setDelGroup(group)}
          className={cn(TRANS_COLOR_CLS, 'opacity-50 hover:opacity-100')}
          style={{
            fill: group.color,
          }}
          name={`Delete ${group.name} group`}
          //onMouseEnter={() => setDelHover(true)}
          //onMouseLeave={() => setDelHover(false)}
        >
          <TrashIcon fill="" />
        </button>
      </BaseCol>
    </li>
  )
}

export interface IProps {
  df: BaseDataFrame | null
  downloadRef: RefObject<HTMLAnchorElement>
  onCancel?: () => void
}

export const GroupPropsPanel = forwardRef(function GroupPropsPanel(
  { df, downloadRef }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [open, setOpen] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [delGroup, setDelGroup] = useState<IClusterGroup | null>(null)
  const [groups, groupsDispatch] = useContext(GroupsContext)

  const [selection] = useContext(SelectionRangeContext)

  const [openGroupDialog, setOpenGroupDialog] = useState<
    IGroupCallback | undefined
  >(undefined)

  const [groupValues, setGroupValues] = useState<string[]>([])
  const [order, setOrder] = useState<number[]>([])
  const [items, setItems] = useState<ReactElement[]>([])

  function GroupItem({ group }: { group: IClusterGroup }) {
    const cols = getColNamesFromGroup(df, group)
    const [drag, setDrag] = useState(false)

    return (
      <VCenterRow
        key={group.name}
        data-drag={drag}
        className="group grow relative h-18 w-full overflow-hidden py-2.5 pl-2 pr-3 gap-x-3 data-[drag=false]:hover:bg-muted data-[drag=true]:bg-background rounded-md"
        // style={{
        //   backgroundColor: "white", //`${group.color}40`,
        // }}
        onMouseDown={() => setDrag(true)}
        onMouseUp={() => setDrag(false)}
      >
        <VCenterRow className="cursor-ns-resize">
          <VerticalGripIcon
            w="h-5"
            fill=""
            lineStyle={{
              backgroundColor: group.color,
            }}
          />
        </VCenterRow>

        <BaseCol
          className="grow h-full gap-y-1"
          style={{
            color: group.color,
          }}
        >
          <VCenterRow
            className="justify-between"
            style={{
              fill: group.color,
            }}
          >
            <span className="font-semibold">{`${group.name}: ${cols.length} column${cols.length !== 1 ? 's' : ''}`}</span>

            <VCenterRow className="gap-x-1 opacity-0 group-hover:opacity-100 trans-opacity">
              <button
                title={`Edit ${group.name} group`}
                className="opacity-50 hover:opacity-100 trans-opacity"
                onClick={() => editGroup(group)}
              >
                <PenIcon fill="" />
              </button>

              <button
                onClick={() => setDelGroup(group)}
                className="opacity-50 hover:opacity-100 trans-opacity"
                style={{
                  fill: group.color,
                }}
                title={`Delete ${group.name} group`}
                //onMouseEnter={() => setDelHover(true)}
                //onMouseLeave={() => setDelHover(false)}
              >
                <TrashIcon fill="" />
              </button>
            </VCenterRow>
          </VCenterRow>

          <span>
            {cols.length > 0 && (
              <p>
                {`${cols.slice(0, MAX_LABELS).join(', ')}${cols.length > MAX_LABELS ? '...' : ''}`}
              </p>
            )}
          </span>
        </BaseCol>
        {/* {!drag && (
          <span className="absolute bottom-0 h-px bg-border left-2 right-2" />
        )} */}
      </VCenterRow>
    )
  }

  useEffect(() => {
    setGroupValues(groups.map(g => g.name))
    setOrder(range(0, groups.length))
    setItems(
      groups.map((group, gi) => {
        return <GroupItem group={group} key={gi} />
      })
    )
  }, [groups])

  //const [groups, setGroups] = useState<IGroup[]>([])

  // useEffect(() => {
  //   setGroups([])
  // }, [df])

  function onFileChange(message: string, files: FileList | null) {
    if (!files) {
      return
    }

    const file = files[0]

    //setFile(files[0])
    //setShowLoadingDialog(true)

    const fileReader = new FileReader()

    fileReader.onload = e => {
      const result = e.target?.result

      if (result) {
        // since this seems to block rendering, delay by a second so that the
        // animation has time to start to indicate something is happening and
        // then finish processing the file
        const text: string =
          typeof result === 'string' ? result : Buffer.from(result).toString()

        const g = JSON.parse(text)

        if (Array.isArray(g)) {
          groupsDispatch({ type: 'set', groups: g })
        }
      }
    }

    fileReader.readAsText(file)

    //setShowFileMenu(false)
  }

  function addGroup() {
    if (!df) {
      return
    }

    let group: IBaseClusterGroup | undefined = undefined

    if (selection.start.c !== -1) {
      group = {
        name: '',
        search: range(selection.start.c, selection.end.c + 1).map(i =>
          df.getColName(i)
        ),
        color: '',
      }
    }

    setOpenGroupDialog({
      group,
      callback: (name: string, search: string[], color: string) => {
        const g = { name, search, color }

        const indices = getColIdxFromGroup(df, g)

        //if (indices.length > 0) {
        const newGroups = [
          ...groups,
          { id: nanoid(), name, search, color, indices },
        ]

        groupsDispatch({ type: 'set', groups: newGroups })
        setOpenGroupDialog(undefined)
        //}
      },
    })
  }

  function editGroup(group: IClusterGroup) {
    if (!df) {
      return
    }

    setOpenGroupDialog({
      group,
      callback: (name: string, search: string[], color: string) => {
        const lcSearch = search.map(s => s.toLowerCase())
        const indices: number[] = df.columns.values
          .map(
            (col, ci) => [ci, col.toString().toLowerCase()] as [number, string]
          )
          .filter((c: [number, string]) => {
            for (const x of lcSearch) {
              if (c[1].includes(x)) {
                return true
              }
            }

            return false
          })
          .map((c: [number, string]) => c[0])

        // only update group if search changes actually
        // result in items being found, otherwise just
        // keep the old group
        if (indices.length > 0) {
          const newGroups = groups.map(g =>
            g.id === group.id ? { ...g, name, search, color, indices } : g
          )
          //setGroups(g)
          //onGroupsChange?.(newGroups)
          groupsDispatch({ type: 'set', groups: newGroups })
        }

        setOpenGroupDialog(undefined)
      },
    })
  }

  function downloadCls() {
    if (!df || groups.length < 1) {
      return
    }

    const groupMap = Object.fromEntries(
      order
        .map(i => groups[i])
        .map(group => {
          return getColIdxFromGroup(df, group).map(col => [col, group.name])
        })
        .flat()
    )

    const names: string[] = []
    const used: string[] = []

    range(0, df.shape[1]).forEach((c: number) => {
      const n = groupMap[c]
      names.push(n)
      if (!used.includes(n)) {
        used.push(n)
      }
    })

    const text: string = [
      `${df.shape[1]} ${groups.length} 1`,
      `# ${used.join(' ')}`,
      `${names.join(' ')}`,
    ].join('\n')

    download(text, downloadRef, 'groups.cls')
  }

  return (
    <>
      {openGroupDialog?.callback && (
        <GroupDialog
          group={openGroupDialog?.group}
          callback={openGroupDialog?.callback}
          onCancel={() => setOpenGroupDialog(undefined)}
        />
      )}

      {confirmClear && (
        <OKCancelDialog
          title={MODULE_INFO.name}
          onReponse={r => {
            if (r === TEXT_OK) {
              //onGroupsChange?.([])
              groupsDispatch({ type: 'clear' })
            }

            setConfirmClear(false)
          }}
        >
          Are you sure you want to clear all groups?
        </OKCancelDialog>
      )}

      {delGroup !== null && (
        <OKCancelDialog
          showClose={true}
          title={MODULE_INFO.name}
          onReponse={r => {
            if (r === TEXT_OK) {
              groupsDispatch({ type: 'remove', id: delGroup!.id })
              // onGroupsChange &&
              //   onGroupsChange([
              //     ...groups.slice(0, delId),
              //     ...groups.slice(delId + 1),
              //   ])
            }
            setDelGroup(null)
          }}
        >
          {`Are you sure you want to delete the ${
            delGroup !== null ? delGroup.name : 'selected'
          } group?`}
        </OKCancelDialog>
      )}

      {showSaveDialog && (
        <OKCancelDialog
          title="Save Groups"
          open={showSaveDialog}
          showClose={true}
          buttons={[]}
          onReponse={r => {
            if (r === TEXT_OK) {
              //groupsDispatch({ type: "remove", id: delGroup!.id })
              // onGroupsChange &&
              //   onGroupsChange([
              //     ...groups.slice(0, delId),
              //     ...groups.slice(delId + 1),
              //   ])
            }
            setShowSaveDialog(false)
          }}
        >
          <Button
            variant="theme"
            size="lg"
            onClick={() => {
              downloadJson(
                order.map(i => groups[i]),
                downloadRef,
                'groups.json'
              )
              setShowSaveDialog(false)
            }}
            aria-label="Open groups"
          >
            Group (.json)
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              downloadCls()
              setShowSaveDialog(false)
            }}
            aria-label="Open groups"
          >
            GSEA (.cls)
          </Button>
        </OKCancelDialog>
      )}

      <PropsPanel className="gap-y-2">
        <VCenterRow className="justify-start">
          <Button
            variant="accent"
            multiProps="icon"
            //rounded="full"
            ripple={false}
            onClick={() => setOpen(makeRandId('open'))}
            title="Open groups"
            //className="fill-foreground/50 hover:fill-foreground"
          >
            <OpenIcon />
          </Button>

          <Button
            variant="accent"
            multiProps="icon"
            //rounded="full"
            ripple={false}
            onClick={() => setShowSaveDialog(true)}
            title="Save groups"
          >
            <SaveIcon className="rotate-180" />
          </Button>

          <Button
            variant="accent"
            multiProps="icon"
            //rounded="full"
            ripple={false}
            onClick={() => addGroup()}
            title="Add group"
          >
            <PlusIcon fill="stroke-foreground" />
          </Button>

          {groups.length > 0 && (
            <Button
              variant="accent"
              multiProps="icon"
              //rounded="full"
              ripple={false}
              onClick={() => setConfirmClear(true)}
              title="Clear all groups"
            >
              <TrashIcon />
            </Button>
          )}
        </VCenterRow>
        <VScrollPanel asChild={false}>
          <DraggableListFramer
            order={order}
            //items={items}
            onOrderChange={order => {
              setOrder(order)
            }}
            h={50}
          >
            {items}
          </DraggableListFramer>
        </VScrollPanel>

        {/* <ScrollAccordion
          type="multiple"
          value={groupValues}
          onValueChange={setGroupValues}
        >
          {groups.map((group, gi) => {
            const cols = getColNamesFromGroup(df, group)

            return (
              <AccordionItem value={group.name} key={group.name}>
                <AccordionTrigger
                  style={{
                    color: group.color,
                  }}
                  arrowStyle={{
                    stroke: group.color,
                  }}
                  rightChildren={
                    <VCenterRow className="gap-x-1">
                      <button
                        title={`Edit ${group.name} group`}
                        className="opacity-50 hover:opacity-90 trans-opacity"
                        style={{
                          fill: group.color,
                        }}
                        onClick={() => editGroup(group)}
                      >
                        <PenIcon fill="" />
                      </button>

                      <button
                        onClick={() => setDelGroup(group)}
                        className="opacity-50 hover:opacity-90 trans-opacity"
                        style={{
                          fill: group.color,
                        }}
                        title={`Delete ${group.name} group`}
                        //onMouseEnter={() => setDelHover(true)}
                        //onMouseLeave={() => setDelHover(false)}
                      >
                        <TrashIcon fill="" />
                      </button>
                    </VCenterRow>
                  }
                >
                  {`${group.name}: ${cols.length} column${cols.length !== 1 ? "s" : ""}`}
                </AccordionTrigger>
                <AccordionContent
                  innerClassName="flex flex-row gap-x-2"
                  innerStyle={{
                    color: group.color,
                  }}
                >
                  {cols.length > 0 && (
                    <p>
                      {`${cols.slice(0, MAX_LABELS).join(", ")}${cols.length > MAX_LABELS ? "..." : ""}`}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </ScrollAccordion> */}
      </PropsPanel>
      <OpenFiles
        open={open}
        //onOpenChange={() => setOpen("")}
        onFileChange={onFileChange}
        fileTypes={['json']}
      />
    </>
  )
})
