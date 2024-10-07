import { GeneConvQueryPage } from '@components/pages/modules/gene/geneconvert/geneconvert'
import MODULE_INFO from '@components/pages/modules/gene/geneconvert/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <GeneConvQueryPage />
}
