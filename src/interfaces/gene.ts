import { type IBaseExon } from './base-exon'
import { type ITranscript } from './transcript'

export interface IGene extends IBaseExon {
  index: any
  name: string
  chr: string
  strand: string
  transcripts: ITranscript[]
}
