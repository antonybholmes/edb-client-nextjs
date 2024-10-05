import type {
  ColorBarPos,
  IHeatMapProps,
  LRPos,
  TBPos,
} from "@components/plot/heatmap-svg"

import { DoubleNumericalInput } from "@components/double-numerical-input"
import { PropRow } from "@components/prop-row"
import { PropsPanel } from "@components/props-panel"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from "@components/shadcn/ui/themed/accordion"
import { NumericalInput } from "@components/shadcn/ui/themed/numerical-input"
import { SideRadioGroupItem } from "@components/shadcn/ui/themed/radio-group"
import { Switch } from "@components/shadcn/ui/themed/switch"
import { SwitchPropRow } from "@components/switch-prop-row"
import { ToggleButtonTriggers, ToggleButtons } from "@components/toggle-buttons"
import type { ClusterFrame } from "@lib/math/hcluster"
import { nanoid } from "@lib/utils"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { forwardRef, useContext, type ForwardedRef } from "react"

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from "@components/pages/plot/color-picker-button"
import { ColorMapMenu } from "./color-map-menu"
import { PlotPropsContext } from "./plot-props-context"
import type { IPlot } from "./plots-context"

export interface IProps {
  plot: IPlot
  cf: ClusterFrame | null
}

export const HeatmapPropsPanel = forwardRef(function HeatmapPropsPanel(
  { plot, cf }: IProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const [propsState, plotPropsDispatch] = useContext(PlotPropsContext)

  const displayProps: IHeatMapProps | undefined = propsState.props.get(
    plot.id,
  ) as IHeatMapProps

  if (!displayProps) {
    return null
  }

  return (
    <PropsPanel ref={ref}>
      <ScrollAccordion value={["plot", "legend"]}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Cell size">
              <DoubleNumericalInput
                v1={displayProps.blockSize.w}
                v2={displayProps.blockSize.h}
                inputCls="w-16 rounded-md"
                dp={0}
                onNumChanged1={v => {
                  plotPropsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      blockSize: { w: v, h: displayProps.blockSize.h },
                    },
                  })
                }}
                onNumChanged2={v => {
                  plotPropsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      blockSize: { w: displayProps.blockSize.w, h: v },
                    },
                  })
                }}
              />
            </PropRow>

            <SwitchPropRow
              title="Grid"
              checked={displayProps.grid.show}
              onCheckedChange={state =>
                plotPropsDispatch({
                  type: "update",
                  id: plot.id,
                  props: {
                    ...displayProps,
                    grid: { ...displayProps.grid, show: state },
                  },
                })
              }
            >
              <ColorPickerButton
                color={displayProps.grid.color}
                onColorChange={color =>
                  plotPropsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      grid: { ...displayProps.grid, color },
                    },
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change grid lines color"
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Border"
              checked={displayProps.border.show}
              onCheckedChange={state =>
                plotPropsDispatch({
                  type: "update",
                  id: plot.id,
                  props: {
                    ...displayProps,
                    border: { ...displayProps.border, show: state },
                  },
                })
              }
            >
              <ColorPickerButton
                color={displayProps.border.color}
                onColorChange={color =>
                  plotPropsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      border: { ...displayProps.border, color },
                    },
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change border color"
              />
            </SwitchPropRow>

            {/* <VCenterRow className="gap-x-2">
            <FgBgColorPicker
              fgColor={displayProps.grid.color}
              bgColor={displayProps.border.color}
              allowNoColor={true}
              onFgColorChange={color =>
                heatmapPropsDispatch({type:"update", id:plot.id, props:{
                  ...displayProps,
                  grid: {
                    ...displayProps.grid,
                    color,
                    show: color !== COLOR_TRANSPARENT,
                  },
                })
              }
              onBgColorChange={color =>
                heatmapPropsDispatch({type:"update", id:plot.id, props:{
                  ...displayProps,
                  border: {
                    ...displayProps.border,
                    color,
                    show: color !== COLOR_TRANSPARENT,
                  },
                })
              }
            />
            <span>Grid</span>
          </VCenterRow> */}

            <PropRow title="Color map">
              <ColorMapMenu
                cmap={displayProps.cmap}
                onChange={cmap =>
                  plotPropsDispatch({
                    type: "update",
                    id: plot.id,
                    props: { ...displayProps, cmap },
                  })
                }
              />
            </PropRow>

            <PropRow title="Max">
              <NumericalInput
                id="max"
                value={displayProps.range[1]}
                min={0.5}
                inc={0.5}
                placeholder="Max..."
                className="w-16 rounded-md"
                onNumChanged={v => {
                  plotPropsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      range: [-v, v],
                    },
                  })
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="legend">
          <AccordionTrigger>Legend</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Show"
              checked={displayProps.legend.position !== "Off"}
              onCheckedChange={state => {
                plotPropsDispatch({
                  type: "update",
                  id: plot.id,
                  props: {
                    ...displayProps,
                    legend: {
                      ...displayProps.legend,
                      position: state ? "Upper Right" : "Off",
                    },
                  },
                })
              }}
            />

            <PropRow title="Color bar">
              <RadioGroupPrimitive.Root
                value={displayProps.colorbar.position}
                onValueChange={tab =>
                  plotPropsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      colorbar: {
                        ...displayProps.colorbar,
                        position: tab as ColorBarPos,
                      },
                    },
                  })
                }
                className="flex flex-row justify-start gap-x-0.5"
              >
                <SideRadioGroupItem
                  value="Off"
                  currentValue={displayProps.colorbar.position}
                  className="w-5"
                />
                <SideRadioGroupItem
                  value="Right"
                  currentValue={displayProps.colorbar.position}
                  className="w-5"
                />
                <SideRadioGroupItem
                  value="Bottom"
                  currentValue={displayProps.colorbar.position}
                  className="w-5"
                />
              </RadioGroupPrimitive.Root>
            </PropRow>
            <PropRow title="Row labels">
              <RadioGroupPrimitive.Root
                value={displayProps.rowLabels.position}
                onValueChange={tab =>
                  plotPropsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      rowLabels: {
                        ...displayProps.rowLabels,
                        position: tab as LRPos,
                      },
                    },
                  })
                }
                className="flex flex-row justify-start gap-x-0.5"
              >
                <SideRadioGroupItem
                  value="Off"
                  currentValue={displayProps.rowLabels.position}
                  className="w-5"
                />
                <SideRadioGroupItem
                  value="Left"
                  currentValue={displayProps.rowLabels.position}
                  className="w-5"
                />
                <SideRadioGroupItem
                  value="Right"
                  currentValue={displayProps.rowLabels.position}
                  className="w-5"
                />
              </RadioGroupPrimitive.Root>
            </PropRow>

            {cf?.rowTree && (
              <PropRow title="Tree">
                <RadioGroupPrimitive.Root
                  value={displayProps.rowTree.position}
                  onValueChange={tab =>
                    plotPropsDispatch({
                      type: "update",
                      id: plot.id,
                      props: {
                        ...displayProps,
                        rowTree: {
                          ...displayProps.rowTree,
                          position: tab as LRPos,
                        },
                      },
                    })
                  }
                  className="flex flex-row justify-start gap-x-0.5"
                >
                  <SideRadioGroupItem
                    value="Off"
                    currentValue={displayProps.rowTree.position}
                    className="w-5"
                  />
                  <SideRadioGroupItem
                    value="Left"
                    currentValue={displayProps.rowTree.position}
                    className="w-5"
                  />
                  <SideRadioGroupItem
                    value="Right"
                    currentValue={displayProps.rowTree.position}
                    className="w-5"
                  />
                </RadioGroupPrimitive.Root>
              </PropRow>
            )}

            <PropRow title="Column labels">
              <RadioGroupPrimitive.Root
                value={displayProps.colLabels.position}
                onValueChange={tab =>
                  plotPropsDispatch({
                    type: "update",
                    id: plot.id,
                    props: {
                      ...displayProps,
                      colLabels: {
                        ...displayProps.colLabels,
                        position: tab as TBPos,
                      },
                    },
                  })
                }
                className="flex flex-row justify-start gap-x-0.5"
              >
                <SideRadioGroupItem
                  value="Off"
                  currentValue={displayProps.colLabels.position}
                  className="w-5"
                />
                <SideRadioGroupItem
                  value="Top"
                  currentValue={displayProps.colLabels.position}
                  className="w-5"
                />
                <SideRadioGroupItem
                  value="Bottom"
                  currentValue={displayProps.colLabels.position}
                  className="w-5"
                />
              </RadioGroupPrimitive.Root>
            </PropRow>
            {cf?.colTree && (
              <PropRow title="Tree">
                <ToggleButtons
                  tabs={[
                    { id: nanoid(), name: "Top" },
                    { id: nanoid(), name: "Off" },
                  ]}
                  className="col-span-2"
                  value={displayProps.colTree.position}
                  onTabChange={selectedTab =>
                    plotPropsDispatch({
                      type: "update",
                      id: plot.id,
                      props: {
                        ...displayProps,
                        colTree: {
                          ...displayProps.colTree,
                          position: selectedTab.tab.name as TBPos,
                        },
                      },
                    })
                  }
                >
                  <ToggleButtonTriggers />
                </ToggleButtons>
              </PropRow>
            )}

            <Switch
              checked={displayProps.colLabels.isColored}
              onCheckedChange={state =>
                plotPropsDispatch({
                  type: "update",
                  id: plot.id,
                  props: {
                    ...displayProps,
                    colLabels: {
                      ...displayProps.colLabels,
                      isColored: state,
                    },
                  },
                })
              }
            >
              <span>Color labels by group</span>
            </Switch>

            <Switch
              checked={displayProps.groups.show}
              onCheckedChange={state =>
                plotPropsDispatch({
                  type: "update",
                  id: plot.id,
                  props: {
                    ...displayProps,
                    groups: { ...displayProps.groups, show: state },
                  },
                })
              }
            >
              <span>Show groups</span>
            </Switch>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
})
