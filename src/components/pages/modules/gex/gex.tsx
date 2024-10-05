import { ToolbarFooter } from '@components/toolbar/toolbar-footer'

import { BaseRow } from '@components/base-row'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@components/toolbar/toolbar'
import { ToolbarIconButton } from '@components/toolbar/toolbar-icon-button'

import { NO_DIALOG, TEXT_SAVE_AS, type IDialogParams } from '@consts'
import { HistoryContext, HistoryProvider } from '@hooks/use-history'
import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { getDataFrameInfo } from '@lib/dataframe/dataframe-utils'

import { useContext, useEffect, useRef, useState } from 'react'

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
  API_GEX_VALUE_TYPES_URL,
  bearerHeaders,
  JSON_HEADERS,
} from '@modules/edb'
import axios from 'axios'

import { BaseCol } from '@components/base-col'
import { CollapseTree, makeFoldersRootNode } from '@components/collapse-tree'
import { FileImageIcon } from '@components/icons/file-image-icon'
import { FileLinesIcon } from '@components/icons/file-lines-icon'
import { HamburgerIcon } from '@components/icons/hamburger-icon'
import { SaveIcon } from '@components/icons/save-icon'

import {
  DropdownMenuItem,
  MenuSeparator,
} from '@components/shadcn/ui/themed/dropdown-menu'
import {
  ResizablePanel,
  ResizablePanelGroup,
} from '@components/shadcn/ui/themed/resizable'
import { SlideBar, SlideBarContent } from '@components/slide-bar'
import { ThinVResizeHandle } from '@components/split-pane/thin-v-resize-handle'
import { TabSlideBar } from '@components/tab-slide-bar'
import { TabbedDataFrames } from '@components/table/tabbed-dataframes'
import { ToolbarButton } from '@components/toolbar/toolbar-button'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { downloadDataFrame } from '@lib/dataframe/dataframe-utils'
import { downloadImageAutoFormat } from '@lib/image-utils'
import { makeRandId } from '@lib/utils'
import { QCP } from '@query'

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
  type IGexDataset,
  type IGexPlatform,
  type IGexResultGene,
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
import {
  SideToggleGroup,
  ToggleGroupItem,
} from '@components/shadcn/ui/themed/side-toggle-group'
import { getTabId, type ITab } from '@components/tab-provider'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'
import { ZoomSlider } from '@components/toolbar/zoom-slider'
import { useAccessTokenCache } from '@stores/use-access-token-cache'
import { useQueryClient } from '@tanstack/react-query'
import { DATA_PANEL_CLS } from '../matcalc/data-panel'
import MODULE_INFO from './module.json'

// export const MODULE_INFO: IModuleInfo = {
//   name: "Gene Expression",
//   description: "Gene Expression",
//   version: "1.0.0",
//   copyright: "Copyright (C) 2024 Antony Holmes",
// }

export function GexPage() {
  const queryClient = useQueryClient()

  const [rightTab, setRightTab] = useState('Search')

  const [platform, setPlatform] = useState<IGexPlatform | null>(null)
  const [gexValueTypes, setGexValueTypes] = useState<IGexValueType[]>([])

  //const {settings, applySettings}=useGexSettingsStore()
  const [gexValueType, setGexValueType] = useState<IGexValueType | undefined>(
    undefined
  )

  const [genes, setGenes] = useState<string[]>([])
  //const [colorMapName, setColorMap] = useState("Lymphgen")
  const [sampleColorMap, setSampleColorMap] = useState<
    Map<number, string> | undefined
  >(undefined)

  const [results, setResults] = useState<IGexResultGene[]>([])

  //const [databases, setDatabases] = useState<IMutationDB[]>([])

  //const searchRef = useRef<HTMLTextAreaElement>(null)

  const [foldersIsOpen, setFoldersIsOpen] = useState(true)
  const [tab, setTab] = useState<ITab | undefined>(undefined)
  //const [samples, setSamples] = useState<IGexSample[]>([])

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
  const [platforms, setPlatforms] = useState<IGexPlatform[]>([])

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  const [, alertDispatch] = useContext(AlertsContext)

  const [stats, setStats] = useState<IGexStats[][]>([])

  const [history, historyDispatch] = useContext(HistoryContext)

  const [displayProps, setDisplayProps] = useGexStore()
  const { gexPlotSettings, applyGexPlotSettings } = useGexPlotStore()

  const { refreshAccessToken } = useAccessTokenCache(queryClient)

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

  // useEffect(() => {
  //   if (!dbQuery.data) {
  //     return
  //   }

  //   // map databases and add a use bool to datasets so we can
  //   // later allow users to pick which datasets they want to use
  //   //setDatasetMap(makeAssemblyMutationMap(dbQuery.data))
  //   const platforms: IGexPlatform[] = dbQuery.data

  //   setPlatforms(platforms)
  // }, [dbQuery.data])

  useEffect(() => {
    if (!platform) {
      const defaultPlatforms = platforms.filter(t => t.name.includes('RNA'))

      if (defaultPlatforms.length > 0) {
        setPlatform(defaultPlatforms[0])
      }
    }
  }, [platforms])

  async function loadValueTypes() {
    const res = await queryClient.fetchQuery({
      queryKey: ['value_types'],
      queryFn: () => {
        return axios.post(
          API_GEX_VALUE_TYPES_URL,
          { platform },
          {
            headers: JSON_HEADERS,
          }
        )
      },
    })

    const types: IGexValueType[] = res.data.data

    setGexValueTypes(types)
  }

  useEffect(() => {
    if (gexValueTypes.length === 0) {
      return
    }

    const defaultValueTypes = gexValueTypes.filter(t => t.name.includes('TPM'))

    if (defaultValueTypes.length > 0) {
      setGexValueType(defaultValueTypes[0])
      //applySettings({defaultGexValueType:{...settings.defaultGexValueType, platform}})
    } else {
      // In the case of microarray, use the first and only gex type RMA
      setGexValueType(gexValueTypes[0])
    }
  }, [gexValueTypes])

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

    loadValueTypes()
  }, [platform])

  useEffect(() => {
    if (!gexValueType) {
      return
    }
  }, [gexValueType])

  // useEffect(() => {
  //   setSampleMap(
  //     new Map<number, IGexSample>(
  //       datasets
  //         .map(dataset =>
  //           dataset.samples.map(
  //             sample => [sample.id, sample] as [number, IGexSample],
  //           ),
  //         )
  //         .flat(),
  //     ),
  //   )
  // }, [datasets])

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

    applyGexPlotSettings(gexPlotSettings)
  }, [datasets])

  // useEffect(() => {
  //   setSamples(
  //     datasets
  //       .filter(dataset => datasetUseMap.get(dataset.id.toString()))
  //       .map(d => d.samples)
  //       .flat()
  //       .sort((sa, sb) => sa.name.localeCompare(sb.name)),
  //   )
  // }, [datasets, datasetUseMap, tab])

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

      const results: IGexResultGene[] = res.data.data

      setResults(results)
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
    if (results.length === 0) {
      return
    }

    const stats: IGexStats[][] = results.map(result => {
      // for each gene compare each pair
      const values: number[][] = result.datasets.map(dataset =>
        dataset.samples.map(sample =>
          displayProps.tpm.log2Mode ? Math.log2(sample.value + 1) : sample.value
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

    const data: number[][] = results.map(geneResult =>
      geneResult.datasets
        .map(datasetResult => datasetResult.samples.map(sample => sample.value))
        .flat()
    )

    const df = new DataFrame({
      data,
      index: results.map(
        geneResult =>
          `${geneResult.gene.geneSymbol} (${geneResult.gene.geneId})`
      ),
      columns: results[0].datasets
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
  }, [results])

  // useEffect(() => {
  //   if (!pileup) {
  //     return
  //   }

  //   const datasetMap = new Map<number, string>(
  //     datasets
  //       .map(dataset =>
  //         dataset.samples.map(
  //           sample => [sample.id, dataset.name] as [number, string],
  //         ),
  //       )
  //       .flat(),
  //   )

  //   const cooMap = new Map<number, string>(
  //     datasets
  //       .map(dataset =>
  //         dataset.samples.map(
  //           sample => [sample.id, sample.coo] as [number, string],
  //         ),
  //       )
  //       .flat(),
  //   )

  //   const lymphgenMap = new Map<number, string>(
  //     datasets
  //       .map(dataset =>
  //         dataset.samples.map(
  //           sample => [sample.id, sample.lymphgen] as [number, string],
  //         ),
  //       )
  //       .flat(),
  //   )

  //   const loc = parseLocation(search)

  //   const data = pileup.pileupResults?.pileup.flat().map(mutation => {
  //     let chr = mutation.chr.replace("chr", "")

  //     if (displayProps.chrPrefix.show) {
  //       chr = `chr${chr}`
  //     }

  //     console.log(mutation.sample, sampleMap)

  //     return [
  //       sampleMap.get(mutation.sample)!.name,
  //       chr,
  //       mutation.start,
  //       mutation.end,
  //       mutation.start - loc.start + 1,
  //       mutation.ref,
  //       // remove leading insertion caret
  //       mutation.tum.replace("^", ""),
  //       mutation.type.slice(2),
  //       // remove 1:, 2:, 3: ordering info
  //       mutation.tDepth - mutation.tAltCount,
  //       mutation.tAltCount,
  //       mutation.tDepth,

  //       mutation.vaf,
  //       sampleMap.get(mutation.sample)!.pairedNormalDna,
  //       datasetMap.get(mutation.sample) ?? "",
  //       sampleMap.get(mutation.sample)!.institution,
  //       sampleMap.get(mutation.sample)!.sampleType,
  //       cooMap.get(mutation.sample) ?? "",
  //       lymphgenMap.get(mutation.sample) ?? "",
  //     ]
  //   })

  //   const df = new DataFrame({
  //     data,
  //     columns: [
  //       "Sample",
  //       "Chromosome",
  //       "Start_Position",
  //       "End_Position",
  //       "Offset",
  //       "Reference_Allele",
  //       "Tumor_Seq_Allele2",
  //       "Variant_Type",
  //       "t_ref_count",
  //       "t_alt_count",
  //       "t_depth",
  //       "VAF",

  //       "Paired_Normal_DNA",
  //       "Dataset",
  //       "Institution",
  //       "Sample_Type",
  //       "COO",
  //       "Lymphgen",
  //     ],
  //   })

  //   historyDispatch({
  //     type: "reset",
  //     name: "Mutations",
  //     sheets: [df.setName("Mutations")],
  //   })
  // }, [displayProps, pileup])

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
            {/* <ToolbarOpenFile
              onOpenChange={open => {
                if (open) {
                  setShowDialog({
                    name: makeRandId("open"),
                    
                  })
                }
              }}
              multiple={true}
              fileTypes={["motif", "motifs"]}
            /> */}

            <ToolbarIconButton
              aria-label="Save matrix to local file"
              onClick={() =>
                setShowDialog({
                  name: makeRandId('export'),
                })
              }
            >
              <SaveIcon className="-scale-100 fill-foreground" />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup className="gap-x-2">
            <span>Values:</span>
            <Select
              value={gexValueType?.name}
              onValueChange={value => {
                const matches = gexValueTypes.filter(t => t.name === value)

                if (matches.length > 0) {
                  setGexValueType(matches[0])
                }
              }}
            >
              <SelectTrigger size="sm" className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gexValueTypes.map((t, ti) => (
                  <SelectItem value={t.name} key={ti}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
    // {
    //   id: nanoid(),
    //   name: "Open",
    //   icon: <OpenIcon fill="" />,
    //   content: (
    //     <DropdownMenuItem
    //       aria-label={TEXT_OPEN_FILE}
    //       onClick={() =>
    //         setShowDialog({ name: makeRandId("open"), params: {} })
    //       }
    //     >
    //       <UploadIcon fill="" />

    //       <span>{TEXT_OPEN_FILE}</span>
    //     </DropdownMenuItem>
    //   ),
    // },
    // { id: nanoid(), name: "<divider>" },
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

      <ShortcutLayout info={MODULE_INFO}>
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={
              <ToolbarButton
                onClick={() => setFoldersIsOpen(!foldersIsOpen)}
                title="Show folders"
              >
                <HamburgerIcon />
              </ToolbarButton>
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
          className="mt-2 mb-6"
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
                  defaultSize={75}
                  minSize={10}
                  className="flex flex-col" // bg-white border border-border rounded-md overflow-hidden"
                >
                  <BaseCol className={DATA_PANEL_CLS}>
                    <div className="custom-scrollbar relative overflow-y-scroll grow">
                      {results && (
                        <GexBoxWhiskerPlotSvg
                          ref={svgRef}
                          plot={results}
                          datasetMap={datasetMap}
                          //displayProps={displayProps}
                          gexValueType={gexValueType}
                          allStats={stats}
                        />
                      )}
                    </div>
                  </BaseCol>
                </ResizablePanel>
                <ThinVResizeHandle />
                <ResizablePanel
                  id="list"
                  defaultSize={25}
                  minSize={10}
                  collapsible={true}
                  className="flex flex-col"
                >
                  <BaseRow className="grow gap-x-1">
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
                    </BaseCol>

                    <TabbedDataFrames
                      key="tabbed-data-frames"
                      selectedSheet={history.currentStep.currentSheetIndex}
                      dataFrames={history.currentStep.sheets}
                      onTabChange={selectedTab => {
                        historyDispatch({
                          type: 'change_sheet',
                          sheetId: selectedTab.index,
                        })
                      }}
                    />
                  </BaseRow>
                </ResizablePanel>
              </ResizablePanelGroup>
            </TabSlideBar>
          }
          sideContent={
            <ResizablePanelGroup direction="vertical" className="grow">
              <ResizablePanel
                defaultSize={80}
                minSize={10}
                className="flex flex-col gap-y-2"
                id="tree"
              >
                <SideToggleGroup
                  type="single"
                  values={platforms.map(platform => platform.name)}
                  value={platform?.name}
                  onValueChange={value => {
                    const pl = platforms.filter(
                      platform => platform.name === value
                    )

                    if (pl.length > 0) {
                      setPlatform(pl[0])
                    }
                  }}
                >
                  {platforms.map((platform, ti) => (
                    <ToggleGroupItem key={ti} value={platform.name}>
                      {platform.name}
                    </ToggleGroupItem>
                  ))}
                </SideToggleGroup>

                <MenuSeparator />

                <CollapseTree
                  tab={foldersTab}
                  value={tab}
                  onValueChange={t => {
                    setTab(t)
                  }}
                  onCheckedChange={(tab: ITab, state: boolean) => {
                    const tabId = getTabId(tab)

                    if (tab.name === 'Datasets') {
                      // update all datasets and collections
                      setDatasetUseMap(
                        new Map<string, boolean>(
                          [...datasetUseMap.keys()].map(
                            key => [key, state] as [string, boolean]
                          )
                        )
                      )
                    } else if (tabId.includes('institution')) {
                      // for a particular institution, update the datasets
                      setDatasetUseMap(
                        new Map<string, boolean>([
                          ...datasetUseMap.entries(),
                          ...datasets
                            .filter(dataset => dataset.institution === tab.name)
                            .map(
                              dataset =>
                                [dataset.id.toString(), state] as [
                                  string,
                                  boolean,
                                ]
                            ),
                          [tab.name, state],
                        ])
                      )
                    } else {
                      // update a specific dataset
                      setDatasetUseMap(
                        new Map<string, boolean>([
                          ...datasetUseMap.entries(),
                          [tabId, state],
                        ])
                      )
                    }
                  }}
                />
              </ResizablePanel>
              <ThinVResizeHandle />
              <ResizablePanel
                id="list"
                defaultSize={20}
                minSize={10}
                collapsible={true}
                className="flex flex-col mb-1"
              ></ResizablePanel>
            </ResizablePanelGroup>
          }
        >
          <SlideBarContent />
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
    <QCP>
      <AlertsProvider>
        <HistoryProvider>
          <GexPage />
        </HistoryProvider>
      </AlertsProvider>
    </QCP>
  )
}
