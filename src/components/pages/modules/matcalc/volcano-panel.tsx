import { SlidersIcon } from '@components/icons/sliders-icon'

import {
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
  type ForwardedRef,
  type RefObject,
} from 'react'

import { BaseCol } from '@components/base-col'
import { HistoryContext } from '@components/history-provider'
import { autoLim } from '@components/plot/axis'
import {
  DEFAULT_DISPLAY_PROPS as DEFAULT_VOLCANO_PROPS,
  VolcanoPlotSvg,
  type IVolcanoProps,
} from '@components/plot/volcano-plot-svg'
import { TabSlideBar } from '@components/tab-slide-bar'
import { ToolbarFooter } from '@components/toolbar/toolbar-footer'
import { ZoomSlider } from '@components/toolbar/zoom-slider'
import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import {
  findCol,
  getFormattedShape,
  getNumCol,
} from '@lib/dataframe/dataframe-utils'
import { downloadImageAutoFormat } from '@lib/image-utils'
import { MAIN_CLUSTER_FRAME } from '@lib/math/hcluster'

import { range } from '@lib/math/range'

import {
  MessageContext,
  messageImageFileFormat,
} from '@components/pages/message-context'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import type { ITab } from '@components/tab-provider'
import { PlotPropsContext } from './plot-props-context'
import { type IPlot } from './plots-context'
import { VolcanoPropsPanel } from './volcanco-props-panel'

export const VOLCANO_X = 'Log2 fold change'
export const VOLCANO_Y = '-log10 p-value'

export function makeDefaultVolcanoProps(
  df: BaseDataFrame,
  x: string = VOLCANO_X,
  y: string = VOLCANO_Y
): IVolcanoProps {
  const xdata = getNumCol(df, findCol(df, x))

  const ydata = y ? getNumCol(df, findCol(df, y)) : range(0, df.shape[0])

  const xlim = autoLim([Math.min(...xdata), Math.max(...xdata)])
  const ylim = autoLim([Math.min(...ydata), Math.max(...ydata)])

  let props: IVolcanoProps = { ...DEFAULT_VOLCANO_PROPS }

  props = {
    ...props,
    axes: {
      ...props.axes,
      xaxis: {
        ...props.axes.xaxis,
        domain: xlim,
      },
      yaxis: {
        ...props.axes.yaxis,
        domain: ylim,
      },
    },
  }

  return props
}

interface IPanelProps {
  plot: IPlot
  x?: string
  y?: string
  canvasRef: RefObject<HTMLCanvasElement>
  downloadRef: RefObject<HTMLAnchorElement>
}

export const VolcanoPanel = forwardRef(function VolcanoPanel(
  {
    plot,
    x = 'Log2 fold change',
    y = '-log10 p-value',
    canvasRef,
    downloadRef,
  }: IPanelProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [plotProps, plotPropsDispatch] = useContext(PlotPropsContext)

  if (!plotProps.props.has(plot.id)) {
    return null
  }

  const displayProps: IVolcanoProps = plotProps.props.get(
    plot.id
  ) as IVolcanoProps

  const [history] = useContext(HistoryContext)
  const [messageState, messageDispatch] = useContext(MessageContext)

  const svgRef = useRef<SVGSVGElement>(null)

  const [scale, setScale] = useState(1)

  const [showSave, setShowSave] = useState(false)

  const df = plot.cf.dataframes[MAIN_CLUSTER_FRAME]

  // const [displayProps, setDisplayProps] = useState<IVolcanoProps>(() => {
  //   const xdata = getNumCol(df, findCol(df, x))

  //   const ydata = y ? getNumCol(df, findCol(df, y)) : range(0, df.shape[0])

  //   const xlim = autoLim([Math.min(...xdata), Math.max(...xdata)])
  //   const ylim = autoLim([Math.min(...ydata), Math.max(...ydata)])

  //   return makeDefaultVolcanoProps(xlim, ylim)
  // })

  const [showSideBar, setShowSideBar] = useState(true)

  useEffect(() => {
    const messages = messageState.queue.filter(m => m.target === plot.id)

    messages.forEach(message => {
      if (message.text.includes('save')) {
        if (message.text.includes(':')) {
          downloadImageAutoFormat(
            svgRef,
            canvasRef,
            downloadRef,
            `volcano.${messageImageFileFormat(message)}`
          )
        } else {
          setShowSave(true)
        }
      }

      if (message.text.includes('show-sidebar')) {
        setShowSideBar(!showSideBar)
      }
    })

    if (messageState.queue.length > 0) {
      messageDispatch({ type: 'clear' })
    }

    //downloadSvgAsPng(svgRef, canvasRef, downloadRef)
  }, [messageState])

  function adjustScale(scale: number) {
    setScale(scale)

    plotPropsDispatch({
      type: 'update',
      id: plot.id,
      props: { ...displayProps, scale },
    })
  }

  const plotRightTabs: ITab[] = [
    {
      //id: nanoid(),
      name: 'Display',
      icon: <SlidersIcon />,

      content: <VolcanoPropsPanel df={df} x={x} y={y} plot={plot} />,
    },
  ]

  console.log('volly')

  return (
    <>
      {showSave && (
        <SaveImageDialog
          open="open"
          onSave={format => {
            downloadImageAutoFormat(
              svgRef,
              canvasRef,
              downloadRef,
              `volcanco.${format.ext}`
            )
            setShowSave(false)
          }}
          onCancel={() => setShowSave(false)}
        />
      )}

      <BaseCol ref={ref} className="h-full overflow-hidden grow">
        {/* <ResizablePanelGroup
          direction="horizontal"
          id="volcano-resizable-panels"
          className="overflow-hidden"
          //autoSaveId="volcano-resizable-panels"
        >
          <ResizablePanel
            id="volcano-svg"
            order={1}
            defaultSize={75}
            minSize={50}
            className="flex grow flex-col pt-2 pb-2 pl-2"
          >
            <div className="custom-scrollbar relative grow overflow-scroll rounded-lg border bg-white">
              <VolcanoPlotSvg
                ref={svgRef}
                df={plot.cf.dataframes[MAIN_CLUSTER_FRAME]}
                displayProps={displayProps}
                x={x}
                y={y}
              />
            </div>
          </ResizablePanel>
          <ThinHResizeHandle />
          <ResizablePanel
            id="volcano-svg-right"
            order={2}
            className="flex flex-col overflow-hidden"
            defaultSize={25}
            minSize={15}
            collapsedSize={0}
            collapsible={true}
          >
            <SideBarTextTabs tabs={plotRightTabs} />
          </ResizablePanel>
        </ResizablePanelGroup> */}

        <TabSlideBar
          side="right"
          tabs={plotRightTabs}
          //onValueChange={setSelectedTab}
          //value={selectedTab}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <div className="custom-scrollbar relative grow overflow-scroll rounded-lg border bg-white mb-1 ml-1">
            <VolcanoPlotSvg
              ref={svgRef}
              df={plot.cf.dataframes[MAIN_CLUSTER_FRAME]}
              displayProps={displayProps}
              x={x}
              y={y}
            />
          </div>
        </TabSlideBar>

        <ToolbarFooter className="shrink-0 grow-0 justify-end">
          <span>{getFormattedShape(history.currentStep.currentSheet)}</span>
          <></>
          <>
            <ZoomSlider scale={scale} onZoomChange={adjustScale} />
          </>
        </ToolbarFooter>
      </BaseCol>
    </>
  )
})
