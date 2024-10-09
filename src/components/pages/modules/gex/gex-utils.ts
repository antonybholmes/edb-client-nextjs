import type { IMannWhitneyUResult } from '@lib/math/mann-whitney'

export interface IGexValueType {
  id: number
  name: 'Counts' | 'TPM' | 'VST' | 'RMA'
}

export interface IGexPlatform {
  id: number
  name: 'RNA-seq' | 'Microarray'
  gexValueTypes: IGexValueType[]
}

export interface IGexGene {
  id: number
  geneId: string
  geneSymbol: string
}

export interface IGexSample {
  id: number
  name: string
  coo: string
  lymphgen: string
}

export interface IGexDataset {
  id: number // a uuid to uniquely identify the database
  name: string // a human readable name for the database
  institution: string // a public id for the database

  samples: IGexSample[]

  displayProps: IGexPlotDisplayProps
}

export interface IGexResultSample {
  id: number
  //counts: number
  //tpm: number
  //vst: number
  value: number
}

export interface IGexResultDataset {
  id: number
  //samples: IGexResultSample[]
  values: number[]
}

export interface IGexResultGene {
  gene: IGexGene
  //platform: IGexPlatform
  //gexValueType: IGexValueType
  datasets: IGexResultDataset[]
}

export interface IGexSearchResults {
  platform: IGexPlatform
  gexValueType: IGexValueType
  genes: IGexResultGene[]
}

export interface IGexStats extends IMannWhitneyUResult {
  idx1: number
  idx2: number
}

export interface IGexPlotDisplayProps {
  box: {
    show: boolean
    width: number
    fill: {
      show: boolean
      color: string
      opacity: number
    }
    stroke: {
      show: boolean
      color: string
      width: number
    }

    median: { stroke: string }
  }
  violin: {
    show: boolean
    fill: {
      show: boolean
      color: string
      opacity: number
    }
    stroke: {
      show: boolean
      color: string
      width: number
    }
  }
  swarm: {
    show: boolean
    r: number
    fill: {
      show: boolean
      color: string
      opacity: number
    }
    stroke: {
      show: boolean
      color: string
      width: number
    }
  }
}

export interface IGexDisplayProps {
  title: {
    offset: number
  }
  page: {
    gap: { x: number; y: number }
    cols: number
    scale: number
  }
  axes: {
    x: {
      labels: {
        rotate: boolean
        truncate: number
      }
    }
    y: {
      globalMax: boolean
      offset: number
    }
  }
  // box: {
  //   show: boolean
  //   width: number
  // }
  violin: {
    //show: boolean
    globalNorm: boolean
  }
  plot: {
    gap: number
    bar: { width: number }
    height: number
  }

  cmap: string

  // swarm: {
  //   show: boolean
  //   r: number
  // }

  tpm: {
    log2Mode: boolean
  }

  stats: {
    show: boolean
    line: {
      // how much to offset each stat test line
      offset: number
      // size of drop down lines
      tail: number
    }
    p: {
      cutoff: number
    }
  }
}

export type GexPlotPropMap = { [key: string]: IGexPlotDisplayProps }

export const DEFAULT_GEX_DISPLAY_PROPS: IGexDisplayProps = {
  cmap: 'COO',
  tpm: {
    log2Mode: true,
  },
  plot: {
    gap: 10,
    bar: { width: 50 },
    height: 200,
  },
  // box: {
  //   show: true,
  //   width: 10,
  // },
  // swarm: {
  //   show: false,
  //   r: 2,
  // },
  violin: {
    //show: true,
    globalNorm: false,
  },
  page: {
    cols: 2,
    gap: { x: 150, y: 100 },
    scale: 2,
  },
  axes: {
    y: {
      globalMax: true,
      offset: -20,
    },
    x: {
      labels: {
        rotate: false,
        truncate: -2,
      },
    },
  },

  title: {
    offset: -10,
  },

  stats: {
    p: {
      cutoff: 0.05,
    },
    line: {
      offset: 10,
      tail: 4,
    },
    show: true,
  },
}

export const DEFAULT_GEX_PLOT_DISPLAY_PROPS: IGexPlotDisplayProps = {
  box: {
    median: { stroke: 'red' },

    show: true,
    width: 10,
    fill: {
      show: true,
      color: 'white',
      opacity: 1,
    },
    stroke: {
      show: true,
      color: 'black',
      width: 1.5,
    },
  },
  violin: {
    show: true,
    fill: {
      show: true,
      color: 'black',
      opacity: 0.3,
    },
    stroke: {
      show: false,
      color: 'black',
      width: 1.5,
    },
  },
  swarm: {
    show: false,
    r: 2,
    fill: {
      show: true,
      color: 'white',
      opacity: 1,
    },
    stroke: {
      show: true,
      color: 'black',
      width: 1,
    },
  },
}
