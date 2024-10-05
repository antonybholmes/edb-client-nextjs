import { BaseCol } from "@components/base-col"
import { VCenterRow } from "@components/v-center-row"

import { DoubleNumericalInput } from "@components/double-numerical-input"
import { TagIcon } from "@components/icons/tag-icon"
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from "@components/pages/plot/color-picker-button"
import { type IVolcanoProps } from "@components/plot/volcano-plot-svg"
import { PropRow } from "@components/prop-row"
import { PropsPanel } from "@components/props-panel"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from "@components/shadcn/ui/themed/accordion"
import { Button } from "@components/shadcn/ui/themed/button"
import { NumericalInput } from "@components/shadcn/ui/themed/numerical-input"
import { Textarea3 } from "@components/shadcn/ui/themed/textarea3"
import { SwitchPropRow } from "@components/switch-prop-row"
import { ToolbarTabGroup } from "@components/toolbar/toolbar-tab-group"
import { TEXT_CLEAR } from "@consts"
import type { BaseDataFrame } from "@lib/dataframe/base-dataframe"
import { findCol, getNumCol } from "@lib/dataframe/dataframe-utils"
import { range } from "@lib/math/range"
import { forwardRef, useContext, useState, type ForwardedRef } from "react"
import { PlotPropsContext } from "./plot-props-context"
import type { IPlot } from "./plots-context"

export interface IProps {
  df: BaseDataFrame
  x: string
  y: string
  plot: IPlot
}

export const VolcanoPropsPanel = forwardRef(function HeatmapPropsPanel(
  { df, x, y, plot }: IProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [propsState, propsDispatch] = useContext(PlotPropsContext)

  const displayProps: IVolcanoProps | undefined = propsState.props.get(
    plot.id,
  ) as IVolcanoProps

  if (!displayProps) {
    return null
  }

  const [text, setText] = useState<string>(
    displayProps.labels.values.join("\n"),
  )

  function addLabels() {
    const values: string[] = text
      .split(/[\r\n]/)
      .map(x => x.trim())
      .filter(x => x.length > 0)

    propsDispatch({
      type: "update",
      id: plot.id,
      props: {
        ...displayProps,
        labels: {
          ...displayProps!.labels,
          values,
        },
      } as IVolcanoProps,
    })
  }

  function getShouldLabel(logFc: number, logP: number): boolean {
    if (displayProps!.logP.show && displayProps!.logFc.show) {
      if (
        logP > displayProps!.logP.threshold &&
        Math.abs(logFc) > displayProps!.logFc.threshold
      ) {
        return true
      }
    } else {
      if (
        (displayProps!.logP.show && logP > displayProps!.logP.threshold) ||
        (displayProps!.logFc.show &&
          Math.abs(logFc) > displayProps!.logFc.threshold)
      ) {
        return true
      }
    }

    return false
  }

  function loadHighlightedLabels() {
    const xdata = getNumCol(df, findCol(df, x))

    const ydata = getNumCol(df, findCol(df, y))

    const idx = new Set(
      range(0, df.shape[0]).filter(i => getShouldLabel(xdata[i], ydata[i])),
    )

    const values = df.index.values
      .filter((v, i) => idx.has(i))
      .map(l => l.toString())

    setText(values.join("\n"))

    propsDispatch({
      type: "update",
      id: plot.id,
      props: {
        ...displayProps,
        labels: {
          ...displayProps!.labels,
          values,
        },
      } as IVolcanoProps,
    })
  }

  return (
    <PropsPanel>
      <ScrollAccordion value={["plot", "fold-change", "p-value", "labels"]}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Size">
              <DoubleNumericalInput
                v1={displayProps.axes.xaxis.range[1]}
                v2={displayProps.axes.yaxis.range[1]}
                limit={[1, 1000]}
                dp={0}
                onNumChanged1={v => {
                  console.log(v, displayProps.axes.xaxis.range[1])
                  propsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      axes: {
                        ...displayProps.axes,
                        xaxis: {
                          ...displayProps.axes.xaxis,
                          range: [0, v],
                        },
                      },
                    },
                  })
                }}
                onNumChanged2={v => {
                  propsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      axes: {
                        ...displayProps.axes,
                        yaxis: {
                          ...displayProps.axes.yaxis,
                          range: [0, v],
                        },
                      },
                    },
                  })
                }}
              />
            </PropRow>

            <PropRow title="Dots">
              <NumericalInput
                id="size"
                value={displayProps.dots.size}
                placeholder="Size..."
                dp={0}
                className="w-16 rounded-md"
                onNumChanged={v => {
                  propsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      dots: {
                        ...displayProps.dots,
                        size: v,
                      },
                    },
                  })
                }}
              />

              <ColorPickerButton
                color={displayProps.dots.color}
                onColorChange={color =>
                  propsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      dots: { ...displayProps.dots, color },
                    },
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </PropRow>

            <SwitchPropRow
              title="Border"
              checked={displayProps.border.show}
              onCheckedChange={state => {
                propsDispatch({
                  type: "update",
                  id: plot.id,
                  props: {
                    ...displayProps,
                    border: {
                      ...displayProps.border,
                      show: state,
                    },
                  },
                })
              }}
            >
              <ColorPickerButton
                color={displayProps.border.color}
                onColorChange={color =>
                  propsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      border: { ...displayProps.border, color },
                    },
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </SwitchPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fold-change">
          <AccordionTrigger>Fold change</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Filter"
              checked={displayProps.logFc.show}
              onCheckedChange={state => {
                propsDispatch({
                  type: "update",
                  id: plot.id,
                  props: {
                    ...displayProps,
                    logFc: {
                      ...displayProps.logFc,
                      show: state,
                    },
                  },
                })
              }}
            >
              <NumericalInput
                id="max"
                value={Math.pow(2, displayProps.logFc.threshold)}
                dp={2}
                placeholder="Max..."
                className="w-16 rounded-md"
                onNumChanged={v => {
                  propsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      logFc: {
                        ...displayProps.logFc,
                        threshold: Math.log2(v),
                      },
                    },
                  })
                }}
              />
            </SwitchPropRow>

            <PropRow title="Highlight">
              <ColorPickerButton
                color={displayProps.logFc.neg.color}
                onColorChange={color =>
                  propsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      logFc: {
                        ...displayProps.logFc,
                        neg: {
                          ...displayProps.logFc.neg,
                          color,
                        },
                      },
                    },
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Points &lt; 0"
              />

              <ColorPickerButton
                color={displayProps.logFc.pos.color}
                onColorChange={color =>
                  propsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      logFc: {
                        ...displayProps.logFc,
                        pos: {
                          ...displayProps.logFc.pos,
                          color,
                        },
                      },
                    },
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Points &ge; 0"
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="p-value">
          <AccordionTrigger>P-value</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Filter"
              checked={displayProps.logP.show}
              onCheckedChange={state => {
                propsDispatch({
                  type: "update",
                  id: plot.id,
                  props: {
                    ...displayProps,
                    logP: {
                      ...displayProps.logP,
                      show: state,
                    },
                  },
                })
              }}
            >
              <NumericalInput
                id="max"
                value={Math.pow(10, -displayProps.logP.threshold)}
                dp={2}
                placeholder="Max..."
                className="w-16 rounded-md"
                onNumChanged={v => {
                  propsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      logP: {
                        ...displayProps.logP,
                        threshold: -Math.log10(v),
                      },
                    },
                  })
                }}
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Line"
              checked={displayProps.logP.line.show}
              onCheckedChange={state => {
                propsDispatch({
                  type: "update",
                  id: plot.id,
                  props: {
                    ...displayProps,
                    logP: {
                      ...displayProps.logP,
                      line: { ...displayProps.logP.line, show: state },
                    },
                  },
                })
              }}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="labels">
          <AccordionTrigger>Labels</AccordionTrigger>
          <AccordionContent>
            <BaseCol className="gap-y-1">
              <Textarea3
                id="labels"
                aria-label="Labels"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Labels to highlight"
                className="h-48"
              />

              <VCenterRow className="justify-between">
                <ToolbarTabGroup className="gap-x-1">
                  <Button
                    variant="theme"
                    aria-label="Add labels to plot"
                    onClick={() => addLabels()}
                  >
                    Add labels to plot
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    aria-label="Load highlighted labels"
                    onClick={() => loadHighlightedLabels()}
                    title="Load highlighted labels from plot"
                  >
                    <TagIcon />
                  </Button>
                </ToolbarTabGroup>

                <Button
                  variant="link"
                  size="sm"
                  pad="none"
                  onClick={() => {
                    setText("")

                    propsDispatch({
                      type: "update",
                      id: plot.id,
                      props: {
                        ...displayProps,
                        labels: {
                          ...displayProps.labels,
                          values: [],
                        },
                      },
                    })
                  }}
                >
                  {TEXT_CLEAR}
                </Button>
              </VCenterRow>
            </BaseCol>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
})
