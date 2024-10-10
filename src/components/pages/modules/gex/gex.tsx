'use client'

import { ToolbarFooter } from '@components/toolbar/toolbar-footer'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@components/toolbar/toolbar'

import { HistoryContext, HistoryProvider } from '@components/history-provider'
import {
  NO_DIALOG,
  TEXT_EXPORT,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@consts'
import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { getDataFrameInfo } from '@lib/dataframe/dataframe-utils'

import { useContext, useEffect, useMemo, useRef, useState } from 'react'

import {
  AlertsContext,
  AlertsProvider,
  makeErrorAlert,
  makeWarningAlert,
} from '@components/alerts/alerts-provider'
import {
  API_GEX_DATASETS_URL,
  API_GEX_EXP_URL,
  API_GEX_PLATFORMS_URL,
  bearerHeaders,
  JSON_HEADERS,
} from '@modules/edb'
import axios from 'axios'

import { BaseCol } from '@components/base-col'
import { makeFoldersRootNode } from '@components/collapse-tree'
import { FileImageIcon } from '@components/icons/file-image-icon'
import { FileLinesIcon } from '@components/icons/file-lines-icon'
import { SaveIcon } from '@components/icons/save-icon'

import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import {
  ResizablePanel,
  ResizablePanelGroup,
} from '@components/shadcn/ui/themed/resizable'
import { SlideBar, SlideBarContentFramer } from '@components/slide-bar'
import { ThinVResizeHandle } from '@components/split-pane/thin-v-resize-handle'
import { TabSlideBar } from '@components/tab-slide-bar'
import { TabbedDataFrames } from '@components/table/tabbed-dataframes'
import { ToolbarButton } from '@components/toolbar/toolbar-button'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { downloadDataFrame } from '@lib/dataframe/dataframe-utils'
import { downloadImageAutoFormat } from '@lib/image-utils'
import { makeRandId } from '@lib/utils'

import { DatabaseIcon } from '@components/icons/database-icon'
import { HistoryPanel } from '@components/pages/history-panel'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { SaveTxtDialog } from '@components/pages/save-txt-dialog'
import { DEFAULT_PALETTE } from '@components/plot/palette'

import { mannWhitneyU } from '@lib/math/mann-whitney'
import { range } from '@lib/math/range'

import { SlidersIcon } from '@components/icons/sliders-icon'
import { DataFrame } from '@lib/dataframe/dataframe'
import { GexBoxWhiskerPlotSvg } from './gex-box-whisker-plot-svg'
import { useGexPlotStore } from './gex-plot-store'
import { GexPropsPanel } from './gex-props-panel'
import { useGexStore } from './gex-store'
import {
  DEFAULT_GEX_PLOT_DISPLAY_PROPS,
  IGexSearchResults,
  type IGexDataset,
  type IGexPlatform,
  type IGexStats,
  type IGexValueType,
} from './gex-utils'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/shadcn/ui/themed/select'
import { type ITab } from '@components/tab-provider'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'
import { ZoomSlider } from '@components/toolbar/zoom-slider'

import { ShowSideButton } from '@components/pages/show-side-button'
import { HeatMapSvg } from '@components/plot/heatmap-svg'
import { ToggleButtons, ToggleButtonTriggers } from '@components/toggle-buttons'
import { cn } from '@lib/class-names'
import { IClusterGroup } from '@lib/cluster-group'
import { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { ClusterFrame, getClusterOrderedDataFrame } from '@lib/math/hcluster'
import { useEdbAuth } from '@providers/edb-auth-provider'
import { useQueryClient } from '@tanstack/react-query'
import { nanoid } from 'nanoid'
import { DATA_PANEL_CLS } from '../matcalc/data-panel'
import { HeatMapDialog } from '../matcalc/heatmap-dialog'
import { MatcalcSettingsProvider } from '../matcalc/matcalc-settings-provider'
import MODULE_INFO from './module.json'
import { SearchPropsPanel } from './search-props-panel'

// export const MODULE_INFO: IModuleInfo = {
//   name: "Gene Expression",
//   description: "Gene Expression",
//   version: "1.0.0",
//   copyright: "Copyright (C) 2024 Antony Holmes",
// }

type OutputMode = 'Data' | 'Violin' | 'Heatmap'

export function GexPage() {
  const queryClient = useQueryClient()

  const [rightTab, setRightTab] = useState('Search')

  const [outputMode, setOutputMode] = useState<OutputMode>('Data')

  const outputTabs = [{ name: 'Data' }, { name: 'Violin' }, { name: 'Heatmap' }]

  const [platform, setPlatform] = useState<IGexPlatform | null>(null)
  const [platforms, setPlatforms] = useState<IGexPlatform[]>([])

  //const [gexValueTypes, setGexValueTypes] = useState<IGexValueType[]>([])

  //const {settings, applySettings}=useGexSettingsStore()
  const [gexValueType, setGexValueType] = useState<IGexValueType | undefined>(
    undefined
  )

  const [genes, setGenes] = useState<string[]>([])
  //const [colorMapName, setColorMap] = useState("Lymphgen")

  const [searchResults, setSearch] = useState<IGexSearchResults | null>(null)

  const [dataframes, setDataframes] = useState<BaseDataFrame[]>([])
  const [clusterFrame, setClusterFrame] = useState<ClusterFrame | null>(null)

  const [foldersIsOpen, setFoldersIsOpen] = useState(true)

  const [groups, setGroups] = useState<IClusterGroup[]>([])
  const [datasets, setDatasets] = useState<IGexDataset[]>([])
  const [datasetMap, setDatasetMap] = useState<Map<number, IGexDataset>>(
    new Map<number, IGexDataset>()
  )

  const [datasetUseMap, setDatasetUseMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  const [foldersTab, setFoldersTab] = useState<ITab>({
    ...makeFoldersRootNode('Datasets'),
  })

  //const [addChrPrefix, setAddChrPrefix] = useState(true)

  const [showSideBar, setShowSideBar] = useState(true)

  const canvasRef = useRef(null)
  const downloadRef = useRef<HTMLAnchorElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // const [datasetMap, setDatasetMap] = useState<Map<string, IMutationDataset[]>>(
  //   new Map<string, IMutationDataset[]>(),
  // )

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  const [, alertDispatch] = useContext(AlertsContext)

  const [stats, setStats] = useState<IGexStats[][]>([])

  const [history, historyDispatch] = useContext(HistoryContext)

  const platformTabs = useMemo(
    () => platforms.map(platform => ({ name: platform.name })),
    [platforms]
  )

  const [displayProps, setDisplayProps] = useGexStore()
  const { gexPlotSettings, updateGexPlotSettings } = useGexPlotStore()

  const { refreshAccessToken } = useEdbAuth()

  async function loadPlatforms() {
    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['platforms'],
        queryFn: () => {
          return axios.get(API_GEX_PLATFORMS_URL, {
            headers: JSON_HEADERS,
          })
        },
      })

      const platforms: IGexPlatform[] = res.data.data

      setPlatforms(platforms)
    } catch (e) {
      console.error('error loading platforms')
    }
  }

  // const dbQuery = useQuery({
  //   queryKey: ["platforms"],
  //   queryFn: async () => {
  //     //const token = await loadAccessToken()

  //     console.log(API_GEX_PLATFORMS_URL)

  //     const res = await axios.get(API_GEX_PLATFORMS_URL, {})

  //     console.log(res.data.data)

  //     return res.data.data
  //   },
  // })

  useEffect(() => {
    loadPlatforms()
  }, [])

  useEffect(() => {
    if (!platform) {
      const defaultPlatforms = platforms.filter(t => t.name.includes('RNA'))

      if (defaultPlatforms.length > 0) {
        setPlatform(defaultPlatforms[0])
      }
    }
  }, [platforms])

  useEffect(() => {
    if (!platform) {
      return
    }

    const defaultValueTypes = platform.gexValueTypes.filter(t =>
      t.name.includes('TPM')
    )

    if (defaultValueTypes.length > 0) {
      setGexValueType(defaultValueTypes[0])
    } else {
      // In the case of microarray, use the first and only gex type RMA
      setGexValueType(platform.gexValueTypes[0])
    }
  }, [platform])

  async function loadDatasets() {
    let datasets: IGexDataset[] = []

    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['datasets'],
        queryFn: () => {
          return axios.post(
            API_GEX_DATASETS_URL,
            { platform },
            {
              headers: JSON_HEADERS,
            }
          )
        },
      })

      datasets = res.data.data
    } catch (err) {
      console.error('error loading datasets from remote')
    }

    setDatasets(datasets)

    setDatasetMap(
      new Map<number, IGexDataset>(
        datasets.map(dataset => [dataset.id, dataset])
      )
    )

    setDatasetUseMap(
      new Map<string, boolean>([
        ...datasets.map(
          dataset => [dataset.id.toString(), true] as [string, boolean]
        ),
        ...datasets.map(
          dataset => [dataset.institution, true] as [string, boolean]
        ),
        ['all', true],
      ])
    )
  }

  useEffect(() => {
    if (!platform) {
      return
    }

    loadDatasets()

    //loadValueTypes()
  }, [platform])

  useEffect(() => {
    if (!gexValueType) {
      return
    }
  }, [gexValueType])

  useEffect(() => {
    const instituteMap = new Map<string, ITab[]>()

    datasets.forEach(dataset => {
      const tab = {
        id: dataset.id.toString(),
        name: dataset.name,
        icon: <DatabaseIcon fill="fill-foreground/25" />,
        isOpen: true,
        //data: dataset.samples,
        checked: datasetUseMap.get(dataset.id.toString()),
        // onCheckedChange: (state: boolean) => {
        //   onCheckedChange(dataset, state)
        // },
      } as ITab

      if (!instituteMap.has(dataset.institution)) {
        instituteMap.set(dataset.institution, [])
      }

      instituteMap.get(dataset.institution)?.push(tab)
    })

    const institutions = [...instituteMap.keys()].sort()

    const children: ITab[] = institutions.map(institution => {
      return {
        id: `institution:${institution}`,
        name: institution,
        //icon: <FolderIcon />,
        isOpen: true,
        checked: datasetUseMap.get(institution),
        children: instituteMap.get(institution),
      } as ITab
    })

    const tab: ITab = {
      ...{
        ...makeFoldersRootNode('Datasets'),
        checked: datasetUseMap.get('all'),
      },
      children,
    }

    setFoldersTab(tab)
  }, [datasets, datasetUseMap])

  useEffect(() => {
    if (datasets.length === 0) {
      return
    }

    const np = Object.keys(gexPlotSettings).length

    // for each dataset, set some sane defaults for colors etc
    datasets.forEach((dataset, di) => {
      const id = dataset.id.toString()

      //console.log("sdfsdf", np, id, id in gexPlotSettings)

      if (!(id in gexPlotSettings)) {
        // create new entry for dataset

        // cycle through colors if we run out
        const idx = (np + di) % DEFAULT_PALETTE.length

        const props = {
          ...DEFAULT_GEX_PLOT_DISPLAY_PROPS,
          box: {
            ...DEFAULT_GEX_PLOT_DISPLAY_PROPS.box,
            stroke: {
              ...DEFAULT_GEX_PLOT_DISPLAY_PROPS.box.stroke,
              color: DEFAULT_PALETTE[idx],
            },

            median: {
              ...DEFAULT_GEX_PLOT_DISPLAY_PROPS.box.median,
              stroke: DEFAULT_PALETTE[idx],
            },
          },
          violin: {
            ...DEFAULT_GEX_PLOT_DISPLAY_PROPS.violin,

            fill: {
              ...DEFAULT_GEX_PLOT_DISPLAY_PROPS.violin.fill,
              color: DEFAULT_PALETTE[idx],
            },
          },
          swarm: {
            ...DEFAULT_GEX_PLOT_DISPLAY_PROPS.swarm,

            stroke: {
              ...DEFAULT_GEX_PLOT_DISPLAY_PROPS.swarm.stroke,
              color: DEFAULT_PALETTE[idx],
            },
          },
        }

        //opts.box.stroke = DEFAULT_PALETTE[idx]
        //opts.violin.fill = DEFAULT_PALETTE[idx]

        gexPlotSettings[id] = props
      }
    })

    updateGexPlotSettings(gexPlotSettings)
  }, [datasets])

  useEffect(() => {
    if (outputMode === 'Heatmap' && dataframes.length > 0) {
      setShowDialog({ name: 'heatmap' })
    }
  }, [outputMode, dataframes])

  useEffect(() => {
    if (clusterFrame) {
      //setShowDialog({name:"heatmap"})
    }
  }, [clusterFrame])

  async function fetchGex() {
    if (!platform) {
      alertDispatch({
        type: 'set',
        alert: makeWarningAlert({
          title: 'Gene Expression',
          size: 'popup',
          content: 'You must select a platform.',
        }),
      })
      return
    }

    if (genes.length === 0) {
      alertDispatch({
        type: 'set',
        alert: makeErrorAlert({
          title: 'Gene Expression',
          size: 'dialog',
          content:
            'You do not have permission to download data from this module. Please contact your adminstrator to get access.',
        }),
      })
      return
    }

    const selectedDatasets = datasets.filter(dataset =>
      datasetUseMap.get(dataset.id.toString())
    )

    if (selectedDatasets.length === 0) {
      return
    }

    const accessToken = await refreshAccessToken()

    if (!accessToken) {
      alertDispatch({
        type: 'set',
        alert: makeErrorAlert({
          title: 'Gene Expression',
          size: 'dialog',
          content:
            'You do not have permission to download data from this module. Please contact your adminstrator to get access.',
        }),
      })

      return
    }

    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['gex'],
        queryFn: () => {
          return axios.post(
            API_GEX_EXP_URL,
            {
              platform,
              gexValueType,
              genes,
              datasets: selectedDatasets.map(dataset => dataset.id),
            },
            {
              headers: bearerHeaders(accessToken),
            }
          )
        },
      })

      const search: IGexSearchResults = res.data.data

      // for heatmap
      const columns: string[] = search.genes[0].datasets
        .map(dataset =>
          datasetMap.get(dataset.id)!.samples.map(sample => sample.name)
        )
        .flat()
      const data: number[][] = search.genes.map(gene =>
        gene.datasets.map(dataset => dataset.values).flat()
      )
      const index: string[] = search.genes.map(gene => gene.gene.geneSymbol)
      const df = new DataFrame({
        data,
        columns,
        index,
        name: gexValueType?.name,
      })

      //console.log('df', df)

      setDataframes([df])

      // for each dataset, make a group so the blocks can be
      // colored
      setGroups(
        search.genes[0].datasets.map((dataset, di) => {
          const ds = datasetMap.get(dataset.id)

          const cidx = di % DEFAULT_PALETTE.length

          const group: IClusterGroup = {
            id: nanoid(),
            name: ds?.name ?? '',
            color: DEFAULT_PALETTE[cidx],
            search: ds?.samples.map(sample => sample.name) ?? [],
          }

          return group
        })
      )

      // for violin
      setSearch(search)
    } catch (error) {
      alertDispatch({
        type: 'set',
        alert: makeErrorAlert({
          title: 'Gene Expression',
          size: 'dialog',
          content:
            'You do not have permission to download data from this module. Please contact your adminstrator to get access.',
        }),
      })
    }
  }

  // async function getPileup() {
  //   const location = parseLocation(search)

  //   if (!location) {
  //     return
  //   }

  //   let dna: IDNA = { location, seq: "" }

  //   try {
  //     dna = await fetchDNA(location, {
  //       format: "upper",
  //       assembly: "hg19",
  //     })
  //   } catch (e) {
  //     console.log(e)
  //   }

  //   let pileup: IPileupResults = { location, pileup: [] }

  //   //console.log(dbIndex, dbQuery)
  //   //console.log(`${dbQuery.data[dbIndex].assembly}:${dbQuery.data[database].name}`)

  //   try {
  //     pileup = await fetchPileup(
  //       location,
  //       datasets.filter(dataset => datasetUseMap.get(dataset.id)),
  //     )
  //   } catch (e) {
  //     console.log(e)
  //   }

  //   console.log("dl", pileup)

  //   setPileup({ dna, pileupResults: pileup })
  // }

  useEffect(() => {
    if (genes.length === 0) {
      return
    }

    fetchGex()
  }, [genes])

  useEffect(() => {
    if (!searchResults || searchResults.genes.length === 0) {
      return
    }

    const stats: IGexStats[][] = searchResults.genes.map(result => {
      // for each gene compare each pair
      const values: number[][] = result.datasets.map(dataset =>
        dataset.values.map(v =>
          displayProps.tpm.log2Mode ? Math.log2(v + 1) : v
        )
      )

      const datasetStats: IGexStats[] = range(0, values.length)
        .map(i => {
          return range(i + 1, values.length).map(j => {
            return { idx1: i, idx2: j, ...mannWhitneyU(values[i], values[j]) }
          })
        })
        .flat()

      return datasetStats
    })

    //console.log(stats)

    setStats(stats)

    //
    // make a table
    //

    const data: number[][] = searchResults.genes.map(geneResult =>
      geneResult.datasets.map(datasetResult => datasetResult.values).flat()
    )

    const df = new DataFrame({
      data,
      index: searchResults.genes.map(
        geneResult =>
          `${geneResult.gene.geneSymbol} (${geneResult.gene.geneId})`
      ),
      columns: searchResults.genes[0].datasets
        .map(datasetResult =>
          datasetMap.get(datasetResult.id)!.samples.map(sample => sample.name)
        )
        .flat(),
    }).t()

    historyDispatch({
      type: 'reset',
      name: 'GEX',
      sheets: [df.setName('GEX')],
    })
  }, [searchResults])

  function save(format: string) {
    const df = history.currentStep.currentSheet

    if (!df) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(df, downloadRef, {
      hasHeader: true,
      hasIndex: true,
      file: `table.${format}`,
      sep,
    })

    setShowFileMenu(false)
  }

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      name: 'Home',
      content: (
        <>
          <ToolbarTabGroup>
            {/* <ToolbarIconButton
              aria-label="Save matrix to local file"
              onClick={() =>
                setShowDialog({
                  name: makeRandId('export'),
                })
              }
            >
              <SaveIcon className="-scale-100 fill-foreground" />
            </ToolbarIconButton> */}

            <ToolbarButton
              title="Save table"
              onClick={() =>
                setShowDialog({
                  name: makeRandId('save'),
                })
              }
            >
              <SaveIcon className="-scale-100" />
            </ToolbarButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup className="gap-x-2">
            <span>Values:</span>
            <Select
              value={gexValueType?.name}
              onValueChange={value => {
                if (platform) {
                  const matches = platform.gexValueTypes.filter(
                    t => t.name === value
                  )

                  if (matches.length > 0) {
                    setGexValueType(matches[0])
                  }
                }
              }}
            >
              <SelectTrigger size="sm" className="w-24">
                <SelectValue />
              </SelectTrigger>
              {platform && (
                <SelectContent>
                  {platform.gexValueTypes.map((t, ti) => (
                    <SelectItem value={t.name} key={ti}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              )}
            </Select>
          </ToolbarTabGroup>

          <ToolbarSeparator />
          <ToolbarTabGroup>
            <ToggleButtons
              tabs={platformTabs}
              value={platform?.name}
              onTabChange={selectedTab => {
                const pl = platforms.filter(
                  platform => platform.name === selectedTab.tab.name
                )

                if (pl.length > 0) {
                  setPlatform(pl[0])
                }
              }}
            >
              <ToggleButtonTriggers defaultWidth={4.5} variant="toolbar" />
            </ToggleButtons>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup>
            <ToggleButtons
              tabs={outputTabs}
              value={outputMode}
              onTabChange={selectedTab => {
                setOutputMode(selectedTab.tab.name as OutputMode)
              }}
            >
              <ToggleButtonTriggers defaultWidth={5} variant="toolbar" />
            </ToggleButtons>
          </ToolbarTabGroup>
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = [
    // {
    //   icon: <DatabaseIcon />,
    //   name: "Databases",
    //   content: (<MutationDBPanel databases={databases} />)
    // },
    // {
    //   id: nanoid(),
    //   icon: <SearchIcon />,
    //   name: "Genes",
    //   content: <SearchPropsPanel setGenes={setGenes} />,
    // },

    {
      //id: nanoid(),
      name: 'Genes',
      icon: <SlidersIcon />,

      content: (
        <GexPropsPanel
          datasets={datasets}
          setGenes={setGenes}
          //displayProps={displayProps}
          //onDisplayPropsChange={props => setDisplayProps(props)}
        />
      ),
    },

    {
      //id: nanoid(),
      name: 'History',
      icon: <ClockRotateLeftIcon />,

      content: <HistoryPanel />,
    },
  ]

  const fileMenuTabs: ITab[] = [
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
              downloadImageAutoFormat(svgRef, canvasRef, downloadRef, `gex.png`)
            }}
          >
            <FileImageIcon fill="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as SVG"
            onClick={() => {
              downloadImageAutoFormat(svgRef, canvasRef, downloadRef, `gex.svg`)
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
      {showDialog.name.includes('save') && (
        <SaveTxtDialog
          open="open"
          onSave={format => {
            save(format.ext)
            setShowDialog(NO_DIALOG)
          }}
          onCancel={() => setShowDialog(NO_DIALOG)}
        />
      )}

      {showDialog.name.includes('export') && (
        <SaveImageDialog
          open="open"
          onSave={format => {
            downloadImageAutoFormat(
              svgRef,
              canvasRef,
              downloadRef,
              `gex.${format.ext}`
            )
            setShowDialog(NO_DIALOG)
          }}
          onCancel={() => setShowDialog(NO_DIALOG)}
        />
      )}

      {showDialog.name === 'heatmap' && (
        <HeatMapDialog
          df={dataframes[0]}
          onPlot={cf => {
            setShowDialog(NO_DIALOG)

            setClusterFrame(cf)
          }}
          onCancel={() => setShowDialog(NO_DIALOG)}
        />
      )}

      <ShortcutLayout info={MODULE_INFO}>
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={
              <ShowSideButton
                onClick={() => setFoldersIsOpen(!foldersIsOpen)}
              />
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

        <SlideBar
          open={foldersIsOpen}
          onOpenChange={setFoldersIsOpen}
          limits={[10, 90]}
          position={15}
          mainContent={
            <TabSlideBar
              side="right"
              tabs={rightTabs}
              value={rightTab}
              onTabChange={selectedTab => setRightTab(selectedTab.tab.name)}
              open={showSideBar}
              onOpenChange={setShowSideBar}
            >
              <ResizablePanelGroup
                direction="vertical"
                className="grow"
                id="gex"
              >
                <ResizablePanel
                  id="list"
                  defaultSize={50}
                  minSize={10}
                  collapsible={true}
                  className={cn(
                    'relative grow overflow-hidden flex flex-col m-2'
                  )}
                >
                  {/* <BaseRow className="grow gap-x-1">
                    <BaseCol>
                      <ToolbarButton
                        title="Save mutation table"
                        onClick={() =>
                          setShowDialog({
                            name: makeRandId('save'),
                          })
                        }
                      >
                        <SaveIcon className="-scale-100" />
                      </ToolbarButton>
                    </BaseCol> */}

                  <TabbedDataFrames
                    key="tabbed-data-frames"
                    //selectedSheet={history.currentStep.currentSheetIndex}
                    dataFrames={
                      clusterFrame
                        ? [
                            ...dataframes,
                            getClusterOrderedDataFrame(clusterFrame).setName(
                              'Heatmap'
                            ),
                          ]
                        : dataframes
                    }
                    onTabChange={selectedTab => {
                      // historyDispatch({
                      //   type: 'change_sheet',
                      //   sheetId: selectedTab.index,
                      // })
                    }}
                  />
                  {/* </BaseRow> */}
                </ResizablePanel>
                <ThinVResizeHandle />

                <ResizablePanel
                  defaultSize={50}
                  minSize={10}
                  className="flex flex-col" // bg-white border border-border rounded-md overflow-hidden"
                >
                  <BaseCol className={cn(DATA_PANEL_CLS, 'gap-y-2 p-2')}>
                    <ToolbarTabGroup>
                      <ToolbarButton
                        title="Export image"
                        onClick={() =>
                          setShowDialog({
                            name: makeRandId('export'),
                          })
                        }
                      >
                        <SaveIcon className="-scale-100 fill-foreground" />
                        <span>{TEXT_EXPORT}</span>
                      </ToolbarButton>
                    </ToolbarTabGroup>
                    <div className="custom-scrollbar relative overflow-y-scroll grow">
                      {outputMode === 'Violin' && searchResults && (
                        <GexBoxWhiskerPlotSvg
                          ref={svgRef}
                          plot={searchResults}
                          datasetMap={datasetMap}
                          //displayProps={displayProps}
                          gexValueType={gexValueType}
                          allStats={stats}
                        />
                      )}

                      {outputMode === 'Heatmap' && clusterFrame && (
                        <HeatMapSvg
                          cf={clusterFrame}
                          groups={groups}
                          ref={svgRef}
                        />
                      )}
                    </div>
                  </BaseCol>
                </ResizablePanel>
              </ResizablePanelGroup>
            </TabSlideBar>
          }
          sideContent={
            <SearchPropsPanel
              foldersTab={foldersTab}
              datasets={datasets}
              datasetUseMap={datasetUseMap}
              setDatasetUseMap={setDatasetUseMap}
              setGenes={setGenes}
            />
            // <ResizablePanelGroup direction="vertical" className="grow">
            //   <ResizablePanel
            //     defaultSize={80}
            //     minSize={10}
            //     className="flex flex-col gap-y-2"
            //     id="tree"
            //   >
            //     <SideToggleGroup
            //       type="single"
            //       values={platforms.map(platform => platform.name)}
            //       value={platform?.name}
            //       onValueChange={value => {
            //         const pl = platforms.filter(
            //           platform => platform.name === value
            //         )

            //         if (pl.length > 0) {
            //           setPlatform(pl[0])
            //         }
            //       }}
            //     >
            //       {platforms.map((platform, ti) => (
            //         <ToggleGroupItem key={ti} value={platform.name}>
            //           {platform.name}
            //         </ToggleGroupItem>
            //       ))}
            //     </SideToggleGroup>

            //     <MenuSeparator />

            //     <CollapseTree
            //       tab={foldersTab}
            //       value={tab}
            //       onValueChange={t => {
            //         setTab(t)
            //       }}
            //       onCheckedChange={(tab: ITab, state: boolean) => {
            //         const tabId = getTabId(tab)

            //         if (tab.name === 'Datasets') {
            //           // update all datasets and collections
            //           setDatasetUseMap(
            //             new Map<string, boolean>(
            //               [...datasetUseMap.keys()].map(
            //                 key => [key, state] as [string, boolean]
            //               )
            //             )
            //           )
            //         } else if (tabId.includes('institution')) {
            //           // for a particular institution, update the datasets
            //           setDatasetUseMap(
            //             new Map<string, boolean>([
            //               ...datasetUseMap.entries(),
            //               ...datasets
            //                 .filter(dataset => dataset.institution === tab.name)
            //                 .map(
            //                   dataset =>
            //                     [dataset.id.toString(), state] as [
            //                       string,
            //                       boolean,
            //                     ]
            //                 ),
            //               [tab.name, state],
            //             ])
            //           )
            //         } else {
            //           // update a specific dataset
            //           setDatasetUseMap(
            //             new Map<string, boolean>([
            //               ...datasetUseMap.entries(),
            //               [tabId, state],
            //             ])
            //           )
            //         }
            //       }}
            //     />
            //   </ResizablePanel>
            //   <ThinVResizeHandle />
            //   <ResizablePanel
            //     id="list"
            //     defaultSize={20}
            //     minSize={10}
            //     collapsible={true}
            //     className="flex flex-col mb-1"
            //   ></ResizablePanel>
            // </ResizablePanelGroup>
          }
        >
          <SlideBarContentFramer className="grow pr-1" />
        </SlideBar>

        <ToolbarFooter className="justify-between">
          <div>{getDataFrameInfo(history.currentStep.currentSheet)}</div>
          <></>
          <ZoomSlider
            scale={displayProps.page.scale}
            onZoomChange={(scale: number) => {
              setDisplayProps({
                ...displayProps,
                page: { ...displayProps.page, scale },
              })
            }}
          />
        </ToolbarFooter>

        <a ref={downloadRef} className="hidden" href="#" />

        <canvas ref={canvasRef} width={0} height={0} className="hidden" />
      </ShortcutLayout>
    </>
  )
}

export function GexQueryPage() {
  return (
    <AlertsProvider>
      <HistoryProvider>
        <MatcalcSettingsProvider>
          <GexPage />
        </MatcalcSettingsProvider>
      </HistoryProvider>
    </AlertsProvider>
  )
}
