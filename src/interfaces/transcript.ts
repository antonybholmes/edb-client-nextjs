import { type IBaseExon } from "./base-exon"
import { type IExon } from "./exon"
import { type ILocation } from "./location"

export interface ITranscript extends IBaseExon, ILocation {
  id: string
  geneId: string
  geneSymbol: string
  strand: string
  exons: IExon[]
}
