import { ToolbarFooter } from "@components/toolbar/toolbar-footer"

import { BaseRow } from "@components/base-row"

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from "@components/toolbar/toolbar"
import { ToolbarIconButton } from "@components/toolbar/toolbar-icon-button"
import { ToolbarSeparator } from "@components/toolbar/toolbar-separator"

import { ToolbarTabButton } from "@components/toolbar/toolbar-tab-button"
import { NO_DIALOG, TEXT_SAVE_AS, type IDialogParams } from "@consts"
import { HistoryContext, HistoryProvider } from "@hooks/use-history"
import { ClockRotateLeftIcon } from "@icons/clock-rotate-left-icon"
import { getDataFrameInfo } from "@lib/dataframe/dataframe-utils"

import { GenomicLocation } from "@modules/genomic/genomic"
import { useContext, useEffect, useRef, useState } from "react"

import {
  AlertsContext,
  AlertsProvider,
  makeErrorAlert,
} from "@components/alerts/alerts-provider"
import {
  API_MUTATIONS_DATABASES_URL as API_MUTATIONS_DATASETS_URL,
  API_MUTATIONS_PILEUP_URL,
  bearerHeaders,
} from "@modules/edb"
import { fetchDNA, type IDNA } from "@modules/genomic/dna"
import { parseLocation } from "@modules/genomic/genomic"
import axios from "axios"

import { BaseCol } from "@components/base-col"
import { CollapseTree, makeFoldersRootNode } from "@components/collapse-tree"
import { FileImageIcon } from "@components/icons/file-image-icon"
import { FileLinesIcon } from "@components/icons/file-lines-icon"
import { FolderIcon } from "@components/icons/folder-icon"
import { HamburgerIcon } from "@components/icons/hamburger-icon"
import { PlayIcon } from "@components/icons/play-icon"
import { SaveIcon } from "@components/icons/save-icon"
import { SearchIcon } from "@components/icons/search-icon"
import { SlidersIcon } from "@components/icons/sliders-icon"
import {
  DEFAULT_PILEUP_PROPS,
  PileupPlotSvg,
  type IMotifPattern,
  type IMutationDataset,
  type IMutationSample,
  type IPileupPlot,
  type IPileupProps,
  type IPileupResults,
} from "@components/pages/modules/wgs/mutations/pileup-plot-svg"
import {
  DropdownMenuItem,
  MenuSeparator,
} from "@components/shadcn/ui/themed/dropdown-menu"
import { Input } from "@components/shadcn/ui/themed/input"
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@components/shadcn/ui/themed/resizable"

import { SlideBar } from "@components/slide-bar"
import { ThinHResizeHandle } from "@components/split-pane/thin-h-resize-handle"
import { ThinVResizeHandle } from "@components/split-pane/thin-v-resize-handle"
import { TabSlideBar } from "@components/tab-slide-bar"
import { TabbedDataFrames } from "@components/table/tabbed-dataframes"
import { ToolbarButton } from "@components/toolbar/toolbar-button"
import { VCenterRow } from "@components/v-center-row"
import { ShortcutLayout } from "@layouts/shortcut-layout"
import { DataFrame } from "@lib/dataframe/dataframe"
import { downloadDataFrame } from "@lib/dataframe/dataframe-utils"
import { downloadImageAutoFormat } from "@lib/image-utils"
import { makeRandId, nanoid } from "@lib/utils"
import { QCP, queryClient } from "@query"

import { PileupPropsPanel } from "./pileup-props-panel"

import { HistoryPanel } from "@components/pages/history-panel"
import { SaveImageDialog } from "@components/pages/save-image-dialog"
import { SaveTxtDialog } from "@components/pages/save-txt-dialog"
import {
  SideToggleGroup,
  ToggleGroupItem,
} from "@components/shadcn/ui/themed/side-toggle-group"
import { getTabId, type ITab } from "@components/tab-provider"
import { V_SCROLL_CHILD_CLS, VScrollPanel } from "@components/v-scroll-panel"
import { useAccessTokenCache } from "@stores/use-access-token-cache"
import MODULE_INFO from "./module.json"

export const DEFAULT_MOTIF_PATTERNS: IMotifPattern[] = [
  {
    name: "AID",
    regex: /(?:[AG]G[CT][AT])|(?:[AT][AG]C[CT])/g,
    color: "red",
    bgColor: "red",
    bgOpacity: 0.1,
    show: true,
  },
]

export function MutationsPage() {
  //const [fileStore, filesDispatch] = useReducer(filesReducer, { files: [] })
  //const [fileData, setFileData] = useState<{ [key: string]: string[] }>({})

  const [search, setSearch] = useState("chr3:187462653-187462712")
  // Order the display based on the drag list re-ordering

  const [rightTab, setRightTab] = useState("Search")

  const [dbIndex, setDbIndex] = useState(0)
  //const [colorMapName, setColorMap] = useState("Lymphgen")
  const [sampleColorMap, setSampleColorMap] = useState<
    Map<string, string> | undefined
  >(undefined)

  //const [databases, setDatabases] = useState<IMutationDB[]>([])

  //const searchRef = useRef<HTMLTextAreaElement>(null)
  const [pileup, setPileup] = useState<IPileupPlot | null>(null)
  const [foldersIsOpen, setFoldersIsOpen] = useState(true)
  const [tab, setTab] = useState<ITab | undefined>(undefined)
  const [samples, setSamples] = useState<IMutationSample[]>([])
  const [datasetUseMap, setDatasetUseMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>(),
  )

  const [assembly, setAssembly] = useState("hg19")

  const { refreshAccessToken } = useAccessTokenCache()

  const [sampleMap, setSampleMap] = useState<Map<string, IMutationSample>>(
    new Map<string, IMutationSample>(),
  )
  const [foldersTab, setFoldersTab] = useState<ITab>({
    ...makeFoldersRootNode("Datasets"),
  })

  //const [addChrPrefix, setAddChrPrefix] = useState(true)

  const [showSideBar, setShowSideBar] = useState(true)

  const canvasRef = useRef(null)
  const downloadRef = useRef<HTMLAnchorElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const [, alertDispatch] = useContext(AlertsContext)

  const [datasets, setDatasets] = useState<IMutationDataset[]>([])

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>(NO_DIALOG)

  const [displayProps, setDisplayProps] = useState<IPileupProps>({
    ...DEFAULT_PILEUP_PROPS,
  })

  const [history, historyDispatch] = useContext(HistoryContext)

  const [motifPatterns, setMotifPatterns] = useState<IMotifPattern[]>([
    ...DEFAULT_MOTIF_PATTERNS,
  ])

  //const [, setSelection] = useContext(SelectionRangeContext)

  // const dbQuery = useQuery({
  //   queryKey: ["datasets"],
  //   queryFn: async () => {
  //     //const token = await loadAccessToken()

  //     console.log(API_MUTATIONS_DATASETS_URL)

  //     const res = await axios.get(
  //       `${API_MUTATIONS_DATASETS_URL}/${assembly}`,
  //       {},
  //     )

  //     return res.data.data
  //   },
  // })

  async function loadDatasets() {
    const res = await queryClient.fetchQuery({
      queryKey: ["datasets"],
      queryFn: () => {
        return axios.post(
          `${API_MUTATIONS_DATASETS_URL}/${assembly}`,
          {},
          {
            headers: {
              //Authorization: bearerTokenHeader(token),
              "Content-Type": "application/json",
            },
          },
        )
      },
    })

    const datasets: IMutationDataset[] = res.data.data

    setDatasets(datasets)

    setDatasetUseMap(
      new Map<string, boolean>(
        datasets.map(dataset => [dataset.publicId, true]),
      ),
    )
  }

  useEffect(() => {
    try {
      loadDatasets()
    } catch (error) {
      console.log(error)
    }
  }, [assembly])

  useEffect(() => {
    setSampleMap(
      new Map<string, IMutationSample>(
        datasets
          .map(dataset =>
            dataset.samples.map(
              sample => [sample.publicId, sample] as [string, IMutationSample],
            ),
          )
          .flat(),
      ),
    )
  }, [datasets])

  useEffect(() => {
    const children: ITab[] = datasets.map(dataset => {
      return {
        id: dataset.publicId,
        name: dataset.name,
        icon: <FolderIcon />,
        isOpen: true,
        data: dataset.samples,
        checked: datasetUseMap.get(dataset.publicId),
        // onCheckedChange: (state: boolean) => {
        //   onCheckedChange(dataset, state)
        // },
      } as ITab
    })

    const tab: ITab = {
      ...makeFoldersRootNode("Datasets"),
      children,
    }

    setFoldersTab(tab)
  }, [datasets, datasetUseMap])

  useEffect(() => {
    if (!(displayProps.cmap in displayProps.cmaps)) {
      return
    }

    const cmap: { [key: string]: string } =
      displayProps.cmaps[displayProps.cmap]

    // sample color map
    let scm: Map<string, string> | null = null

    switch (displayProps.cmap) {
      case "COO":
        scm = new Map<string, string>(
          datasets
            .map(d => d.samples)
            .flat()
            .map(s => [s.publicId, s.coo in cmap ? cmap[s.coo] : "black"]),
        )

        console.log(scm)

        break
      case "Lymphgen":
        scm = new Map<string, string>(
          datasets

            .map(d => d.samples)
            .flat()
            .map(s => [
              s.publicId,
              s.lymphgen in cmap ? cmap[s.lymphgen] : "black",
            ]),
        )

        break
      default:
        scm = new Map<string, string>()
        break
    }

    if (scm) {
      setSampleColorMap(scm)
    }
  }, [datasets, displayProps])

  useEffect(() => {
    setSamples(
      datasets
        .filter(dataset => datasetUseMap.get(dataset.publicId))
        .map(d => d.samples)
        .flat()
        .sort((sa, sb) => sa.name.localeCompare(sb.name)),
    )
  }, [datasets, datasetUseMap, tab])

  function loadTestData() {
    setSearch("chr3:187462653-187462712")
  }

  async function fetchPileup(
    location: GenomicLocation,
    datasets: IMutationDataset[],
  ): Promise<IPileupResults> {
    let ret: IPileupResults = { location, pileup: [] }

    const accessToken = await refreshAccessToken()

    if (!accessToken) {
      alertDispatch({
        type: "set",
        alert: makeErrorAlert({
          title: "WGS Mutations",
          size: "dialog",
          content:
            "You do not have permission to download data from this module. Please contact your adminstrator to get access.",
        }),
      })

      return ret
    }

    //console.log(location, datasets, accessToken)

    try {
      const res = await queryClient.fetchQuery({
        queryKey: ["pileup"],
        queryFn: () => {
          return axios.post(
            `${API_MUTATIONS_PILEUP_URL}/${assembly}`,
            {
              locations: [location.toString()],
              datasets: datasets.map(dataset => dataset.publicId),
            },
            {
              headers: bearerHeaders(accessToken),
            },
          )
        },
      })

      ret = res.data.data
    } catch (error) {
      console.error(error)
    }

    return ret
  }

  async function getPileup() {
    const location = parseLocation(search)

    if (!location) {
      return
    }

    let dna: IDNA = { location, seq: "" }

    try {
      dna = await fetchDNA(location, {
        format: "Upper",
        assembly: "hg19",
      })
    } catch (e) {
      console.log(e)
    }

    let pileup: IPileupResults = { location, pileup: [] }

    //console.log(dbIndex, dbQuery)
    //console.log(`${dbQuery.data[dbIndex].assembly}:${dbQuery.data[database].name}`)

    try {
      pileup = await fetchPileup(
        location,
        datasets.filter(dataset => datasetUseMap.get(dataset.publicId)),
      )
    } catch (e) {
      console.log(e)
    }

    console.log("dl", pileup)

    setPileup({ dna, pileupResults: pileup })
  }

  useEffect(() => {
    if (!pileup) {
      return
    }
  }, [pileup])

  useEffect(() => {
    if (!pileup) {
      return
    }

    const datasetMap = new Map<string, string>(
      datasets
        .map(dataset =>
          dataset.samples.map(
            sample => [sample.publicId, dataset.name] as [string, string],
          ),
        )
        .flat(),
    )

    const cooMap = new Map<string, string>(
      datasets
        .map(dataset =>
          dataset.samples.map(
            sample => [sample.publicId, sample.coo] as [string, string],
          ),
        )
        .flat(),
    )

    const lymphgenMap = new Map<string, string>(
      datasets
        .map(dataset =>
          dataset.samples.map(
            sample => [sample.publicId, sample.lymphgen] as [string, string],
          ),
        )
        .flat(),
    )

    const loc = parseLocation(search)

    const data = pileup.pileupResults?.pileup.flat().map(mutation => {
      let chr = mutation.chr.replace("chr", "")

      if (displayProps.chrPrefix.show) {
        chr = `chr${chr}`
      }

      console.log(mutation.sample, sampleMap)

      return [
        sampleMap.get(mutation.sample)!.name,
        chr,
        mutation.start,
        mutation.end,
        mutation.start - loc.start + 1,
        mutation.ref,
        // remove leading insertion caret
        mutation.tum.replace("^", ""),
        mutation.type.slice(2),
        // remove 1:, 2:, 3: ordering info
        mutation.tDepth - mutation.tAltCount,
        mutation.tAltCount,
        mutation.tDepth,

        mutation.vaf,
        sampleMap.get(mutation.sample)!.pairedNormalDna,
        datasetMap.get(mutation.sample) ?? "",
        sampleMap.get(mutation.sample)!.institution,
        sampleMap.get(mutation.sample)!.sampleType,
        cooMap.get(mutation.sample) ?? "",
        lymphgenMap.get(mutation.sample) ?? "",
      ]
    })

    const df = new DataFrame({
      data,
      columns: [
        "Sample",
        "Chromosome",
        "Start_Position",
        "End_Position",
        "Offset",
        "Reference_Allele",
        "Tumor_Seq_Allele2",
        "Variant_Type",
        "t_ref_count",
        "t_alt_count",
        "t_depth",
        "VAF",

        "Paired_Normal_DNA",
        "Dataset",
        "Institution",
        "Sample_Type",
        "COO",
        "Lymphgen",
      ],
    })

    historyDispatch({
      type: "reset",
      name: "Mutations",
      sheets: [df.setName("Mutations")],
    })
  }, [displayProps, pileup])

  function save(format: string) {
    const df = history.currentStep.currentSheet

    if (!df) {
      return
    }

    const sep = format === "csv" ? "," : "\t"

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
      name: "Home",
      content: (
        <>
          <BaseRow>
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
                  name: makeRandId("export"),
                })
              }
            >
              <SaveIcon className="-scale-100 fill-foreground" />
            </ToolbarIconButton>
          </BaseRow>

          <ToolbarSeparator />

          <ToolbarIconButton
            title="Fetch mutations"
            onClick={() => {
              try {
                getPileup()
              } catch (e) {
                console.log(e)
              }
            }}
          >
            <PlayIcon className="fill-foreground" />
          </ToolbarIconButton>
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
    {
      id: nanoid(),
      icon: <SlidersIcon />,
      name: "Display",
      content: (
        <PileupPropsPanel
          displayProps={displayProps}
          motifPatterns={motifPatterns}
          onDisplayPropsChange={props => setDisplayProps(props)}
          onMotifPatternsChange={patterns => setMotifPatterns(patterns)}
          onDBChange={index => setDbIndex(index)}
        />
      ),
    },

    {
      id: nanoid(),
      icon: <ClockRotateLeftIcon />,
      name: "History",
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
      id: nanoid(),
      name: TEXT_SAVE_AS,
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as TXT"
            onClick={() => {
              save("txt")
            }}
          >
            <FileLinesIcon fill="" />
            <span>Download as TXT</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Download as CSV"
            onClick={() => {
              save("csv")
            }}
          >
            <span>Download as CSV</span>
          </DropdownMenuItem>
        </>
      ),
    },
    {
      id: nanoid(),
      name: "Export",
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as PNG"
            onClick={() => {
              downloadImageAutoFormat(
                svgRef,
                canvasRef,
                downloadRef,
                `mutations.png`,
              )
            }}
          >
            <FileImageIcon fill="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as SVG"
            onClick={() => {
              downloadImageAutoFormat(
                svgRef,
                canvasRef,
                downloadRef,
                `mutations.svg`,
              )
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
      {showDialog.name.includes("save") && (
        <SaveTxtDialog
          open={showDialog.name}
          onSave={format => {
            save(format.ext)
            setShowDialog(NO_DIALOG)
          }}
          onCancel={() => setShowDialog(NO_DIALOG)}
        />
      )}

      {showDialog.name.includes("export") && (
        <SaveImageDialog
          open={showDialog.name}
          onSave={format => {
            downloadImageAutoFormat(
              svgRef,
              canvasRef,
              downloadRef,
              `mutations.${format.ext}`,
            )
            setShowDialog(NO_DIALOG)
          }}
          onCancel={() => setShowDialog(NO_DIALOG)}
        />
      )}

      <ShortcutLayout
        info={MODULE_INFO}
        headerCenterChildren={
          <Input
            value={search}
            variant="plain"
            onChange={e => setSearch(e.target.value)}
            className="w-80 text-xs font-medium rounded-md bg-accent/50 pl-8  hover:bg-white/40 fill-white/50 hover:fill-white/90 text-white trans-color"
            inputCls="text-center"
            onKeyDown={e => {
              if (e.key === "Enter") {
                try {
                  getPileup()
                } catch (e) {
                  console.log(e)
                }
              }
            }}
            rightChildren={
              <button
                className="w-8 h-8 aspect-square flex flex-row items-center justify-center"
                onClick={() => {
                  getPileup()
                }}
              >
                <SearchIcon fill="" />
              </button>
            }
          />
        }
      >
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
            rightShortcuts={
              <ToolbarTabButton
                onClick={() => loadTestData()}
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
        {/* <div className="grow">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            id="tables"
            defaultSize={75}
            minSize={50}
            className="flex flex-col gap-y-4"
          >
            <HCenterRow>
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-96 rounded-full"
                rightChildren={
                  <button onClick={getPileup}>
                    <SearchIcon />
                  </button>
                }
              />
            </HCenterRow>
 

            <div className="custom-scrollbar relative overflow-scroll rounded-lg border border-border bg-white">
              <PileupPlotSvg
                db={
                  dbQuery.data && dbQuery.data.length > 0
                    ? dbQuery.data[database]
                    : null
                }
                ref={svgRef}
                plot={pileup}
                displayProps={displayProps}
                motifPatterns={motifPatterns}
              />
            </div>
          </ResizablePanel>
          <HResizeHandle />
          <ResizablePanel className="flex flex-col pl-2 pr-4" id="right-tabs">
            <SideBarTabs
              tabs={rightTabs}
              value={rightTab}
              onTabChange={selectedTab=>setRightTab(selectedTab.tab.name)}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div> */}

        <SlideBar
          open={foldersIsOpen}
          onOpenChange={setFoldersIsOpen}
          limits={[10, 90]}
          position={10}
          className="mt-2 mb-6"
        >
          <TabSlideBar
            side="right"
            tabs={rightTabs}
            value={rightTab}
            onTabChange={selectedTab => setRightTab(selectedTab.tab.name)}
            open={showSideBar}
            onOpenChange={setShowSideBar}
          >
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel
                id="sample-list"
                defaultSize={20}
                minSize={10}
                maxSize={90}
                className="flex flex-col bg-background rounded-t-md border-t border-l border-r border-border shadow-md overflow-hidden"
              >
                <VCenterRow className="p-3 border-b border-border justify-between text-xs">
                  <VCenterRow>{/* <Checkbox> </Checkbox> */}</VCenterRow>
                  <span>{samples.length} samples</span>
                </VCenterRow>
                <VScrollPanel asChild={true}>
                  <ul className={V_SCROLL_CHILD_CLS}>
                    {samples.map((sample, si) => {
                      return (
                        <li
                          key={si}
                          className="flex flex-row items-start text-xs gap-x-3 px-3 py-2 border-b border-border"
                        >
                          <BaseCol>
                            <p className="font-semibold">{sample.name}</p>
                            <p>
                              {sample.coo}, {sample.lymphgen}
                            </p>
                          </BaseCol>
                        </li>
                      )
                    })}
                  </ul>
                </VScrollPanel>
              </ResizablePanel>
              <ThinHResizeHandle />
              <ResizablePanel className="flex flex-col " id="right-tabs">
                <ResizablePanelGroup
                  direction="vertical"
                  className="grow  "
                  autoSaveId="pileup-resizable-panels-v"
                >
                  <ResizablePanel
                    defaultSize={75}
                    minSize={10}
                    className="flex flex-col"
                    id="pileup"
                  >
                    <div className="custom-scrollbar relative overflow-y-scroll grow bg-white border border-border rounded-md">
                      {pileup && (
                        <PileupPlotSvg
                          ref={svgRef}
                          sampleMap={sampleMap}
                          plot={pileup}
                          displayProps={displayProps}
                          motifPatterns={motifPatterns}
                          colorMap={sampleColorMap}
                        />
                      )}
                    </div>
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
                              name: makeRandId("save"),
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
                            type: "change_sheet",
                            sheetId: selectedTab.index,
                          })
                        }}
                      />
                    </BaseRow>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          </TabSlideBar>

          <BaseCol className="gap-y-2  grow">
            {/* <HCenterRow>
              <ToggleButtons
                tabs={[
                  { id: nanoid(), name: "hg19" },
                  { id: nanoid(), name: "grch38" },
                ]}
                value={assembly}
                onValueChange={setAssembly}
              />
            </HCenterRow> */}

            <SideToggleGroup
              type="single"
              value={assembly}
              values={["hg19", "grch38"]}
              onValueChange={setAssembly}
            >
              <ToggleGroupItem value="hg19">hg19</ToggleGroupItem>

              <ToggleGroupItem value="grch38">grch38</ToggleGroupItem>
            </SideToggleGroup>

            <MenuSeparator />

            <CollapseTree
              tab={foldersTab}
              value={tab}
              onValueChange={t => {
                // only use tabs from the tree that have content, otherwise
                // the ui will appear empty
                setTab(t)
              }}
              onCheckedChange={(tab: ITab, state: boolean) => {
                const tabId = getTabId(tab)
                setDatasetUseMap(
                  new Map<string, boolean>([
                    ...datasetUseMap.entries(),
                    [tabId, state],
                  ]),
                )
              }}
            />
          </BaseCol>
        </SlideBar>

        <ToolbarFooter className="justify-between">
          <div>{getDataFrameInfo(history.currentStep.currentSheet)}</div>
          <></>
          {/* <ZoomSlider scaleIndex={scaleIndex} onZoomChange={adjustScale} /> */}
        </ToolbarFooter>

        <a ref={downloadRef} className="hidden" href="#" />

        <canvas ref={canvasRef} width={0} height={0} className="hidden" />
      </ShortcutLayout>
    </>
  )
}

export function MutationsQueryPage() {
  return (
    <QCP>
      <AlertsProvider>
        <HistoryProvider>
          <MutationsPage />
        </HistoryProvider>
      </AlertsProvider>
    </QCP>
  )
}
