import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { APP_NAME, NO_DIALOG, TEXT_OK, type IDialogParams } from '@consts'
import { cn } from '@lib/class-names'

import { BaseRow } from '@components/base-row'
import { HistoryContext } from '@components/history-provider'
import { TrashIcon } from '@components/icons/trash-icon'
import { PropsPanel } from '@components/props-panel'
import { Button } from '@components/shadcn/ui/themed/button'
import { V_SCROLL_CHILD_CLS, VScrollPanel } from '@components/v-scroll-panel'
import { getFormattedShape } from '@lib/dataframe/dataframe-utils'
import { motion } from 'framer-motion'
import {
  forwardRef,
  useContext,
  useEffect,
  useState,
  type ForwardedRef,
} from 'react'

interface IProps {
  defaultWidth?: number
}

export const HistoryPanel = forwardRef(function HistoryPanel(
  { defaultWidth = 3.2 }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  const [history, historyDispatch] = useContext(HistoryContext)
  //const [_scale, setScale] = useState(1)
  //const lineRef = useRef<SVGLineElement>(null)
  //const initial = useRef(true)

  //const currentStep = useRef<number>(-1)

  const w = `${defaultWidth}rem`

  //const h = Math.round((1 / history.steps.length) * 100)

  //const offset = h * 0.15
  //Math.round((1-nh)*100)}

  // useEffect(() => {

  //   const dir = history.currentStepIndex - currentStep.current
  //   //const ext = _scale > 1 ? 0 : 2
  //   const y1 = h * history.currentStepIndex + offset
  //   const y2 = h * (history.currentStepIndex + 1) - offset
  //   const duration = initial.current ? 0 : ANIMATION_DURATION_S

  //   if (dir > 0) {
  //     gsap
  //       .timeline()
  //       .to(lineRef.current, {
  //         attr: { y2 },
  //         duration,
  //         ease: "power2.out",
  //       })
  //       .to(
  //         lineRef.current,
  //         {
  //           attr: { y1 },
  //           duration,
  //           ease: "power2.out",
  //         },
  //         "-=50%",
  //       )
  //   } else if (dir < 0) {
  //     gsap
  //       .timeline()
  //       .to(lineRef.current, {
  //         attr: { y1 },
  //         duration,
  //         ease: "power2.out",
  //       })
  //       .to(
  //         lineRef.current,
  //         {
  //           attr: { y2 },
  //           duration,
  //           ease: "power2.out",
  //         },
  //         "-=50%",
  //       )
  //   } else {
  //     gsap.timeline().to(lineRef.current, {
  //       attr: { y1, y2 },
  //       duration,
  //       ease: "power2.out",
  //     })
  //   }

  //   currentStep.current = history.currentStepIndex
  //   initial.current = false
  // }, [_scale, history.currentStepIndex])

  const [tabPos, setTabPos] = useState<{ y: string; height: string }>({
    y: '0rem',
    height: `${defaultWidth}rem`,
  })

  useEffect(() => {
    const x = history.currentStepIndex * defaultWidth

    //const width = tabs[selectedTab.index].size ?? defaultWidth

    setTabPos({ y: `${x}rem`, height: `${defaultWidth - 1}rem` })
  }, [history.currentStepIndex])

  return (
    <>
      {showDialog.name === 'Clear' && (
        <OKCancelDialog
          open={true}
          showClose={true}
          title={APP_NAME}
          onReponse={r => {
            if (r === TEXT_OK) {
              historyDispatch({
                type: 'clear',
              })
            }

            setShowDialog(NO_DIALOG)
          }}
        >
          Are you sure you want to clear the history?
        </OKCancelDialog>
      )}

      {showDialog.name === 'Delete' && (
        <OKCancelDialog
          open={true}
          showClose={true}
          onReponse={r => {
            if (r === TEXT_OK) {
              historyDispatch({
                type: 'remove',
                stepId: showDialog.params!.step,
              })
            }

            setShowDialog(NO_DIALOG)
          }}
        >
          Are you sure you want to delete the selected history item?
        </OKCancelDialog>
      )}

      <PropsPanel ref={ref} className="gap-y-2">
        <BaseRow className="grow gap-x-1">
          <VScrollPanel asChild={true}>
            <ul
              className={cn(
                V_SCROLL_CHILD_CLS,
                'flex flex-col relative group pl-1'
              )}
              // onMouseEnter={() => {
              //   setScale(2)
              // }}
              // onMouseLeave={() => {
              //   setScale(1)
              // }}
            >
              {history.steps.map((h, hi) => (
                <li
                  key={hi}
                  className="group flex grow flex-row items-center justify-between rounded-lg border border-transparent hover:bg-background hover:border-border/40 trans-all"
                  style={{
                    height: w,
                  }}
                >
                  <button
                    aria-label={`Goto history step ${hi + 1}`}
                    className="flex flex-col gap-y-0.5 grow px-2.5 justify-start items-start overflow-hidden"
                    onClick={() =>
                      historyDispatch({
                        type: 'goto',
                        stepId: hi,
                      })
                    }
                  >
                    <span className="font-medium text-left truncate">{`${hi + 1}. ${h.name}`}</span>

                    <span className="text-left text-foreground/50 truncate">
                      {`${getFormattedShape(h.sheets[0])}${h.sheets.length > 1 ? `, ${h.sheets.length - 1} more...` : ''}`}
                    </span>
                  </button>

                  {/* {hi > 0 && (
                <Tooltip content="Delete history item">
                  <button
                    disabled={hi == 0}
                    onClick={() =>
                      setShowDialog({ name: "Delete", params: { step: hi } })
                    }
                    className={cn(
                      FOCUS_RING_CLS,
                      "group aspect-square shrink-0 stroke-muted-foreground hover:stroke-foreground",
                    )}
                  >
                    <CloseIcon w="w-3" />
                  </button>
                </Tooltip>
              )} */}
                </li>
              ))}

              {/* <VToolbarTabLine
                ref={lineRef}
                w={2}
                lineClassName={TAB_LINE_CLS}
              /> */}

              <motion.span
                className="absolute left-0 top-2 w-[2px] z-0 bg-theme rounded-md"
                animate={{ ...tabPos }}
                initial={false}
                transition={{ ease: 'easeInOut' }}
              />
            </ul>
          </VScrollPanel>

          <BaseRow className="border-l border-border/50 pl-1 shrink-0">
            <Button
              variant="muted"
              multiVariants="icon"
              ripple={false}
              onClick={() => {
                if (history.steps.length > 1) {
                  setShowDialog({ name: 'Clear', params: {} })
                }
              }}
              title="Clear history"

              //className="fill-foreground/50 hover:fill-red-500"
            >
              <TrashIcon />
            </Button>
          </BaseRow>
        </BaseRow>
      </PropsPanel>
    </>
  )
})
