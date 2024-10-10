'use client'

import { ToolbarFooter } from '@components/toolbar/toolbar-footer'

import { BaseCol } from '@components/base-col'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@components/toolbar/toolbar'

import { ZOOM_SCALES, ZoomSlider } from '@components/toolbar/zoom-slider'

import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { ToolbarButton } from '@components/toolbar/toolbar-button'
import { VCenterRow } from '@components/v-center-row'

import { LayersIcon } from '@components/icons/layers-icon'
import { TableIcon } from '@components/icons/table-icon'
import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { FileImageIcon } from '@icons/file-image-icon'
import { FileLinesIcon } from '@icons/file-lines-icon'
import { SaveIcon } from '@icons/save-icon'
import { SlidersIcon } from '@icons/sliders-icon'
import { NUM_INDEX } from '@lib/dataframe'
import { DataIndex } from '@lib/dataframe/data-index'
import { DataFrame } from '@lib/dataframe/dataframe'

import {
  downloadImageAutoFormat,
  downloadSvg,
  downloadSvgAsPng,
} from '@lib/image-utils'
import { makeCombinations } from '@lib/math/math'

import {
  FOCUS_RING_CLS,
  PILL_BUTTON_CLS,
  SM_ICON_BUTTON_CLS,
  TOOLBAR_BUTTON_ICON_CLS,
  XS_ICON_BUTTON_CLS,
} from '@theme'
import * as d3 from 'd3'

import { useContext, useEffect, useRef, useState } from 'react'
import { sortAreas, VennDiagram } from '../../../../ext/benfred/venn/diagram'

import { UploadIcon } from '@components/icons/upload-icon'
import { OpenFiles, type IFileOpen } from '@components/pages/open-files'
import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { Button } from '@components/shadcn/ui/themed/button'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import { Input } from '@components/shadcn/ui/themed/input'
import { NumericalInput } from '@components/shadcn/ui/themed/numerical-input'
import {
  ResizablePanel,
  ResizablePanelGroup,
} from '@components/shadcn/ui/themed/resizable'
import { Textarea } from '@components/shadcn/ui/themed/textarea'
import { Textarea3 } from '@components/shadcn/ui/themed/textarea3'
import { ThinVResizeHandle } from '@components/split-pane/thin-v-resize-handle'
import { TabSlideBar } from '@components/tab-slide-bar'

import {
  HistoryContext,
  HistoryProvider,
  useHistory,
} from '@components/history-provider'
import { ToolbarOpenFile } from '@components/toolbar/toolbar-open-files'
import { ToolbarTabButton } from '@components/toolbar/toolbar-tab-button'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'
import {
  NO_DIALOG,
  TEXT_CLEAR,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@consts'
import { useWindowScrollListener } from '@hooks/use-window-scroll-listener'
import { ChartIcon } from '@icons/chart-icon'
import { OpenIcon } from '@icons/open-icon'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { cn } from '@lib/class-names'
import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import { range } from '@lib/math/range'
import { makeRandId, nanoid } from '@lib/utils'

import { HistoryPanel } from '@components/pages/history-panel'
import { ColorPickerButton } from '@components/pages/plot/color-picker-button'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { PropRow } from '@components/prop-row'
import { SwitchPropRow } from '@components/switch-prop-row'
import { TabContentPanel } from '@components/tab-content-panel'
import type { ITab } from '@components/tab-provider'
import { ToggleButtons, ToggleButtonTriggers } from '@components/toggle-buttons'
import { ToolbarIconButton } from '@components/toolbar/toolbar-icon-button'
import { downloadDataFrame } from '@lib/dataframe/dataframe-utils'
import { useVennCircleStore } from '@stores/use-venn-circle-store'
import { useVennStore } from '@stores/use-venn-store'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { DATA_PANEL_CLS } from '../matcalc/data-panel'
import MODULE_INFO from './module.json'

interface ISet {
  label?: string
  sets: string[]
  size: number
}

const DEFAULT_SIZE = 100
const DEFAULT_OVERLAP = 20
const LABEL_Y_OFFSET = 20
const EMPTY_SET = new Set<string>()

function VennPage() {
  const queryClient = useQueryClient()

  const [activeSideTab, setActiveSideTab] = useState('Items')
  const downloadRef = useRef<HTMLAnchorElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rightTab, setSelectedRightTab] = useState('Lists')

  const [scale, setScale] = useState(1)

  const [keyPressed, setKeyPressed] = useState<string | null>(null)

  const [displayProps, updateProps, resetProps] = useVennStore()
  const [colorMap, setColorMap, resetColorMap] = useVennCircleStore()

  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  const [listIds] = useState<number[]>(range(0, 4))

  // Stores a mapping between the lowercase labels used for
  // matching and the original values. Note that this picks
  // the last value found as being original, so if you overlap
  // Lab1, and lAb1, lAb1 will be kept as the original value
  const [_originalMap, setOriginalMap] = useState<Map<string, string>>(
    new Map()
  )

  const [countMap, setCountMap] = useState<Map<number, string[]>>(
    new Map(listIds.map(i => [i, []]))
  )

  // track what is unique to each set so we get rid of repeats
  const [uniqueCountMap, setUniqueCountMap] = useState<
    Map<number, Set<string>>
  >(new Map(listIds.map(i => [i, new Set<string>()])))

  const [listLabelMap, setListLabelMap] = useState<Map<number, string>>(
    new Map<number, string>(listIds.map(i => [i, `List ${i + 1}`]))
  )

  const [labelToIndexMap, setLabelToIndexMap] = useState<Map<string, number>>(
    new Map()
  )

  const [vennElemMap, setVennElemMap] = useState<Map<string, Set<string>>>(
    new Map()
  )

  const [listTextMap, setListTextMap] = useState<Map<number, string>>(new Map())

  // https://github.com/benfred/venn.js/

  const [showFileMenu, setShowFileMenu] = useState(false)

  //const [displayProps.isProportional, setProportional] = useState(true)

  const [sets, setSets] = useState<ISet[]>([])

  const svgRef = useRef<SVGSVGElement>(null)
  const overlapRef = useRef<HTMLTextAreaElement>(null)
  const intersectLabelRef = useRef<HTMLHeadingElement>(null)
  const [showSideBar, setShowSideBar] = useState(true)

  const [history, historyDispatch] = useContext(HistoryContext)

  useWindowScrollListener((e: unknown) => console.log(e))

  function onFileChange(message: string, files: FileList | null) {
    if (!files) {
      return
    }

    const file = files[0]
    const name = file.name

    //setFile(files[0])
    //setShowLoadingDialog(true)

    const fileReader = new FileReader()

    fileReader.onload = e => {
      const result = e.target?.result

      if (result) {
        // since this seems to block rendering, delay by a second so that the
        // animation has time to start to indicate something is happening and
        // then finish processing the file
        setTimeout(() => {
          const text: string =
            typeof result === 'string' ? result : Buffer.from(result).toString()

          openFiles([{ name, text, ext: name.split('.').pop() || '' }])

          // historyState.current = {
          //   step: 0,
          //   history: [{ title: `Load ${name}`, df: [table.setName(name)] }],
          // }

          //setShowLoadingDialog(false)
        }, 2000)
      }
    }

    fileReader.readAsText(file)

    //setShowFileMenu(false)
  }

  function openFiles(files: IFileOpen[]) {
    const file = files[0]
    const name = file.name

    const lines = file.text.split(/[\r\n]+/g).filter(line => line.length > 0)

    const sep = name.endsWith('csv') ? ',' : '\t'

    const table = new DataFrameReader()
      .sep(sep)
      .indexCols(0)
      .colNames(1)
      .read(lines)
      .t()

    setListLabelMap(
      new Map(range(0, table.shape[0]).map(ci => [ci, table.index.getName(ci)]))
    )

    setListTextMap(
      new Map(
        table.values.map((r, ri) => [ri, r.map(c => c.toString()).join('\n')])
      )
    )

    //resolve({ ...table, name: file.name })

    // historyDispatch({
    //   type: "reset",
    //   title: `Load ${name}`,
    //   df: table.setName(truncate(name, { length: 16 })),
    // })

    // historyState.current = {
    //   step: 0,
    //   history: [{ title: `Load ${name}`, df: [table.setName(name)] }],
    // }

    //setShowLoadingDialog(false)

    setShowFileMenu(false)
  }

  async function loadTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/venn.json'),
    })

    setListTextMap(
      new Map(
        res.data.map((items: string[], i: number) => [i, items.join('\n')])
      )
    )
  }

  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  useEffect(() => {
    setListLabelMap(
      new Map(range(0, listIds.length).map(i => [i, `List ${i + 1}`]))
    )
  }, [listIds])

  function getItems(text: string | undefined | null): string[] {
    if (!text) {
      return []
    }

    return text
      .split(/\n/)
      .map(x => x.trim())
      .filter(x => x.length > 0)
  }

  useEffect(() => {
    // map text back to its original name
    const originalMap = new Map<string, string>()

    // count number of items
    const countMap = new Map<number, string[]>()

    listIds.forEach(i => {
      const items = getItems(listTextMap.get(i)!)

      countMap.set(
        i,
        items.map(item => item.toLowerCase())
      )

      items.forEach(item => {
        originalMap.set(item.toLowerCase(), item)
      })
    })

    setOriginalMap(originalMap)

    // const countMap = new Map(
    //   listIds.map(i => [i, getItems(listTextMap.get(i)!)]),
    // )

    const uniqueCountMap = new Map(
      Array.from(countMap.entries()).map(([listId, items]) => [
        listId,
        new Set(items),
      ])
    )

    // const displayLabelMap = Object.fromEntries(
    //   listIds.map(i => [
    //     i,
    //     `${listLabelMap[i]} (${uniqueCountMap[i].size.toLocaleString()})`,
    //   ]),
    // )

    // determine which lists are in use
    const usableIds = Array.from(uniqueCountMap.entries())
      .filter(([, items]) => items.size > 0)
      .map(([listId]) => listId)
      .sort()

    // get all the intersections in use by id combinations for
    // example [0] is list 1 and [0, 1] is the intersection of list 1
    // and list 2
    const combinations: number[][] = makeCombinations(usableIds).slice(1)

    // pool all items and annotate by who is in what
    const combs = new Map<string, number[]>()

    usableIds.forEach(listId => {
      ;[...uniqueCountMap.get(listId)!].map(item => {
        if (!combs.has(item)) {
          combs.set(item, [])
        }

        combs.get(item)!.push(listId)
      })
    })

    const newSets: ISet[] = []
    const vennMap = new Map<string, Set<string>>()
    let maxRows = 0

    //
    // counts for venn
    //

    const combs2 = new Map<string, Set<string>>()

    const subCombMap = new Map<string, string[]>()

    Array.from(combs.entries()).forEach(([item, listIds]) => {
      const id = listIds.join(':')

      if (!subCombMap.has(id)) {
        // cache the permutations we encounter
        subCombMap.set(
          id,
          makeCombinations(listIds.map(s => listLabelMap.get(s)))
            .slice(1)
            .map(c => c.join('_'))
        )
      }

      const labels: string[] = subCombMap.get(id)!

      labels.forEach(label => {
        if (!combs2.has(label)) {
          combs2.set(label, new Set())
        }

        combs2.get(label)?.add(item)
      })
    })

    //console.log(combinations)

    combinations.forEach(c => {
      const sets = c.map(s => listLabelMap.get(s)!)
      const label = sets.join('_')

      const items: Set<string> = combs2.get(label) ?? EMPTY_SET

      let size = items.size

      if (size > 0 && !displayProps.isProportional) {
        if (sets.length === 1) {
          // all sets have the same size
          size = DEFAULT_SIZE
        } else {
          size = DEFAULT_OVERLAP
        }
      }

      newSets.push({
        sets,
        //label: sets.length === 1 && displayProps.showLabels ? label : "",
        size,
      })

      vennMap.set(label, items)

      maxRows = Math.max(maxRows, items.size)
    })

    setSets(newSets)
    setVennElemMap(vennMap)

    setCountMap(countMap)
    setUniqueCountMap(uniqueCountMap)

    setLabelToIndexMap(
      new Map<string, number>(
        Array.from(listLabelMap.entries()).map(([k, v]) => [v, k])
      )
    )
  }, [listLabelMap, listTextMap, displayProps])

  useEffect(() => {
    // make a dataframe

    if (vennElemMap.size === 0) {
      return
    }

    const index = Array.from(vennElemMap.keys()).sort()

    const maxRows = index
      .map(n => vennElemMap.get(n)!.size)
      .reduce((a, b) => Math.max(a, b), 0)

    const d = index.map(n =>
      [...vennElemMap.get(n)!]
        .sort()
        .concat(Array(maxRows - vennElemMap.get(n)!.size).fill(''))
    )

    const df = new DataFrame({
      name: 'Venn Sets',
      data: d,
      index: new DataIndex(index.map(n => n.split('_').join(' AND '))),
      columns: NUM_INDEX,
    }).t()

    historyDispatch({
      type: 'reset',
      name: `Venn Sets`,
      sheets: [df],
    })
  }, [vennElemMap])

  useEffect(() => {
    const chart = VennDiagram()
      .width(displayProps.w)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .height(displayProps.w)
      .duration(0)
      .normalize(displayProps.normalize)
    //displayProps.isProportional)

    const div = d3.select('#venn')

    // stop the animation and force refresh
    // so that intersection labels remain
    // in the correct place after resize
    div.select('svg').selectAll('*').remove()

    div.datum(sets).call(chart)

    //const svg = div.select("svg")

    div.select('svg').attr('class', 'absolute')

    const tooltip = d3.select('#tooltip') //.attr("class", "venntooltip")

    div
      .selectAll('path')
      .style('stroke-opacity', 0)
      .style('stroke', '#ffffff')
      .style('stroke-width', 3)
      .style('cursor', 'pointer')

    // force node color
    Array.from(listLabelMap.entries()).forEach(([k, v]) => {
      const d = div.selectAll(`g[data-venn-sets='${v}']`)

      d.selectAll('path')
        .style('fill', colorMap[k]!.fill)
        .style('fill-opacity', displayProps.isFilled ? 1 : 0)

      if (displayProps.isOutlined) {
        d.selectAll('path')
          .style('stroke', colorMap[k]!.stroke)
          .style('stroke-opacity', 1)
      }

      d.selectAll('text').style('fill', colorMap[k]!.color)
    })

    // find the pieces who are labelled and where the
    // label contains "_" as these are the ones that
    // are intersections and whose labels are missing
    // from the venn diagram

    //div.select("svg").select("#size-group").remove()
    //div.select("svg").append("g").attr("id", "size-group")

    if (!displayProps.isProportional) {
      Array.from(vennElemMap.entries())
        //.filter(([k, v]) => k.includes("_"))
        .forEach(([k, v]) => {
          const d = div.selectAll(`g[data-venn-sets='${k}']`)

          if (d) {
            const path = d.select(k.includes('_') ? 'path' : 'tspan')

            // set the opacity of the auto labels
            if (!k.includes('_')) {
              path.attr('opacity', displayProps.showLabels ? 1 : 0)
            }

            if (path) {
              const node = path.node()

              if (node) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                const box = node.getBBox()

                const idx = labelToIndexMap.get(k) ?? -1

                div
                  .select('svg')
                  .append('text')
                  .attr('x', box.x + 0.5 * box.width)
                  .attr(
                    'y',
                    box.y +
                      0.5 * box.height +
                      (k.includes('_') ? 0 : LABEL_Y_OFFSET)
                  )
                  .style(
                    'fill',
                    idx !== -1
                      ? colorMap[idx]!.color
                      : displayProps.intersectionColor
                  )
                  .attr('text-anchor', 'middle')
                  .attr('dominant-baseline', 'middle')
                  .attr('opacity', displayProps.showCounts ? 1 : 0)
                  .text(v.size.toLocaleString())
              }
            }
          }
        })
    }

    // add listeners to all the groups to display tooltip on mouseover
    div
      .selectAll('g')
      .on('mouseover', function (e, d) {
        sortAreas(div, d)

        const selection = d3.select(this)

        const vennId = selection.attr('data-venn-sets')

        // highlight the current path

        const overlapSet = vennElemMap.get(vennId) ?? EMPTY_SET

        // Display a tooltip with the current size
        tooltip.transition().duration(300).style('opacity', 0.9)
        tooltip.text(`${overlapSet.size} item${overlapSet.size > 1 ? 's' : ''}`)

        if (!displayProps.isOutlined) {
          // sort all the areas relative to the current item

          selection
            .transition('tooltip')
            .duration(300)
            .select('path')
            //.style("stroke-width", 3)
            //.style("fill-opacity", d.sets.length == 1 ? 0.4 : 0.1)
            .style('stroke-opacity', 1)
          //.style("stroke", "#fff")
        }
      })

      .on('mousedown', function (e, d) {
        // sort all the areas relative to the current item
        sortAreas(div, d)

        // highlight the current path
        const selection = d3.select(this)
        const vennId = selection.attr('data-venn-sets')

        const overlapSet = vennElemMap.get(vennId) ?? EMPTY_SET

        // label the header and remove counts from list ids

        const ids = vennId.split('_')

        const label = `There ${
          overlapSet.size !== 1 ? 'are' : 'is'
        } ${overlapSet.size.toLocaleString()} item${
          overlapSet.size !== 1 ? 's' : ''
        } in ${ids.length > 1 ? 'the intersection of' : ''} ${ids
          .map(x => x.replace(/ \(.+/, ''))
          .join(' AND ')}`

        if (overlapRef.current) {
          // format the intersection of results into a string.
          // We use originalMap to convert the lowercase items
          // back to their original state, though we only keep
          // one such state for each id. Thus if you mix cases
          // for a label, e.g. Lab1, lAb1, LaB1, only one of the
          // original labels will be used since the intersection
          // doesn't know which label to pick from.
          overlapRef.current.value = [
            `#${label}`,
            ...[...overlapSet].sort().map(s => _originalMap.get(s)),
          ].join('\n')
        }

        if (intersectLabelRef.current) {
          // label the header and remove counts from list ids

          intersectLabelRef.current.innerText = label
        }
      })

      .on('mousemove', function (event) {
        const [x, y] = d3.pointer(event)

        tooltip.style('left', x + 20 + 'px').style('top', y + 20 + 'px')
      })

      .on('mouseout', function () {
        const selection = d3.select(this)

        // determine if id represents one of the 4 circles

        tooltip.transition().duration(300).style('opacity', 0)

        if (!displayProps.isOutlined) {
          selection
            .transition('tooltip')
            .duration(300)
            .select('path')
            .style('stroke-opacity', 0)
        }
        //.style("stroke-width", 0)
        //.style("fill-opacity", d.sets.length == 1 ? 0.25 : 0.0)
        //.style("stroke-opacity", 0)
      })

    if (intersectLabelRef.current) {
      // label the header and remove counts from list ids

      intersectLabelRef.current.innerText = 'Items List'
    }

    if (overlapRef.current) {
      // label the header and remove counts from list ids

      overlapRef.current.value = ''
    }

    // if (sets.length > 0) {
    //   const g = div.select(
    //     `g[data-venn-sets='${listIds
    //       .map(i => listLabelWithNums[i])
    //       .join("_")}']`,
    //   )

    //   g.append("text").text(sets[sets.length - 1].size.toString())

    //   div
    //     .select("svg")
    //     .append("text")
    //     .text(sets[sets.length - 1].size.toString())

    //   console.log("g", g.node().getBBox())
    // }
  }, [sets, colorMap])

  function adjustScale(scale: number) {
    setScale(scale)
    updateProps({ ...displayProps, scale })
  }

  function save(format: 'txt' | 'csv') {
    const df = history.currentStep.currentSheet

    if (!df) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(df, downloadRef, {
      hasHeader: true,
      hasIndex: false,
      file: `table.${format}`,
      sep,
    })

    setShowFileMenu(false)
  }

  const tabs: ITab[] = [
    {
      id: nanoid(),
      name: 'Home',
      content: (
        <>
          <ToolbarTabGroup>
            <ToolbarOpenFile
              onOpenChange={open => {
                if (open) {
                  setShowDialog({
                    name: makeRandId('open'),
                  })
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              title="Save image"
              onClick={() => {
                setShowDialog({ name: 'export', params: {} })
              }}
            >
              <SaveIcon className="rotate-180" />
            </ToolbarIconButton>

            {/* <ToolbarSaveSvg
              svgRef={svgRef}
              canvasRef={canvasRef}
              downloadRef={downloadRef}
            /> */}
          </ToolbarTabGroup>
        </>
      ),
    },
  ]

  const vennRightTabs: ITab[] = [
    {
      //id: nanoid(),
      name: 'Lists',
      icon: <LayersIcon />,

      content: (
        <PropsPanel>
          <ScrollAccordion value={listIds.map(id => `List ${id + 1}`)}>
            {listIds.map((index: number) => {
              const name = `List ${index + 1}`
              return (
                <AccordionItem value={name} key={index}>
                  <AccordionTrigger>{name}</AccordionTrigger>
                  <AccordionContent>
                    <BaseCol className="gap-y-1">
                      <VCenterRow className="gap-x-2">
                        <Input
                          id={`label${index + 1}`}
                          value={listLabelMap.get(index) ?? ''}
                          onChange={e => {
                            //console.log(index, e.target.value)
                            setListLabelMap(
                              new Map(listLabelMap).set(index, e.target.value)
                            )
                          }}
                          className="w-0 grow rounded-md"
                          placeholder={`List ${index + 1} name...`}
                        />
                        <VCenterRow className={cn('shrink-0 gap-x-0.5')}>
                          <ColorPickerButton
                            color={colorMap[index]!.fill}
                            onColorChange={color =>
                              setColorMap(
                                Object.fromEntries([
                                  ...[...Object.entries(colorMap)],
                                  [
                                    index,
                                    {
                                      ...colorMap[index]!,
                                      fill: color,
                                    },
                                  ],
                                ])
                              )
                            }
                            title="Fill color"
                            className={cn('rounded-sm', XS_ICON_BUTTON_CLS)}
                          />
                          <ColorPickerButton
                            color={colorMap[index]!.stroke}
                            onColorChange={color =>
                              setColorMap(
                                Object.fromEntries([
                                  ...[...Object.entries(colorMap)],
                                  [
                                    index,
                                    {
                                      ...colorMap[index]!,
                                      stroke: color,
                                    },
                                  ],
                                ])
                              )
                            }
                            title="Line color"
                            className={cn('rounded-sm', XS_ICON_BUTTON_CLS)}
                          />

                          <ColorPickerButton
                            color={colorMap[index]!.color}
                            onColorChange={color =>
                              setColorMap(
                                Object.fromEntries([
                                  ...[...Object.entries(colorMap)],
                                  [
                                    index,
                                    {
                                      ...colorMap[index]!,
                                      color,
                                    },
                                  ],
                                ])
                              )
                            }
                            title="Text color"
                            className={cn('rounded-sm', XS_ICON_BUTTON_CLS)}
                          />
                        </VCenterRow>
                      </VCenterRow>

                      <Textarea3
                        id={`set${index + 1}`}
                        aria-label={`Set ${index + 1}`}
                        placeholder={listLabelMap.get(index) ?? ''}
                        value={listTextMap.get(index) ?? ''}
                        onChange={e =>
                          setListTextMap(
                            new Map(listTextMap).set(index, e.target.value)
                          )
                        }
                        className="h-28"
                      />
                      <VCenterRow className="justify-between pr-1">
                        <span title="Total items / Unique items">
                          {`${countMap.get(index)!.length} / ${
                            uniqueCountMap.get(index)!.size
                          }`}
                        </span>

                        <Button
                          variant="link"
                          size="sm"
                          pad="none"
                          ripple={false}
                          onClick={() =>
                            setListTextMap(new Map(listTextMap).set(index, ''))
                          }
                        >
                          {TEXT_CLEAR}
                        </Button>
                      </VCenterRow>
                    </BaseCol>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </ScrollAccordion>
        </PropsPanel>
      ),
    },
    {
      //id: nanoid(),
      name: 'Settings',
      icon: <SlidersIcon />,
      content: (
        <PropsPanel>
          <ScrollAccordion value={['plot', 'circles', 'text']}>
            <AccordionItem value="plot">
              <AccordionTrigger>Plot</AccordionTrigger>
              <AccordionContent>
                <PropRow title="Plot width">
                  <NumericalInput
                    id="w"
                    max={1000}
                    value={displayProps.w}
                    placeholder="Cell width..."
                    onNumChanged={w => {
                      updateProps({
                        ...displayProps,
                        w,
                      })
                    }}
                  />
                </PropRow>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="circles">
              <AccordionTrigger>Circles</AccordionTrigger>
              <AccordionContent>
                <SwitchPropRow
                  title="Fill"
                  checked={displayProps.isFilled}
                  onCheckedChange={state => {
                    let props = {
                      ...displayProps,
                      isFilled: state,
                      isOutlined: state ? displayProps.isOutlined : true,
                    }

                    // setDisplayProps({
                    //   ...displayProps,
                    //   intersection: {
                    //     ...displayProps.intersection,
                    //     color: state ? "#fff" : "#000",
                    //   },
                    //   fill: state,
                    //   outline: state ? displayProps.isOutlined : true,
                    // })

                    if (displayProps.autoColorText) {
                      props = {
                        ...props,
                        intersectionColor: state ? '#ffffff' : '#000000',
                      }

                      setColorMap(
                        Object.fromEntries(
                          Object.keys(colorMap).map(key => [
                            key,
                            {
                              ...colorMap[key]!,
                              color: state ? '#ffffff' : colorMap[key]!.stroke,
                            },
                          ])
                        )
                      )
                    }

                    updateProps(props)
                  }}
                />

                <SwitchPropRow
                  title="Outline"
                  checked={displayProps.isOutlined}
                  onCheckedChange={state =>
                    updateProps({
                      ...displayProps,
                      isOutlined: state,
                      isFilled: state ? displayProps.isFilled : true,
                    })
                  }
                />
                <SwitchPropRow
                  title="Proportional"
                  checked={displayProps.isProportional}
                  onCheckedChange={state =>
                    updateProps({
                      ...displayProps,
                      isProportional: state,
                    })
                  }
                />
                <SwitchPropRow
                  title="Normalize"
                  checked={displayProps.normalize}
                  onCheckedChange={state =>
                    updateProps({
                      ...displayProps,
                      normalize: state,
                    })
                  }
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="text">
              <AccordionTrigger>Text</AccordionTrigger>
              <AccordionContent>
                <SwitchPropRow
                  title="Labels"
                  checked={displayProps.showLabels}
                  onCheckedChange={state =>
                    updateProps({
                      ...displayProps,
                      showLabels: state,
                    })
                  }
                />
                <SwitchPropRow
                  title="Counts"
                  checked={displayProps.showCounts}
                  onCheckedChange={state =>
                    updateProps({
                      ...displayProps,
                      showCounts: state,
                    })
                  }
                />
                <SwitchPropRow
                  title="Auto-color"
                  checked={displayProps.autoColorText}
                  onCheckedChange={state =>
                    updateProps({
                      ...displayProps,
                      autoColorText: state,
                    })
                  }
                />
                <PropRow title="Intersection">
                  <ColorPickerButton
                    color={displayProps.intersectionColor}
                    onColorChange={color =>
                      updateProps({
                        ...displayProps,
                        intersectionColor: color,
                      })
                    }
                    className={cn(PILL_BUTTON_CLS, SM_ICON_BUTTON_CLS)}
                  />
                </PropRow>

                <BaseCol className="justify-start gap-y-1 pt-4">
                  <Button
                    multiProps="link"
                    ripple={false}
                    onClick={() => resetProps()}
                  >
                    Default settings
                  </Button>

                  <Button
                    multiProps="link"
                    ripple={false}
                    onClick={() => resetColorMap()}
                  >
                    Default list colors
                  </Button>
                </BaseCol>
              </AccordionContent>
            </AccordionItem>
          </ScrollAccordion>
        </PropsPanel>
      ),
    },
  ]

  const rightTabs: ITab[] = [
    {
      //id: nanoid(),
      icon: <ClockRotateLeftIcon />,
      name: 'History',
      content: <HistoryPanel />,
    },
  ]

  function onWheel(e: { deltaY: number }) {
    if (keyPressed === 'Shift') {
      setScale(
        Math.max(
          ZOOM_SCALES[0],
          Math.min(
            ZOOM_SCALES[ZOOM_SCALES.length - 1],
            scale + (e.deltaY >= 0 ? 0.25 : -0.25)
          )
        )
      )
    }
  }

  const sidebarTabs: ITab[] = [
    {
      //id: nanoid(),
      name: 'Items',
      icon: <ChartIcon className={TOOLBAR_BUTTON_ICON_CLS} />,

      content: (
        <Textarea
          ref={overlapRef}
          id="text-overlap"
          aria-label="Overlaps"
          className="h-full text-sm my-2 grow"
          placeholder="A list of the items in each Venn subset will appear here when you click on the diagram..."
          readOnly
        />
      ),
    },
    {
      //id: nanoid(),
      name: 'Data',
      icon: <TableIcon className={TOOLBAR_BUTTON_ICON_CLS} />,

      content: (
        <BaseCol className="grow mt-2">
          <ToolbarTabGroup>
            <ToolbarButton
              aria-label="Download pathway table"
              tooltip="Download pathway table"
              onClick={() => save('txt')}
            >
              <SaveIcon className="-scale-100" />
            </ToolbarButton>
          </ToolbarTabGroup>

          <TabbedDataFrames
            key="tabbed-data-frames"
            selectedSheet={history.currentStep.currentSheetIndex}
            dataFrames={history.currentStep.sheets}
            onTabChange={selectedTab => {
              historyDispatch({
                type: 'goto_sheet',
                sheetId: selectedTab.index,
              })
            }}
          />
        </BaseCol>
      ),
    },
  ]

  // const fileMenuTabs: ITab[] = [
  //   {
  //     id: nanoid(),
  //     name: "Open",
  //     icon: <OpenIcon fill="" w="w-5" />,
  //     content: (
  //       <BaseCol className="gap-y-6 p-6">
  //         <h1 className="text-2xl">Open</h1>

  //         <ul className="flex flex-col gap-y-2 text-xs">
  //           <li>
  //             <MenuButton
  //               aria-label="Open file on your computer"
  //               onClick={() =>
  //                 setShowDialog({ name: makeRandId("open"), params: {} })
  //               }
  //             >
  //               <OpenIcon className="w-6 " />
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Open local file
  //                 </span>
  //                 <br />
  //                 <span>Open a local file on your computer.</span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //         </ul>
  //       </BaseCol>
  //     ),
  //   },
  //   {
  //     id: nanoid(),
  //     name: "Save as",
  //     content: (
  //       <BaseCol className="gap-y-6 p-6">
  //         <h1 className="text-2xl">Save as</h1>

  //         <ul className="flex flex-col gap-y-1 text-xs">
  //           <li>
  //             <MenuButton
  //               aria-label="Save text file"
  //               onClick={() => save("txt")}
  //             >
  //               <FileLinesIcon className="w-6" />
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as TXT
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save table as a tab-delimited text file.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //           <li>
  //             <MenuButton
  //               aria-label="Save CSV file"
  //               onClick={() => save("csv")}
  //             >
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as CSV
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save table as a comma separated text file.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //         </ul>
  //       </BaseCol>
  //     ),
  //   },
  //   {
  //     id: nanoid(),
  //     name: "Export",
  //     content: (
  //       <BaseCol className="gap-y-6 p-6">
  //         <h1 className="text-2xl">Export</h1>

  //         <ul className="flex flex-col gap-y-1 text-xs">
  //           <li>
  //             <MenuButton
  //               aria-label="Download as PNG"
  //               onClick={() => {
  //                 downloadSvgAsPng(svgRef, canvasRef, downloadRef)
  //                 setShowFileMenu(false)
  //               }}
  //             >
  //               <FileImageIcon fill="" />
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as PNG
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save diagram as PNG.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //           <li>
  //             <MenuButton
  //               aria-label="Download as SVG"
  //               onClick={() => {
  //                 downloadSvg(svgRef, downloadRef)
  //                 setShowFileMenu(false)
  //               }}
  //             >
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as SVG
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save diagram as SVG.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //         </ul>
  //       </BaseCol>
  //     ),
  //   },
  // ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      name: 'Open',
      icon: <OpenIcon fill="" />,
      content: (
        <DropdownMenuItem
          aria-label="Open file on your computer"
          onClick={() =>
            setShowDialog({ name: makeRandId('open'), params: {} })
          }
        >
          <UploadIcon fill="" />

          <span>Open files from this device</span>
        </DropdownMenuItem>
      ),
    },
    { id: nanoid(), name: '<divider>' },
    {
      //id: nanoid(),
      name: TEXT_SAVE_AS,
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as TXT"
            onClick={() => {
              save('txt')
            }}
          >
            <FileLinesIcon fill="" />
            <span>Download as TXT</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Download as CSV"
            onClick={() => {
              save('csv')
            }}
          >
            <span>Download as CSV</span>
          </DropdownMenuItem>
        </>
      ),
    },
    {
      //id: nanoid(),
      name: 'Export',
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as PNG"
            onClick={() => {
              downloadSvgAsPng(svgRef, canvasRef, downloadRef, 'venn')
              //                 setShowFileMenu(false)
            }}
          >
            <FileImageIcon fill="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as SVG"
            onClick={() => {
              downloadSvg(svgRef, downloadRef, 'venn')
              //                 setShowFileMenu(false)
            }}
          >
            <span>Download as SVG</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      {showDialog.name.includes('export') && (
        <SaveImageDialog
          open={'open'}
          onSave={format => {
            downloadImageAutoFormat(
              svgRef,
              canvasRef,
              downloadRef,
              `venn.${format.ext}`
            )
            setShowDialog(NO_DIALOG)
          }}
          onCancel={() => setShowDialog(NO_DIALOG)}
        />
      )}

      <ShortcutLayout info={MODULE_INFO} signInEnabled={false}>
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            rightShortcuts={
              <ToolbarTabButton
                onClick={() => loadTestData()}
                role="button"
                title="Load test data to use features."
              >
                Test data
              </ToolbarTabButton>
            }
          />
          <ToolbarPanel
            tabShortcutMenu={
              <ShowOptionsMenu
                onClick={() => {
                  setShowSideBar(!showSideBar)
                }}
              />
            }
          />
        </Toolbar>

        {/* <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="venn-resizable-panels-h"
      >
        <ResizablePanel
          defaultSize={75}
          minSize={50}
          className="flex flex-col"
          id="main"
        >
          <div className="grow">
            <ResizablePanelGroup
              direction="vertical"
              className="grow"
              autoSaveId="venn-resizable-panels-v"
            >
              <ResizablePanel
                defaultSize={75}
                minSize={10}
                className="flex flex-col p-0.5"
                id="venn"
              >
                <div
                  className={cn(
                    FOCUS_RING_CLS,
                    INPUT_BORDER_CLS,
                    "custom-scrollbar relative grow overflow-scroll rounded-md bg-background",
                  )}
                  id="venn"
                  onWheel={onWheel}
                  tabIndex={0}
                  onKeyDown={e => setKeyPressed(e.key)}
                  onKeyUp={() => setKeyPressed(null)}
                >
                  <svg
                    fontFamily="Arial, Helvetica, sans-serif"
                    className="absolute"
                    ref={svgRef}
                    viewBox={`0 0 ${displayProps.w} ${displayProps.w}`}
                    width={displayProps.w * ZOOM_SCALES[scaleIndex]}
                    height={displayProps.w * ZOOM_SCALES[scaleIndex]}
                  />
                  <div
                    id="tooltip"
                    className="venntooltip absolute z-modal rounded-md bg-black/80 px-4 py-2 text-white opacity-0"
                  />
                </div>
              </ResizablePanel>
              <ThinVResizeHandle />
              <ResizablePanel
                id="list"
                defaultSize={25}
                minSize={10}
                collapsible={true}
                className="flex flex-col p-0.5"
              >
                <TopTabs
                  tabs={sidebarTabs}
                  value={activeSideTab}
                  onValueChange={setActiveSideTab}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </ResizablePanel>
        <ThinHResizeHandle />
        <ResizablePanel
          id="right"
          className="flex min-h-0 flex-col"
          defaultSize={25}
          minSize={15}
          collapsible={true}
        >
          <SideBarTextTabs
            value={rightTab}
            tabs={vennRightTabs}
            onValueChange={setSelectedRightTab}
          />
        </ResizablePanel>
      </ResizablePanelGroup> */}

        <TabSlideBar
          side="right"
          tabs={vennRightTabs}
          onTabChange={selectedTab => setSelectedRightTab(selectedTab.tab.name)}
          value={rightTab}
          open={showSideBar}
          onOpenChange={setShowSideBar}
          className="pr-1"
        >
          <ResizablePanelGroup
            direction="vertical"
            className="grow pl-1"
            autoSaveId="venn-resizable-panels-v"
          >
            <ResizablePanel
              defaultSize={75}
              minSize={10}
              className={cn(DATA_PANEL_CLS, 'flex flex-col p-2')}
              id="venn"
            >
              <div
                className={cn(
                  FOCUS_RING_CLS,
                  'custom-scrollbar relative grow overflow-scroll rounded-md bg-background'
                )}
                id="venn"
                onWheel={onWheel}
                tabIndex={0}
                onKeyDown={e => setKeyPressed(e.key)}
                onKeyUp={() => setKeyPressed(null)}
              >
                <svg
                  fontFamily="Arial, Helvetica, sans-serif"
                  className="absolute"
                  ref={svgRef}
                  viewBox={`0 0 ${displayProps.w} ${displayProps.w}`}
                  width={displayProps.w * scale}
                  height={displayProps.w * scale}
                />
                <div
                  id="tooltip"
                  className="venntooltip absolute z-modal rounded-md bg-black/80 px-4 py-2 text-white opacity-0"
                />
              </div>
            </ResizablePanel>
            <ThinVResizeHandle />
            <ResizablePanel
              id="list"
              defaultSize={25}
              minSize={10}
              collapsible={true}
              className={cn(DATA_PANEL_CLS, 'flex flex-col px-2 pt-2')}
            >
              {/* <TopTabs
                tabs={sidebarTabs}
                value={activeSideTab}
                onValueChange={setActiveSideTab}
              /> */}

              <ToggleButtons
                tabs={sidebarTabs}
                value={activeSideTab}
                onTabChange={selectedTab =>
                  setActiveSideTab(selectedTab.tab.name)
                }
                className="grow"
              >
                <VCenterRow>
                  <ToggleButtonTriggers className="text-xs" />
                </VCenterRow>
                <TabContentPanel />
              </ToggleButtons>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabSlideBar>

        <ToolbarFooter>
          <></>
          <></>
          <>
            {activeSideTab === 'Chart' && (
              <ZoomSlider scale={scale} onZoomChange={adjustScale} />
            )}
          </>
        </ToolbarFooter>

        <OpenFiles
          open={showDialog.name.includes('open') ? showDialog.name : ''}
          //onOpenChange={() => setShowDialog(NO_DIALOG)}
          onFileChange={onFileChange}
        />

        <a ref={downloadRef} className="hidden" href="#" />

        <canvas ref={canvasRef} width={0} height={0} className="hidden" />
      </ShortcutLayout>
    </>
  )
}

export function VennPageQuery() {
  const [history, historyDispatch] = useHistory()

  return (
    <HistoryProvider>
      <VennPage />
    </HistoryProvider>
  )
}
