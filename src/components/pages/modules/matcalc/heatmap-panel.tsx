import {
  DEFAULT_HEATMAP_PROPS,
  HeatMapSvg,
  type IHeatMapProps,
} from '@components/plot/heatmap-svg'

import { SlidersIcon } from '@components/icons/sliders-icon'

import { type IClusterGroup } from '@lib/cluster-group'
import {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type RefObject,
} from 'react'

import { HeatmapPropsPanel } from './heatmap-props-panel'

import { BaseCol } from '@components/base-col'
import { type ITab } from '@components/tab-provider'
import { TabSlideBar } from '@components/tab-slide-bar'
import { ToolbarFooter } from '@components/toolbar/toolbar-footer'
import { ZoomSlider } from '@components/toolbar/zoom-slider'
import { HistoryContext } from '@hooks/use-history'
import { cn } from '@lib/class-names'
import { getFormattedShape } from '@lib/dataframe/dataframe-utils'
import { downloadImageAutoFormat } from '@lib/image-utils'

import {
  MessageContext,
  messageImageFileFormat,
} from '@components/pages/message-context'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { DATA_PANEL_CLS } from './data-panel'
import { PlotPropsContext } from './plot-props-context'
import { type IPlot } from './plots-context'

export const PLOT_CLS =
  'relative overflow-scroll custom-scrollbar grow bg-white'

export function makeDefaultHeatmapProps(style: string): IHeatMapProps {
  return {
    ...DEFAULT_HEATMAP_PROPS,
    style: style.includes('Dot') ? 'dot' : 'square',
  }
}

interface IHeatMapPanelProps {
  plot: IPlot
  groups: IClusterGroup[]
  canvasRef: RefObject<HTMLCanvasElement>
  downloadRef: RefObject<HTMLAnchorElement>
}

export const HeatMapPanel = forwardRef(function HeatMapPanel(
  { plot, groups, canvasRef, downloadRef }: IHeatMapPanelProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [plotProps, plotPropsDispatch] = useContext(PlotPropsContext)

  if (!plotProps.props.has(plot.id)) {
    return null
  }

  const displayProps: IHeatMapProps = plotProps.props.get(
    plot.id
  ) as IHeatMapProps

  const [history] = useContext(HistoryContext)

  // const [displayProps, setDisplayProps] = useState<IHeatMapProps>({
  //   ...DEFAULT_DISPLAY_PROPS,
  //   style: plot.type === "Dot Plot" ? "dot" : "square",
  // })

  const svgRef = useRef<SVGSVGElement>(null)

  const [scale, setScale] = useState(1)

  const [showSave, setShowSave] = useState(false)
  const [messageState, messageDispatch] = useContext(MessageContext)
  const [showSideBar, setShowSideBar] = useState(true)

  useEffect(() => {
    const messages = messageState.queue.filter(
      message => message.target === plot.name
    )

    messages.forEach(message => {
      if (message.text.includes('save')) {
        if (message.text.includes(':')) {
          downloadImageAutoFormat(
            svgRef,
            canvasRef,
            downloadRef,
            `heatmap.${messageImageFileFormat(message)}`
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
    //setDisplayProps({ ...displayProps, scale })
  }

  const plotRightTabs: ITab[] = [
    {
      //id: nanoid(),
      name: 'Display',
      icon: <SlidersIcon />,
      content: <HeatmapPropsPanel plot={plot} cf={plot.cf} />,
    },
  ]

  const svg = useMemo(
    () => (
      <BaseCol className={cn(DATA_PANEL_CLS, 'grow')}>
        <div className={PLOT_CLS}>
          <HeatMapSvg
            ref={svgRef}
            cf={plot.cf}
            groups={groups}
            displayProps={displayProps}
          />
        </div>
      </BaseCol>
    ),
    [plot, groups, displayProps]
  )

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
              `heatmap.${format.ext}`
            )
            setShowSave(false)
          }}
          onCancel={() => setShowSave(false)}
        />
      )}

      {/* <ResizablePanelGroup
          direction="horizontal"
          id="plot-resizable-panels"
          //autoSaveId="plot-resizable-panels"
          className="grow"
        >
          <ResizablePanel
            id="plot-svg"
            order={1}
            defaultSize={75}
            minSize={50}
            className="flex flex-col pl-2 pt-2 pb-2"
          >
            <div className="custom-scrollbar relative grow overflow-scroll rounded-lg border bg-white">
              <HeatMapSvg
                ref={svgRef}
                cf={plot.cf}
                groups={groups}
                displayProps={displayProps}
              />
            </div>
          </ResizablePanel>
          <ThinHResizeHandle />
          <ResizablePanel
            id="plot-svg-right"
            order={2}
            className="flex flex-col"
            defaultSize={25}
            minSize={15}
            collapsible={true}
            collapsedSize={0}
          >
            <SideBarTextTabs tabs={plotRightTabs} />
          </ResizablePanel>
        </ResizablePanelGroup> */}

      <TabSlideBar
        tabs={plotRightTabs}
        side="right"
        //tabs={plotRightTabs}
        //onValueChange={setSelectedTab}
        //value={selectedTab}
        open={showSideBar}
        onOpenChange={setShowSideBar}
      >
        {svg}
      </TabSlideBar>

      <ToolbarFooter className="shrink-0 grow-0 ">
        <span>{getFormattedShape(history.currentStep.currentSheet)} </span>
        <></>
        <>
          <ZoomSlider scale={scale} onZoomChange={adjustScale} />
        </>
      </ToolbarFooter>

      <a ref={downloadRef} className="hidden" href="#" />

      <canvas ref={canvasRef} width={0} height={0} className="hidden" />
    </>
  )
})
