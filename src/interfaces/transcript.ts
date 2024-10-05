import { GenomicLocation } from "@modules/genomic/genomic"
import { type IBaseExon } from "./base-exon"
import { type IExon } from "./exon"
import { IGenomicLocation } from "./genomic-location"

export interface ITranscript extends IBaseExon, IGenomicLocation {
  id: string
  geneId: string
  geneSymbol: string
  strand: string
  exons: IExon[]
}
