import { BaseCol } from '@components/base-col'

import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { Input } from '@components/shadcn/ui/themed/input'

import { HistoryContext } from '@components/history-provider'
import { Label } from '@components/shadcn/ui/themed/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@components/shadcn/ui/themed/radio-group'
import type { ISelectionRange } from '@components/table/use-selection-range'
import { ToggleButtonTriggers, ToggleButtons } from '@components/toggle-buttons'
import { VCenterRow } from '@components/v-center-row'
import { TEXT_CANCEL } from '@consts'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'

import { DataFrame } from '@lib/dataframe/dataframe'
import { NA } from '@lib/text/text'
import { nanoid } from '@lib/utils'
import { API_GENECONV_URL } from '@modules/edb'

import axios from 'axios'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/shadcn/ui/themed/accordion'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import type { SeriesType } from '@lib/dataframe/dataframe-types'
import { range } from '@lib/math/range'
import { useQueryClient } from '@tanstack/react-query'
import { useContext, useEffect } from 'react'
import { MatcalcSettingsContext } from './matcalc-settings-provider'

const OUTPUT_TYPES = [
  { name: 'Symbol' },
  { name: 'Entrez' },
  { name: 'RefSeq' },
  { name: 'Ensembl' },
]

export interface IProps {
  open?: boolean
  df: BaseDataFrame | null
  selection: ISelectionRange
  onConversion: () => void
  onCancel?: () => void
}

export function GeneConvertDialog({
  open = true,
  df,
  selection,
  onConversion,
  onCancel,
}: IProps) {
  const queryClient = useQueryClient()

  const { settings, updateSettings } = useContext(MatcalcSettingsContext)

  //const [outputSymbols, setOutputSymbols] = useState("Symbol")
  //const [useIndex, setUseIndex] = useState(false)
  //const [useColumns, setUseColumns] = useState(false)
  //const [delimiter, setDelimiter] = useState(" /// ")

  //const [duplicate, setDuplicate] = useState(false)
  const [, historyDispatch] = useContext(HistoryContext)

  useEffect(() => {
    updateSettings({
      ...settings,
      geneConvert: {
        ...settings.geneConvert,
        convertIndex: selection.start.c === -1,
        useSelectedColumns: selection.start.c !== -1,
      },
    })
  }, [df, selection])

  async function convert() {
    if (!df || df.size === 0) {
      return
    }

    //   const token = await loadAccessToken()

    // if (!token) {
    //   return null
    // }

    //const conv = mouseToHuman ? ["mouse", "human"] : ["human", "mouse"]
    //const output = outputSymbols ? "symbols" : "entrez"
    //const f = `/modules/mouse_human/${conv}_${output}.json.gz`
    //console.log(f)
    //const data = await fetchJson(f)

    const exact = true

    try {
      let searches: string[]

      if (settings.geneConvert.convertIndex) {
        // convert index
        searches = df.index.strs
        //range(0, df.shape[0]).map(i => {
        //   const g = df.index.getName(i)

        //   if (g in data) {
        //     return data[g].join(delimiter)
        //   } else {
        //     return "----"
        //   }
        // })
      } else {
        searches = df.col(
          settings.geneConvert.useSelectedColumns ? selection.start.c : 0
        )!.strs
      }

      const res = await queryClient.fetchQuery({
        queryKey: ['geneconvert'],
        queryFn: () =>
          axios.post(
            `${API_GENECONV_URL}/convert/${settings.geneConvert.fromSpecies.toLowerCase()}/${settings.geneConvert.toSpecies.toLowerCase()}`,
            {
              searches,
              exact,
            },
            {
              headers: {
                //Authorization: bearerTokenHeader(token),
                'Content-Type': 'application/json',
              },
            }
          ),
      })

      let data = res.data.data

      // conversions store data in conversions entry,
      // but the entries are the same as for gene info
      // so we can just step 1 deeper into structure
      // and continue as normal
      if (settings.geneConvert.fromSpecies != settings.geneConvert.toSpecies) {
        data = data.conversions
      }

      let rename: string[] = []

      for (const [ri] of searches.entries()) {
        const conv = data[ri]

        // let symbol = ""
        // let entrez = -1
        // let refseq = ""
        // let ensembl = ""

        // if (conv.genes.length > 0) {
        //   symbol = conv.genes[0].symbol
        //   entrez = conv.genes[0].entrez
        //   refseq = conv.genes[0].refseq.join("|")
        //   ensembl = conv.genes[0].ensembl.join("|")
        // }
        if (conv.length > 0) {
          switch (settings.geneConvert.outputSymbols) {
            case 'Entrez':
              rename.push(conv[0].entrez)
              break
            case 'RefSeq':
              rename.push(conv[0].refseq.join(settings.geneConvert.delimiter))
              break
            case 'Ensembl':
              rename.push(conv[0].ensembl.join(settings.geneConvert.delimiter))
              break
            default:
              rename.push(conv[0].symbol)
              break
          }
        } else {
          //table.push(row.concat(symbol, entrez, refseq, ensembl))

          rename.push(NA)
        }
      }

      //return new DataFrame({ data: table, columns: header })

      const outName = `${settings.geneConvert.fromSpecies} to ${settings.geneConvert.toSpecies}`

      let df_out = df
        .copy()
        .setName(outName)
        .setCol(settings.geneConvert.toSpecies, rename)

      if (settings.geneConvert.duplicateRows) {
        const d: SeriesType[][] = []

        const idCol = df_out
          .col(settings.geneConvert.toSpecies)!
          .values.map(v => v.toString())
        console.log(idCol)

        let columns = df_out.columns.values
        if (settings.geneConvert.convertIndex) {
          columns = ['', ...columns]
        }

        range(0, df_out.shape[0]).forEach(rowid => {
          const ids = idCol[rowid].split(settings.geneConvert.delimiter)

          let origRow = df_out.row(rowid)!.values

          if (settings.geneConvert.convertIndex) {
            origRow = [df_out.getRowName(rowid), ...origRow]
          }

          ids.forEach(id => {
            // copy row
            const rc = origRow.slice()
            rc[rc.length - 1] = id

            d.push(rc)
          })
        })
        console.log(df_out.columns)

        df_out = new DataFrame({ data: d, columns }).setName(outName)
      }

      historyDispatch({
        type: 'add_step',
        name: outName,
        sheets: [df_out],
      })

      //data.push(row.concat([dj.data.dna]))
    } catch (error) {
      console.log(error)
    }

    onConversion?.()
  }

  return (
    <OKCancelDialog
      open={open}
      title="Gene Conversion"
      onReponse={r => {
        if (r === TEXT_CANCEL) {
          onCancel?.()
        } else {
          convert()
        }
      }}
      //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
    >
      <Accordion type="multiple" defaultValue={['species', 'output', 'input']}>
        <AccordionItem value="species">
          <AccordionTrigger>Species</AccordionTrigger>
          <AccordionContent innerClassName="flex flex-col gap-y-2">
            <VCenterRow className="gap-x-4">
              <VCenterRow className="gap-x-2">
                <span>From</span>
                <ToggleButtons
                  tabs={[
                    { id: 'human', name: 'Human' },
                    { id: 'mouse', name: 'Mouse' },
                  ]}
                  value={settings.geneConvert.fromSpecies}
                  onTabChange={selectedTab => {
                    updateSettings({
                      ...settings,
                      geneConvert: {
                        ...settings.geneConvert,
                        fromSpecies: selectedTab.tab.name,
                      },
                    })
                  }}
                >
                  <ToggleButtonTriggers />
                </ToggleButtons>
              </VCenterRow>
              <VCenterRow className="gap-x-2">
                <span>To</span>
                <ToggleButtons
                  tabs={[
                    { id: nanoid(), name: 'Human' },
                    { id: nanoid(), name: 'Mouse' },
                  ]}
                  value={settings.geneConvert.toSpecies}
                  onTabChange={selectedTab => {
                    updateSettings({
                      ...settings,
                      geneConvert: {
                        ...settings.geneConvert,
                        toSpecies: selectedTab.tab.name,
                      },
                    })
                  }}
                >
                  <ToggleButtonTriggers />
                </ToggleButtons>
              </VCenterRow>
            </VCenterRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="output">
          <AccordionTrigger>Output</AccordionTrigger>
          <AccordionContent innerClassName="flex flex-col gap-y-2">
            {/* <ToggleButtons
            tabs={OUTPUT_TYPES}
            value={outputSymbols}
            onValueChange={setOutputSymbols}
          /> */}

            <RadioGroup
              value={settings.geneConvert.outputSymbols}
              onValueChange={value => {
                updateSettings({
                  ...settings,
                  geneConvert: {
                    ...settings.geneConvert,
                    outputSymbols: value,
                  },
                })
              }}
              className="flex flex-col gap-y-1"
            >
              {OUTPUT_TYPES.map((tab, ti) => (
                <VCenterRow key={ti} className="gap-x-1.5">
                  <RadioGroupItem
                    value={tab.name}
                    //onClick={() => setAssembly(assembly)}
                  />
                  <Label htmlFor={tab.name}>{tab.name}</Label>
                </VCenterRow>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="input">
          <AccordionTrigger>Input</AccordionTrigger>
          <AccordionContent innerClassName="flex flex-col gap-y-2">
            <VCenterRow>
              <span className="w-28">Delimiter</span>
              <Input
                value={settings.geneConvert.delimiter}
                onChange={e => {
                  //console.log(index, e.target.value)

                  updateSettings({
                    ...settings,
                    geneConvert: {
                      ...settings.geneConvert,
                      delimiter: e.target.value,
                    },
                  })
                }}
                className="w-24 rounded-md"
                placeholder="Delimiter..."
              />
            </VCenterRow>
            <BaseCol className="gap-y-1">
              <Checkbox
                checked={settings.geneConvert.convertIndex}
                onCheckedChange={value =>
                  updateSettings({
                    ...settings,
                    geneConvert: {
                      ...settings.geneConvert,
                      convertIndex: value,
                    },
                  })
                }
              >
                Convert index
              </Checkbox>

              <Checkbox
                checked={settings.geneConvert.useSelectedColumns}
                onCheckedChange={value =>
                  updateSettings({
                    ...settings,
                    geneConvert: {
                      ...settings.geneConvert,
                      useSelectedColumns: value,
                    },
                  })
                }
              >
                Convert selected column
              </Checkbox>

              <Checkbox
                checked={settings.geneConvert.duplicateRows}
                onCheckedChange={value =>
                  updateSettings({
                    ...settings,
                    geneConvert: {
                      ...settings.geneConvert,
                      duplicateRows: value,
                    },
                  })
                }
              >
                Duplicate rows for multiple conversions
              </Checkbox>
            </BaseCol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </OKCancelDialog>
  )
}
