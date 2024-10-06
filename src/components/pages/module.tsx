'use client'

import { BaseCol } from '@components/base-col'
import { BaseLink } from '@components/link/base-link'
import { ContentLayout } from '@layouts/content-layout'
import { cn } from '@lib/class-names'
import { HEADER_LINKS } from '@menus'
import { QCP } from '@query'
import { FOCUS_RING_CLS } from '@theme'

function ModulePage({ name = 'Index' }: { name?: string }) {
  return (
    <ContentLayout title={name}>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 py-8">
        {HEADER_LINKS.map(section => {
          return section.modules.filter(
            module =>
              module.mode !== 'dev' || process.env.NODE_ENV !== 'production'
          )
        })
          .flat()
          .sort((modA, modB) => modA.name.localeCompare(modB.name))
          .map((module, moduleIndex) => {
            let abbr = ''

            if (module.abbr) {
              abbr = module.abbr
            } else {
              abbr = `${module.name[0].toUpperCase()}${module.name[1].toLowerCase()}`
            }

            return (
              <li key={moduleIndex}>
                <BaseLink
                  aria-label={module.name}
                  href={module.slug}
                  className={cn(
                    FOCUS_RING_CLS,
                    'trans-shadow flex flex-row items-center p-4 pr-4 gap-4 rounded-lg hover:shadow-md bg-background'
                  )}
                >
                  <span
                    className="w-12 h-12 aspect-square shrink-0 rounded-full flex flex-row items-center justify-center text-white"
                    style={{
                      backgroundColor: module.color ?? 'lightslategray',
                    }}
                  >
                    <span className="font-bold">{abbr[0].toUpperCase()}</span>
                    <span>{abbr[1].toLowerCase()}</span>
                  </span>
                  <BaseCol>
                    <p className="font-semibold">{module.name}</p>
                    <p className="text-xs">{module.description}</p>
                  </BaseCol>
                </BaseLink>
              </li>
            )
          })}
      </ul>
    </ContentLayout>
  )
}

export function ModuleQueryPage() {
  return (
    <QCP>
      <ModulePage />
    </QCP>
  )
}
