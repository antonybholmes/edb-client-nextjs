import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { Label } from '@components/shadcn/ui/themed/label'
import { ToggleButtonTriggers, ToggleButtons } from '@components/toggle-buttons'
import { VCenterRow } from '@components/v-center-row'
import { forwardRef, type ForwardedRef } from 'react'

export interface IProps {
  fromSpecies: string
  toSpecies: string
  exact: boolean
  setFromSpecies: (value: string) => void
  setToSpecies: (value: string) => void
  setExact: (value: boolean) => void
}

export const GeneConvertPropsPanel = forwardRef(function GeneConvertPropsPanel(
  {
    fromSpecies,
    toSpecies,
    exact,
    setFromSpecies,
    setToSpecies,
    setExact,
  }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const tabs = [
    { id: 'human', name: 'Human' },
    { id: 'mouse', name: 'Mouse' },
  ]

  console.log(fromSpecies, toSpecies)

  return (
    <PropsPanel ref={ref}>
      <ScrollAccordion value={['species']}>
        <AccordionItem value="species">
          <AccordionTrigger>Species</AccordionTrigger>
          <AccordionContent>
            <VCenterRow className="gap-x-2">
              <Label className="w-12">From</Label>
              <ToggleButtons
                tabs={tabs}
                value={fromSpecies}
                onTabChange={selectedTab => {
                  setFromSpecies(selectedTab.tab.name)
                }}
              >
                <ToggleButtonTriggers />
              </ToggleButtons>
            </VCenterRow>

            <VCenterRow className="gap-x-2">
              <Label className="w-12">To</Label>
              <ToggleButtons
                tabs={tabs}
                value={toSpecies}
                onTabChange={selectedTab => {
                  setToSpecies(selectedTab.tab.name)
                }}
              >
                <ToggleButtonTriggers />
              </ToggleButtons>
            </VCenterRow>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
})
