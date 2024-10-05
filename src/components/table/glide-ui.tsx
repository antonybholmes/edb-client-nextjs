// import {BaseCol} from "@components/base-col"
// import {
//   DataEditor,
//   GridCellKind,
//   type GridCell,
//   type GridColumn,
//   type Item,
// } from "@glideapps/glide-data-grid"
// import "@glideapps/glide-data-grid/dist/index.scss"
// import type { IDim } from "@interfaces/dim"
// import {type IElementProps} from "@interfaces/element-props"
// import {type BaseDataFrame} from "@lib/dataframe/base-dataframe"
// import {
//   lazy,
//   useCallback,
//   useMemo,
//   useState
// } from "react"

// // function setDPI(canvas: HTMLCanvasElement, dpi: number) {
// //   // Set up CSS size.
// //   canvas.style.width = canvas.style.width || canvas.width + "px"
// //   canvas.style.height = canvas.style.height || canvas.height + "px"

// //   // Resize canvas and scale future draws.
// //   let scaleFactor = dpi / 96
// //   canvas.width = Math.ceil(canvas.width * scaleFactor)
// //   canvas.height = Math.ceil(canvas.height * scaleFactor)
// //   let ctx = canvas.getContext("2d")
// //   ctx.scale(scaleFactor, scaleFactor)
// // }

// const GAP = 4
// const GAP2 = GAP * 2
// const GRID_COLOR = "rgb(214, 211, 209)"
// const DELAY = 200
// const INDEX_BG_COLOR = "rgb(241, 245, 249)"
// const SELECTION_STROKE_COLOR = "rgb(59, 130, 246)"
// //const SELECTED_INDEX_FILL = "rgb(231 229 228)"
// const SELECTION_STROKE_WIDTH = 2
// const SELECTION_FILL = "rgba(147, 197, 253, 0.3)"
// const UPSCALE = 1
// const BOLD_FONT = "normal 600 12px 'Plus Jakarta Sans',Arial,sans-serif"
// const NORMAL_FONT = "normal normal 12px 'Plus Jakarta Sans',Arial,sans-serif"
// const LINE_THICKNESS = 1
// const NO_SELECTION: IDim = [-1, -1]
// const DEFAULT_CELL_SIZE: IDim = [100, 25]

// // need global timer vars https://stackoverflow.com/questions/71456174/repeat-the-function-with-onmousedown-in-react
// let vScrollInterval: any
// let hScrollInterval: any

// type ICtx = CanvasRenderingContext2D | null | undefined

// function setupCanvas(canvas: HTMLCanvasElement, scale: number = 1) {
//   // Get the device pixel ratio, falling back to 1.
//   let dpr = window.devicePixelRatio || 1 //* UPSCALE //Math.max(1, window.devicePixelRatio || 1)

//   //console.log('wdpr', window.devicePixelRatio, dpr)

//   // Get the size of the canvas in CSS pixels.
//   const rect = canvas.getBoundingClientRect()

//   // Give the canvas pixel dimensions of their CSS
//   // size * the device pixel ratio.
//   canvas.width = rect.width * dpr // * UPSCALE
//   canvas.height = rect.height * dpr // * UPSCALE

//   //canvas.style.transformOrigin = "0 0"
//   //canvas.style.transform = `scale(${scale})`

//   //canvas.style.width = rect.width + 'px';
//   //canvas.style.height = rect.height + 'px';

//   const ctx = canvas.getContext("2d")
//   // Scale all drawing operations by the dpr, so you
//   // don't have to worry about the difference.

//   if (ctx) {
//     //dpr *= scale
//     ctx.scale(dpr, dpr)
//   }

//   return ctx
// }

// //<div className="overflow-scroll absolute top-0 left-0 right-0 bottom-0">

// interface IProps extends IElementProps {
//   df: BaseDataFrame
//   cellSize?: IDim
//   dp?: number
//   scale?: number
//   editable?: boolean
// }

// export function GlideUI({
//   df,
//   cellSize = DEFAULT_CELL_SIZE,
//   dp = 3,
//   scale = 1,
//   editable = false,
// }: IProps) {
//   // determines which cell is selected. Setting one dimension to -1
//   // allows either a row or col to be highlighed

//   const [editText, setEditText] = useState("")

//   const columns: GridColumn[] = useMemo(
//     () => df.columns.map(c => ({ title: c, width: 100 })),
//     [df],
//   )

//   const getData = useCallback(
//     ([col, row]: Item): GridCell => {
//       const v = df.get(row, col).toLocaleString()

//       const t = typeof v

//       return {
//         kind: GridCellKind.Text,
//         data: v,
//         allowOverlay: false,
//         displayData: v,
//       }
//     },
//     [df],
//   )

//   return (
//     <BaseCol>
//       <DataEditor
//         getCellContent={getData}
//         columns={columns}
//         rows={df.shape[0]}
//       />
//     </BaseCol>
//   )
// }

// export const LazyGlideUI = lazy(() => import('./glide-ui'))
