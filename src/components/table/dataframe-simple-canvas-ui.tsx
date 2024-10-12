import { BaseCol } from '@components/base-col'
import { Input } from '@components/shadcn/ui/themed/input'
import { VCenterRow } from '@components/v-center-row'
import { useMouseUpListener } from '@hooks/use-mouseup-listener'
import { useResizeObserver } from '@hooks/use-resize-observer'

import { EDGE_SCROLL_ZONE, useScrollOnEdges } from '@hooks/use-scroll-on-edges'
import { type ICell } from '@interfaces/cell'
import { type IElementProps } from '@interfaces/element-props'
import { setupCanvas } from '@lib/canvas'
import { cn } from '@lib/class-names'
import { findClosest } from '@lib/closest-search'
import { NO_SHAPE, type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { cellStr, getExcelColName } from '@lib/dataframe/cell'
import { FOCUS_RING_CLS } from '@theme'

import type { Shape } from '@lib/dataframe/dataframe-types'
import { range } from '@lib/math/range'
import type { ChangeEvent, ForwardedRef, WheelEvent } from 'react'
import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type UIEvent,
} from 'react'
import {
  NO_SELECTION,
  NO_SELECTION_RANGE,
  SelectionRangeContext,
  type ISelectionRange,
} from './use-selection-range'

// function setDPI(canvas: HTMLCanvasElement, dpi: number) {
//   // Set up CSS size.
//   canvas.style.width = canvas.style.width || canvas.width + "px"
//   canvas.style.height = canvas.style.height || canvas.height + "px"

//   // Resize canvas and scale future draws.
//   let scaleFactor = dpi / 96
//   canvas.width = Math.ceil(canvas.width * scaleFactor)
//   canvas.height = Math.ceil(canvas.height * scaleFactor)
//   let ctx = canvas.getContext("2d")
//   ctx.scale(scaleFactor, scaleFactor)
// }

const GAP = 4
const GAP2 = GAP * 2
const GRID_COLOR = 'rgb(203 213 225)'
const INDEX_BG_COLOR = 'rgb(241 245 249)'
const SELECTION_STROKE_COLOR = 'rgb(59, 130, 246)'
//const SELECTED_INDEX_FILL = "rgb(231 229 228)"
const SELECTION_STROKE_WIDTH = 2
const SELECTION_FILL = 'rgba(147, 197, 253, 0.3)'
const BOLD_FONT = "normal 600 12px 'Plus Jakarta Sans',Arial,sans-serif"
const NORMAL_FONT = "normal normal 12px 'Plus Jakarta Sans',Arial,sans-serif"
const LINE_THICKNESS = 1

const DEFAULT_CELL_SIZE: Shape = [100, 25]
const COL_DRAG_SIZE = 5

// limit size of scrollbars in pixels because browsers have limits on the max div size of an element,
// so we use a scaling factor when the virtual canvas gets too big, e.g. if virtual is twice the size of
// the max then we virtually scroll 2 pixels for every 1 screen pixel scrolled
const MAX_H = 16384

interface IScrollDirection {
  x: number
  dx: number
  y: number
  dy: number
}

const DEFAULT_SCROLL_DIRECTION: IScrollDirection = {
  x: 0,
  dx: 0,
  y: 0,
  dy: 0,
}

// need global timer vars https://stackoverflow.com/questions/71456174/repeat-the-function-with-onmousedown-in-react
//let vScrollInterval: any
//let hScrollInterval: any

type ICtx = CanvasRenderingContext2D | null | undefined

interface IDFProps {
  dim: Shape
  scaledDim: Shape
  maxScaledDim: Shape
  scaledCellSize: Shape
  rowIndexW: number
  scaledRowIndexW: number
  //scrollFactor: IDim
}

interface IDragCol {
  col: number
  cols: number[]
}

const NO_DRAG: IDragCol = { col: -1, cols: [] }

interface IProps extends IElementProps {
  df: BaseDataFrame
  cellSize?: Shape
  dp?: number
  scale?: number
  editable?: boolean
}

export const DataFrameSimpleCanvasUI = forwardRef(
  function DataFrameSimpleCanvasUI(
    {
      df,
      cellSize = DEFAULT_CELL_SIZE,
      dp = 3,
      scale = 1,
      editable = false,
      className,
    }: IProps,
    outerRef: ForwardedRef<HTMLDivElement>
  ) {
    // determines which cell is selected. Setting one dimension to -1
    // allows either a row or col to be highlighed

    const [editText, setEditText] = useState('')
    const [selText, setSelectedCellRefText] = useState('')

    const [editCell, setEditCell] = useState<ICell>(NO_SELECTION)

    const colPositions = useRef<number[]>([])

    //const [hoverCol, setHoverCol] = useState(-1)
    const hoverCol = useRef(-1)
    const dragCol = useRef<IDragCol>(NO_DRAG)

    const [, selectionRangeDispatch] = useContext(SelectionRangeContext)

    // defines the start and end row/cols for drawing a multi-cell
    // selection
    const selection = useRef<ISelectionRange>(NO_SELECTION_RANGE)

    // determine where to focus the image when dragging the mouse
    // around. This is independent of the selection so the focus
    // can change even when the selected cell does not
    const [focusCell, setFocusCell] = useState<ICell>(NO_SELECTION)

    const isMouseDown = useRef('')
    //const mouseDown = useRef([-1, -1])

    const ref = useRef<HTMLDivElement>(null)
    useImperativeHandle(outerRef, () => ref.current!, [])

    const scrollRef = useRef<HTMLDivElement | null>(null)
    const selectionRef = useRef<HTMLDivElement | null>(null)
    const selectionCellRef = useRef<HTMLDivElement | null>(null)
    const editRef = useRef<HTMLInputElement | null>(null)
    //const { scrollTargetRef } = useScrollDirection<HTMLDivElement>(onScroll)

    const lastScroll = useRef<IScrollDirection>(DEFAULT_SCROLL_DIRECTION)

    //const scrollDirection = useRef<IScrollDirection>(DEFAULT_SCROLL_DIRECTION)

    const bgCanvasRef = useRef<HTMLCanvasElement | null>(null)
    //const gridCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const tableCanvasRef = useRef<HTMLCanvasElement | null>(null)
    //const selectionCanvasRef = useRef<HTMLCanvasElement | null>(null)

    //const frameID = useRef<number | undefined>(undefined)

    //const scrollPos = useRef([-1, -1])

    //if (df.data.length === 0) {
    //  df = TEST_DATAFRAME //INF_DATAFRAME //TEST_DATAFRAME // TEST_DATAFRAME
    //}

    const scrollOnEdgesMouseDown = useScrollOnEdges(scrollRef, { onMouseUp })

    const [dfProps, setDFProps] = useState<IDFProps>({
      dim: NO_SHAPE,
      scaledDim: NO_SHAPE,
      maxScaledDim: NO_SHAPE,
      scaledCellSize: NO_SHAPE,
      //scrollFactor: [1, 1],
      rowIndexW: 0,
      scaledRowIndexW: 0,
    })

    useEffect(() => {
      colPositions.current = range(0, df.shape[1] + 1).map(i => i * cellSize[0])
    }, [df, cellSize])

    useEffect(() => {
      if (editCell.r !== -1) {
        if (editRef.current) {
          editRef.current.focus()
        }
      }
    }, [editCell])

    useEffect(() => {
      const shape = df.shape
      const dim: Shape = [shape[1] * cellSize[0], shape[0] * cellSize[1]]
      //const hasRowIndex = df.rowIndex.length > 0

      const rowIndexW = df.getRowName(0) !== '1' ? cellSize[0] : cellSize[1]

      const scaledDim: Shape = [dim[0] * scale, dim[1] * scale]
      const maxScaledDim: Shape = [
        Math.min(MAX_H, scaledDim[0]),
        Math.min(MAX_H, scaledDim[1]),
      ]

      // const scrollFactor: IDim = [
      //   scaledDim[0] / maxScaledDim[0],
      //   scaledDim[1] / maxScaledDim[1],
      // ]

      //console.log(scrollFactor, scaledDim, maxScaledDim)

      setDFProps({
        dim,
        scaledDim,
        maxScaledDim,
        scaledCellSize: [cellSize[0] * scale, cellSize[1] * scale],
        rowIndexW,
        scaledRowIndexW: rowIndexW * scale,
        //scrollFactor,
      })
    }, [df, scale, cellSize])

    useEffect(() => {
      selection.current = { start: NO_SELECTION, end: NO_SELECTION }
      resizeTable()
    }, [dfProps])

    useEffect(() => {
      const d = scrollRef.current

      if (!d) {
        return
      }

      if (focusCell === NO_SELECTION) {
        return
      }

      //console.log('focus', shape.scaledCellSize)

      const x1 = focusCell.c * dfProps.scaledCellSize[0]
      const x2 = x1 + dfProps.scaledCellSize[0]
      const y1 = focusCell.r * dfProps.scaledCellSize[1]
      const y2 = y1 + dfProps.scaledCellSize[1]

      if (x1 < d.scrollLeft) {
        d.scrollLeft = x1
      }

      if (x2 > d.clientWidth + d.scrollLeft) {
        d.scrollLeft = x2 - d.clientWidth
      }

      if (y1 < d.scrollTop) {
        d.scrollTop = y1
      }

      if (y2 > d.clientHeight + d.scrollTop) {
        d.scrollTop = y2 - d.clientHeight
      }
    }, [focusCell, dfProps.scaledCellSize])

    const resizeCallBack = useCallback(() => {
      resizeTable()
    }, [dfProps])

    useResizeObserver<HTMLDivElement>(scrollRef, resizeCallBack)

    useMouseUpListener(onMouseUp)

    /**
     * Draw the index (left column) background.
     *
     * @param ctx
     * @param normTop
     * @param h
     * @returns
     */
    function drawIndexBg(ctx: ICtx, normTop: number, h: number) {
      if (!ctx) {
        return
      }

      ctx.fillStyle = INDEX_BG_COLOR
      ctx.fillRect(0, cellSize[1], dfProps.rowIndexW, h)

      ctx.save()

      ctx.imageSmoothingEnabled = false
      ctx.translate(0.5, 0)

      //ctx.translate(0, cellSize[1])

      //const region = new Path2D()

      ctx.strokeStyle = GRID_COLOR
      ctx.lineWidth = LINE_THICKNESS
      ctx.beginPath()
      ctx.moveTo(dfProps.rowIndexW - 1, 0)
      ctx.lineTo(dfProps.rowIndexW - 1, h)
      ctx.stroke()

      ctx.restore()

      // ctx.strokeStyle = GRID_COLOR
      // ctx.lineWidth = LINE_THICKNESS
      // ctx.beginPath()
      // ctx.moveTo(0, 0)
      // ctx.lineTo(0, h)
      // ctx.moveTo(0, h)
      // ctx.lineTo(cellSize[0], h)
      // ctx.stroke()
    }

    function drawIndex(ctx: ICtx, normTop: number, h: number, rowRange: Shape) {
      if (!ctx) {
        return
      }

      ctx.save()

      ctx.translate(0, cellSize[1])

      const region = new Path2D()
      region.rect(0, 0, dfProps.rowIndexW, h)
      ctx.clip(region)

      ctx.clearRect(0, 0, dfProps.rowIndexW, h)

      // selection

      if (selection.current.start.r !== -1) {
        ctx.strokeStyle = SELECTION_STROKE_COLOR
        ctx.lineWidth = LINE_THICKNESS

        let y1 = selection.current.start.r * cellSize[1]
        const y2 = selection.current.end.r * cellSize[1]
        const h = Math.abs(y2 - y1) + cellSize[1]

        y1 = Math.min(y1, y2)

        ctx.fillStyle = SELECTION_FILL
        ctx.fillRect(0, y1 - normTop, dfProps.rowIndexW, h + scale)
      }

      ctx.fillStyle = 'black'
      ctx.font = BOLD_FONT

      // row index

      ctx.textAlign = df.getRowName(0) !== '1' ? 'left' : 'center'

      const x = df.getRowName(0) !== '1' ? GAP : 0.5 * dfProps.rowIndexW

      let py = (rowRange[0] + 1) * cellSize[1] - normTop

      if (rowRange[0] !== -1) {
        range(rowRange[0], rowRange[1]).forEach(row => {
          const v = df.getRowName(row)

          //const py = cellSize[1] + row * cellSize[1] - normTop

          ctx.fillText(v.toLocaleString(), x, py - GAP2)

          py += cellSize[1]
        })
      }

      // render the lines

      // ctx.save()

      // ctx.imageSmoothingEnabled = false
      // ctx.translate(0.5, 0.5)

      // py = 0
      // ctx.strokeStyle = GRID_COLOR
      // ctx.lineWidth = LINE_THICKNESS

      // if (rowRange[0] !== -1) {
      //   py = (rowRange[0] + 1) * cellSize[1] - normTop

      //   ctx.strokeStyle = GRID_COLOR
      //   ctx.lineWidth = LINE_THICKNESS

      //   ctx.beginPath()
      //   range(rowRange[0] + 1, rowRange[1] + 1).forEach(() => {
      //     ctx.moveTo(GAP, py)
      //     ctx.lineTo(dfProps.rowIndexW - GAP, py)

      //     py += cellSize[1]
      //   })

      //   ctx.stroke()
      // }

      // ctx.restore()

      ctx.restore()

      //ctx.translate(0, -cellSize[1])
    }

    function drawHeaderBg(ctx: ICtx, normLeft: number, w: number) {
      if (!ctx) {
        return
      }

      ctx.fillStyle = INDEX_BG_COLOR
      ctx.fillRect(0, 0, w, cellSize[1])

      // draw line

      ctx.save()

      ctx.imageSmoothingEnabled = false
      ctx.translate(0, 0.5)

      ctx.strokeStyle = GRID_COLOR
      ctx.lineWidth = LINE_THICKNESS
      ctx.beginPath()
      ctx.moveTo(0, cellSize[1] - 1)
      ctx.lineTo(w, cellSize[1] - 1)
      ctx.stroke()

      ctx.restore()
    }

    function drawHeader(
      ctx: ICtx,
      normLeft: number,
      w: number,
      colRange: Shape
    ) {
      if (!ctx) {
        return
      }

      ctx.clearRect(0, 0, w, cellSize[1])

      ctx.save()

      ctx.translate(dfProps.rowIndexW, 0)

      const region = new Path2D()
      region.rect(0, 0, w - dfProps.rowIndexW, cellSize[1])
      ctx.clip(region)

      // selection

      if (selection.current.start.c !== -1 && selection.current.end.c !== -1) {
        ctx.strokeStyle = SELECTION_STROKE_COLOR
        ctx.lineWidth = LINE_THICKNESS

        let x1 = colPositions.current[selection.current.start.c] // * colPositions //cellSize[0]

        const x2 = colPositions.current[selection.current.end.c + 1] // * cellSize[0]
        const w = Math.abs(x2 - x1) // + cellSize[0]

        x1 = Math.min(x1, x2)

        ctx.fillStyle = SELECTION_FILL
        ctx.fillRect(x1 - normLeft, 0, w, cellSize[1])
      }

      // col index

      ctx.font = BOLD_FONT
      ctx.fillStyle = 'black'
      ctx.textAlign = 'center'

      let px: number = 0
      let px2: number

      if (colRange[0] !== -1) {
        range(colRange[0], colRange[1] + 1).forEach(col => {
          const v = df.shape[1] > 0 ? df.getColName(col) : getExcelColName(col)

          px = colPositions.current[col] - normLeft
          px2 = colPositions.current[col + 1] - normLeft

          ctx.save()

          const w = px2 - px

          const region = new Path2D()
          region.rect(px + GAP, 0, w - GAP2, cellSize[1])
          ctx.clip(region)

          ctx.fillText(v.toLocaleString(), px + 0.5 * w, cellSize[1] - GAP2)

          ctx.restore()
        })

        // draw lines between cols

        // ctx.save()
        // ctx.imageSmoothingEnabled = false
        // ctx.translate(0.5, 0.5)

        // const cs = Math.max(1, colRange[0])

        // ctx.strokeStyle = GRID_COLOR
        // ctx.lineWidth = LINE_THICKNESS
        // ctx.beginPath()
        // range(cs, colRange[1] + 2).forEach(col => {
        //   px = colPositions.current[col] - normLeft
        //   ctx.moveTo(px, GAP)
        //   ctx.lineTo(px, cellSize[1] - GAP)
        // })
        // ctx.stroke()
        // ctx.restore()
      }

      ctx.restore()

      //ctx.translate(-dfProps.rowIndexW, 0)
    }

    function drawTableGrid(
      ctx: ICtx,
      w: number,
      h: number,
      left: number,
      top: number,
      rowRange: Shape,
      colRange: Shape
    ) {
      // const ctx = canvas.getContext("2d", { alpha: false })

      if (!ctx) {
        return
      }

      ctx.save()

      ctx.imageSmoothingEnabled = false
      ctx.translate(0.5, 0.5)

      // ctx.save()

      // const region = new Path2D()
      // region.rect(0, 0, w, h)
      // ctx.clip(region)
      //ctx.clearRect(0, 0, w, h)

      ctx.strokeStyle = GRID_COLOR
      ctx.lineWidth = LINE_THICKNESS

      // vertical lines

      ctx.beginPath()
      const y2 = Math.min(dfProps.dim[1] - top, h)
      range(colRange[0] + 1, colRange[1] + 1).forEach(x => {
        const px = colPositions.current[x] - left
        ctx.moveTo(px, 0)
        ctx.lineTo(px, y2)
      })
      ctx.stroke()

      ctx.beginPath()

      const x2 = Math.min(colPositions.current[colRange[1]] - left, w)

      let py = (rowRange[0] + 1) * cellSize[1] - top

      range(rowRange[0], rowRange[1]).forEach(() => {
        //const py = (y + 1) * cellSize[1] - top + 0.5

        ctx.moveTo(0, py)
        ctx.lineTo(x2, py)

        py += cellSize[1]
      })

      ctx.stroke()

      ctx.restore()

      // reset transform
      //ctx.translate(-dfProps.rowIndexW, -cellSize[1])
    }

    function drawSelection(
      ctx: ICtx,
      w: number,
      h: number,
      left: number,
      top: number
    ) {
      // const ctx = canvas.getContext("2d", { alpha: false })

      if (!ctx) {
        return
      }

      if (selection.current.start !== NO_SELECTION) {
        let x1 =
          colPositions.current[
            Math.min(selection.current.start.c, selection.current.end.c)
          ] - left

        let x2 =
          colPositions.current[
            Math.max(selection.current.start.c, selection.current.end.c) + 1
          ] - left

        let x3 = colPositions.current[selection.current.start.c] - left
        let x4 = colPositions.current[selection.current.start.c + 1] - left

        let y1 =
          Math.min(selection.current.start.r, selection.current.end.r) *
            cellSize[1] -
          top

        let y2 =
          (Math.max(selection.current.start.r, selection.current.end.r) + 1) *
            cellSize[1] -
          top

        let y3 = selection.current.start.r * cellSize[1] - top
        let y4 = y3 + cellSize[1]

        x1 = Math.max(0, Math.min(w, x1))
        x2 = Math.max(0, Math.min(w, x2))
        x3 = Math.max(0, Math.min(w, x3))
        x4 = Math.max(0, Math.min(w, x4))

        y1 = Math.max(0, Math.min(h, y1))
        y2 = Math.max(0, Math.min(h, y2))
        y3 = Math.max(0, Math.min(h, y3))
        y4 = Math.max(0, Math.min(h, y4))

        let rw = x2 - x1
        let rh = y2 - y1

        if (rw > 0 && rh > 0) {
          ctx.fillStyle = SELECTION_FILL
          ctx.fillRect(x1, y1, rw, rh)
        }

        // draw first cell white
        rw = x4 - x3
        rh = y4 - y3

        if (rw > 0 && rh > 0) {
          ctx.fillStyle = 'white'
          ctx.fillRect(x3, y3, rw, rh)
        }
      }
    }

    function drawSelectionRect(
      ctx: ICtx,
      w: number,
      h: number,
      left: number,
      top: number
    ) {
      // const ctx = canvas.getContext("2d", { alpha: false })

      if (!ctx) {
        return
      }

      if (selection.current.start !== NO_SELECTION) {
        // ctx.translate(dfProps.rowIndexW, cellSize[1])

        // ctx.save()

        // const region = new Path2D()
        // region.rect(0, 0, w, h)
        // ctx.clip(region)

        let x1 =
          colPositions.current[
            Math.min(selection.current.start.c, selection.current.end.c)
          ] - left

        let x2 =
          colPositions.current[
            Math.max(selection.current.start.c, selection.current.end.c) + 1
          ] - left

        let y1 =
          Math.min(selection.current.start.r, selection.current.end.r) *
            cellSize[1] -
          top

        let y2 =
          (Math.max(selection.current.start.r, selection.current.end.r) + 1) *
            cellSize[1] -
          top

        x1 = Math.max(0, Math.min(w, x1))
        x2 = Math.max(0, Math.min(w, x2))

        y1 = Math.max(0, Math.min(h, y1))
        y2 = Math.max(0, Math.min(h, y2))

        const rw = x2 - x1
        const rh = y2 - y1

        if (rw > 0 && rh > 0) {
          ctx.lineWidth = SELECTION_STROKE_WIDTH
          ctx.strokeStyle = SELECTION_STROKE_COLOR
          ctx.strokeRect(
            x1 + 0.5 * SELECTION_STROKE_WIDTH,
            y1 + 0.5 * SELECTION_STROKE_WIDTH,
            rw,
            rh
          )
        }
      }

      // ctx.restore()

      // // reset transform
      // ctx.translate(-dfProps.rowIndexW, -cellSize[1])
    }

    function drawCells(
      ctx: ICtx,
      w: number,
      h: number,
      left: number,
      top: number,
      rowRange: Shape,
      colRange: Shape
    ) {
      if (!ctx) {
        return
      }

      // ctx.translate(dfProps.rowIndexW, cellSize[1])

      // ctx.save()

      // const region = new Path2D()
      // region.rect(0, 0, w, h)
      // ctx.clip(region)

      // ctx.clearRect(0, 0, w, h)

      //drawTableGrid(ctx, w, h, left, top, rowRange, colRange)
      //ctx.clearRect(0, 0, w, h)

      ctx.font = NORMAL_FONT
      ctx.fillStyle = 'black'

      if (colRange[0] !== -1) {
        range(colRange[0], colRange[1] + 1).forEach(col => {
          const px1 = colPositions.current[col] - left
          const px2 = colPositions.current[col + 1] - left
          const w = px2 - px1
          ctx.save()

          const region = new Path2D()
          region.rect(px1, GAP, w - GAP, h)
          ctx.clip(region)

          if (rowRange[0] !== -1) {
            range(rowRange[0], rowRange[1]).forEach(row => {
              let v = df.get(row, col)

              //console.log('here', row, col, v, typeof v)

              const isNum = typeof v === 'number'

              if (isNum) {
                if (Number.isInteger(v)) {
                  v = (v as number).toLocaleString()
                } else {
                  v = (v as number).toFixed(dp)
                }
              }

              //console.log(v, row, col, typeof v, isNum)

              ctx.textAlign = isNum ? 'right' : 'left'

              const py = (row + 1) * cellSize[1] - top

              ctx.fillText(
                cellStr(v),
                px1 + GAP + (isNum ? w - GAP2 : 0),
                py - GAP2
              )
            })
          }

          ctx.restore()
        })
      }

      //ctx.restore()

      // reset transform
      //ctx.translate(-dfProps.rowIndexW, -cellSize[1])
    }

    /**
     * Only update one cell location and leave the rest of the
     * canvas cached.
     *
     * @param left
     * @param top
     * @param row
     * @param col
     * @returns
     */
    function drawCell(
      ctx: ICtx,
      left: number,
      top: number,
      row: number,
      col: number
    ) {
      if (!ctx) {
        return
      }

      ctx.save()
      ctx.translate(dfProps.rowIndexW, cellSize[1])

      const px1 = colPositions.current[col] - left
      const px2 = colPositions.current[col + 1] - left
      const w = px2 - px1

      const y = row * cellSize[1] - top

      ctx.fillStyle = 'white'
      ctx.fillRect(px1 + 2, y + 2, w - 4, cellSize[1] - 4)

      ctx.font = NORMAL_FONT
      ctx.fillStyle = 'black'

      let v = df.get(row, col)
      const isNum = typeof v === 'number'

      if (isNum) {
        v = (v as number).toFixed(dp)
      }

      ctx.textAlign = isNum ? 'right' : 'left'

      ctx.fillText(
        cellStr(v),
        px1 + GAP + (isNum ? w - GAP2 : 0),
        y + cellSize[1] - GAP2
      )

      ctx.restore()
      //ctx.translate(-dfProps.rowIndexW, -cellSize[1])
    }

    function getSize(d: HTMLElement) {
      //const r = d.getBoundingClientRect()
      //const w = r.width + dfProps.scaledRowIndexW
      //const h = r.height + dfProps.scaledCellSize[1]

      const w = d.clientWidth + dfProps.scaledRowIndexW
      const h = d.clientHeight + dfProps.scaledCellSize[1]

      return [w, h]
    }

    function getScrollProps(d: IScrollDirection) {
      //const scrollFactor = dfProps.scrollFactor

      const l = d.x
      const t = d.y

      const normLeft = l / scale
      const normTop = t / scale

      return [l, t, normLeft, normTop]
    }

    /**
     * Determine which rows are in view.
     *
     * @param top
     * @param h
     * @returns
     */
    function getRowRange(top: number, h: number): Shape {
      const rowStart = Math.min(
        df.shape[0] - 1,
        Math.max(0, Math.floor(top / dfProps.scaledCellSize[1]))
      )

      const rowEnd = Math.max(
        0,
        Math.min(
          df.shape[0],
          Math.floor((top + h) / dfProps.scaledCellSize[1]) + 1
        )
      )

      return [rowStart, rowEnd]
    }

    function getColRange(left: number, w: number): Shape {
      //const n = df.shape[1] - 1

      const colStart = Math.max(
        0,
        Math.min(
          df.shape[1] - 1,
          Math.max(
            0,
            findClosest(colPositions.current, left / scale, true).index
          )
        )
      )

      const colEnd = Math.max(
        0,
        Math.min(
          df.shape[1],
          findClosest(colPositions.current, (left + w) / scale, true).index + 1
        )
      )

      return [colStart, colEnd]
    }

    function select(p: ICell) {
      //setEditCell(NO_SELECTION)
      resizeSelection({ start: p, end: p })
      //setFocusCell(p)
    }

    function selectAndFocus(p: ICell) {
      select(p)
      setFocusCell(p)
    }

    function draw() {
      const d = scrollRef.current

      if (!d) {
        return
      }

      if (!tableCanvasRef.current) {
        return
      }

      const ctx = tableCanvasRef.current.getContext('2d')

      if (!ctx) {
        return
      }

      const [w, h] = getSize(d)
      const [l, t, normLeft, normTop] = getScrollProps(lastScroll.current)

      //console.log("draw", l, t, normLeft, normTop, dfProps.maxScaledDim)

      // const hScrollDir = l - scrollPos.current[0]
      // const vSCrollDir = t - scrollPos.current[1]
      // scrollPos.current = [l, t]

      const rowRange = getRowRange(t, h)
      const colRange = getColRange(l, w)

      //console.log(lastScroll.current, l, t, normLeft, normTop, colRange)

      //const selCtx = selectionCanvasRef.current?.getContext("2d")
      //const intCtx = gridCanvasRef.current?.getContext("2d")

      //if (scrollDirection.dx !== 0) {

      drawHeader(ctx, normLeft, w, colRange)
      //}

      //if (scrollDirection.dy !== 0) {

      drawIndex(ctx, normTop, h, rowRange)
      // }

      ctx.save()

      ctx.translate(dfProps.rowIndexW, cellSize[1])

      const region = new Path2D()
      region.rect(0, 0, w, h)
      ctx.clip(region)

      ctx.clearRect(0, 0, w, h)

      drawSelection(ctx, w, h, normLeft, normTop)
      drawTableGrid(ctx, w, h, normLeft, normTop, rowRange, colRange)
      drawCells(ctx, w, h, normLeft, normTop, rowRange, colRange)
      drawSelectionRect(ctx, w, h, normLeft, normTop)

      ctx.restore()

      // reset transform
      //ctx.translate(-dfProps.rowIndexW, -cellSize[1])
    }

    function onScroll(e: UIEvent<HTMLDivElement>) {
      let scrollTop: number = 0
      const scrollHeight = e.currentTarget.scrollHeight
      const clientHeight = e.currentTarget.clientHeight

      // scroll events occur when the div height exceeds the client height
      // in which case we convert the the scroll position into a normalized
      // value and then calculate the scroll position in the virtual canvas
      // thus we can have a virtual canvas much larger than what the
      // browser actually supports (they seem to have issues beyond 16000px).
      if (scrollHeight > clientHeight) {
        const fracScrollTop =
          e.currentTarget.scrollTop / (scrollHeight - clientHeight)
        scrollTop = fracScrollTop * (dfProps.scaledDim[1] - clientHeight)
      }

      let scrollLeft: number = 0
      const scrollWidth = e.currentTarget.scrollWidth
      const clientWidth = e.currentTarget.clientWidth

      if (scrollWidth > clientWidth) {
        const fracScrollLeft =
          e.currentTarget.scrollLeft / (scrollWidth - clientWidth)
        scrollLeft = fracScrollLeft * (dfProps.scaledDim[0] - clientWidth)
      }

      lastScroll.current = {
        x: scrollLeft,
        dx: scrollLeft - lastScroll.current.x,
        y: scrollTop,
        dy: scrollTop - lastScroll.current.y,
      }

      if (
        isMouseDown.current &&
        (lastScroll.current.dx !== 0 || lastScroll.current.dy !== 0)
      ) {
        let x = 0 //lastScroll.current.x

        if (lastScroll.current.dx > 0) {
          x += e.currentTarget.clientWidth + cellSize[0]
        } else if (lastScroll.current.dx < 0) {
          x -= cellSize[0]
        } else {
          x =
            colPositions.current[selection.current.end.c] - lastScroll.current.x
        }

        let y = 0 //lastScroll.current.y

        if (lastScroll.current.dy > 0) {
          y += e.currentTarget.clientHeight + cellSize[1]
        } else if (lastScroll.current.dy < 0) {
          y -= cellSize[1]
        } else {
          y =
            colPositions.current[selection.current.end.r] - lastScroll.current.y
        }

        const p = getRowColFromMouse(
          x + lastScroll.current.x,
          y + lastScroll.current.y
        )

        if (
          p !== NO_SELECTION &&
          (p.r !== selection.current.end.r || p.c !== selection.current.end.c)
        ) {
          resizeSelection({ ...selection.current, end: p })
          return
          //setFocusCell(p)

          //draw()
        }
      }

      window.requestAnimationFrame(() => {
        draw()
      })
    } //, [scrollDirection, isMouseDown])

    function onIndexMouseMove(e: MouseEvent) {
      if (isMouseDown.current !== 'index') {
        return
      }

      //console.log(e.target, e.target === ref.current)

      // const d = scrollRef.current

      // if (!d) {
      //   return
      // }

      const p = getRowColFromMouse(
        0,
        e.nativeEvent.offsetY - dfProps.scaledCellSize[1]
      )

      resizeSelection({
        ...selection.current,
        end: { r: p.r, c: df.shape[1] - 1 },
      })
    }

    function onHeaderMouseMove(e: MouseEvent) {
      // if within table area, send scroll events elsewhere
      if (e.target === scrollRef.current) {
        onMouseMove(e)
        return
      }

      const x = e.nativeEvent.offsetX

      if (x < dfProps.scaledRowIndexW) {
        onIndexMouseMove(e)
        return
      }

      const colX = x - dfProps.scaledRowIndexW

      if (isMouseDown.current === 'header') {
        // if the mouse is pressed, see if we are dragging
        // a columns

        //console.log(e.target, e.target === ref.current)

        // const d = scrollRef.current

        // if (!d) {
        //   return
        // }

        // can resize col, but must be at least 2 pixels wide so partially visible.
        const minDragX =
          dragCol.current.cols[dragCol.current.col - 1] -
          dragCol.current.cols[dragCol.current.col] +
          2

        if (dragCol.current.col !== -1) {
          window.requestAnimationFrame(() => {
            const dragX = colX - dragCol.current.cols[dragCol.current.col]

            colPositions.current = [
              ...dragCol.current.cols.slice(0, dragCol.current.col),
              ...dragCol.current.cols
                .slice(dragCol.current.col)
                .map(cp => cp + Math.max(minDragX, dragX)),
            ]

            draw()
          })
        } else {
          // if not dragging a column to resize, see if we are selecting
          const p = getRowColFromMouse(
            x - dfProps.scaledRowIndexW + lastScroll.current.x,
            0
          )
          resizeSelection({
            ...selection.current,
            end: { r: df.shape[0] - 1, c: p.c },
          })
        }
      } else {
        const col = findClosest(colPositions.current, colX)
        const isColDrag =
          col.index > 0 && Math.abs(col.value - colX) < COL_DRAG_SIZE

        if (isColDrag) {
          //setHoverCol(col.index)
          hoverCol.current = col.index
        } else {
          //setHoverCol(-1)
          hoverCol.current = -1
        }

        if (ref.current) {
          if (hoverCol.current !== -1) {
            ref.current.classList.add('cursor-ew-resize')
          } else {
            ref.current.classList.remove('cursor-ew-resize')
          }
        }
      }
    }

    function onIndexMouseDown(e: MouseEvent) {
      const y = e.nativeEvent.offsetY

      if (y < dfProps.scaledCellSize[1]) {
        return
      }

      //mouseDown.current = [x, y]
      isMouseDown.current = 'index'

      const p = getRowColFromMouse(
        0,
        y - dfProps.scaledCellSize[1] + lastScroll.current.y
      )

      resizeSelection({
        start: { r: p.r, c: 0 },
        end: { r: p.r, c: df.shape[1] - 1 },
      })

      scrollOnEdgesMouseDown()
    }

    function onHeaderMouseDown(e: MouseEvent) {
      setEditCell(NO_SELECTION)

      if (e.target === scrollRef.current) {
        onMouseDown(e)
        return
      }

      const x = e.nativeEvent.offsetX

      if (x < dfProps.scaledRowIndexW) {
        onIndexMouseDown(e)
        return
      }

      // const d = scrollRef.current

      // if (!d) {
      //   return
      // }

      const y = e.nativeEvent.offsetY

      //mouseDown.current = [x, y]
      isMouseDown.current = 'header'

      if (hoverCol.current !== -1) {
        // if we click mouse, clone position of columns so we can
        // change them each frame and go back to original if necessary

        dragCol.current = {
          col: hoverCol.current,
          cols: colPositions.current.slice(),
        }
      } else {
        if (y < dfProps.scaledCellSize[0]) {
          const p = getRowColFromMouse(
            x - dfProps.scaledRowIndexW + lastScroll.current.x,
            0
          )

          //setSelectedCell([-1, p.col])
          resizeSelection({
            start: { r: 0, c: p.c },
            end: { r: df.shape[0] - 1, c: p.c },
          })
        }
      }

      scrollOnEdgesMouseDown()
    }

    function resizeSelection(s: ISelectionRange) {
      selection.current = s

      selectionRangeDispatch({ type: 'set', range: s })

      if (s.start !== NO_SELECTION) {
        setEditText(
          cellStr(df.get(selection.current.start.r, selection.current.start.c))
        )

        setSelectedCellRefText(
          `${
            Math.abs(selection.current.end.r - selection.current.start.r) + 1
          }R x ${
            Math.abs(selection.current.end.c - selection.current.start.c) + 1
          }C`
        )
      } else {
        setEditText('')
        setSelectedCellRefText('')
      }

      // modify selection rect to match selection or hide it
      if (selectionRef.current) {
        if (
          selection.current.start !== NO_SELECTION &&
          selection.current.start !== selection.current.end
        ) {
          selectionRef.current.style.visibility = 'visible'
          selectionRef.current.style.left = `${
            Math.min(selection.current.start.c, selection.current.end.c) *
            dfProps.scaledCellSize[0]
          }px`

          selectionRef.current.style.top = `${
            Math.min(selection.current.start.r, selection.current.end.r) *
            dfProps.scaledCellSize[1]
          }px`

          selectionRef.current.style.width = `${
            Math.abs(selection.current.end.c - selection.current.start.c) *
              dfProps.scaledCellSize[0] +
            dfProps.scaledCellSize[0] +
            scale
          }px`

          selectionRef.current.style.height = `${
            Math.abs(selection.current.end.r - selection.current.start.r) *
              dfProps.scaledCellSize[1] +
            dfProps.scaledCellSize[1] +
            scale
          }px`
        } else {
          selectionRef.current.style.visibility = 'hidden'
        }
      }

      // modify selection rect around cell if we just click
      // on a cell, or hide it if there is no selection or
      // a multi-selection
      if (selectionCellRef.current) {
        if (
          selection.current.start !== NO_SELECTION &&
          selection.current.start === selection.current.end
        ) {
          selectionCellRef.current.style.visibility = 'visible'

          selectionCellRef.current.style.left = `${
            selection.current.start.c * dfProps.scaledCellSize[0]
          }px`
          selectionCellRef.current.style.top = `${
            selection.current.start.r * dfProps.scaledCellSize[1]
          }px`
          selectionCellRef.current.style.width = `${dfProps.scaledCellSize[0]}px`
          selectionCellRef.current.style.height = `${dfProps.scaledCellSize[1]}px`
        } else {
          selectionCellRef.current.style.visibility = 'hidden'
        }
      }

      window.requestAnimationFrame(() => {
        draw()
      })
    }

    function getRowColFromMouse(x: number, y: number): ICell {
      const row = Math.max(
        0,
        Math.min(df.shape[0] - 1, Math.floor(y / dfProps.scaledCellSize[1]))
      )

      const col = Math.max(
        0,
        Math.min(
          df.shape[1] - 1,
          findClosest(colPositions.current, x / scale, true).index
        )
      )

      //console.log(row, col)

      return { r: row, c: col }
    }

    function onMouseDown(e: MouseEvent) {
      const d = scrollRef.current

      if (!d) {
        return
      }

      //scrollPos.current= [d.scrollLeft, d.scrollTop]

      const target = e.target as HTMLDivElement

      const x = e.nativeEvent.offsetX
      const y = e.nativeEvent.offsetY

      const cell = getRowColFromMouse(
        x + lastScroll.current.x,
        y + lastScroll.current.y
      )

      if (cell.r !== -1 && cell.c !== -1) {
        select(cell)
      }

      // select only if inside scrollbars
      if (
        x >= target.clientWidth - EDGE_SCROLL_ZONE ||
        y >= target.clientHeight - EDGE_SCROLL_ZONE
      ) {
        return
      }

      isMouseDown.current = 'table'

      scrollOnEdgesMouseDown()

      //e.preventDefault()
      //e.stopPropagation()
    }

    function onMouseUp() {
      //setIsMouseDown(false)
      isMouseDown.current = ''
      //setVScroll(0)
      //setHScroll(0)
      dragCol.current = { col: -1, cols: [] }
    }

    function onHeaderWheel(e: WheelEvent) {
      const d = scrollRef.current

      if (!d) {
        return
      }

      const x = e.nativeEvent.offsetX
      const y = e.nativeEvent.offsetY

      if (x <= dfProps.scaledRowIndexW) {
        if (y > dfProps.scaledCellSize[1]) {
          d.scrollBy(0, e.deltaY)
        }
      } else {
        if (y <= dfProps.scaledCellSize[1]) {
          d.scrollBy(e.deltaY, 0)
        }
      }
    }

    function onMouseMove(e: MouseEvent) {
      hoverCol.current = -1 //setHoverCol(-1)

      // when mouse over main table, change cursor
      // to default
      if (ref.current) {
        if (ref.current.classList.contains('cursor-ew-resize')) {
          ref.current.classList.remove('cursor-ew-resize')
        }
      }

      // console.log(isMouseDown.current)

      if (isMouseDown.current !== 'table') {
        return
      }

      const d = scrollRef.current

      if (!d) {
        return
      }

      const x = e.nativeEvent.offsetX + lastScroll.current.x
      const y = e.nativeEvent.offsetY + lastScroll.current.y
      const p = getRowColFromMouse(x, y)

      if (
        p !== NO_SELECTION &&
        (p.r !== selection.current.end.r || p.c !== selection.current.end.c)
      ) {
        resizeSelection({ ...selection.current, end: p })
        //setFocusCell(p)
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      //console.log(e.code, e.shiftKey)

      const d = scrollRef.current

      if (!d) {
        return
      }

      if (e.ctrlKey) {
        switch (e.code) {
          // ctrl+c copy to clipboard
          case 'KeyC':
            if (
              selection.current.start !== NO_SELECTION &&
              selection.current.end !== NO_SELECTION
            ) {
              const out: string[][] = []

              if (
                selection.current.start.r === 0 &&
                selection.current.end.r === df.shape[0] - 1
              ) {
                // copy headings
                out.push(
                  range(
                    selection.current.start.c,
                    selection.current.end.c + 1
                  ).map(col => df.colNames[col])
                )
              }

              range(selection.current.start.r, selection.current.end.r + 1).map(
                row => {
                  out.push([])
                  range(
                    selection.current.start.c,
                    selection.current.end.c + 1
                  ).map(col => {
                    out[out.length - 1].push(df.get(row, col).toLocaleString())
                  })
                }
              )

              const s = out.map(r => r.join('\t')).join('\n')

              navigator.clipboard.writeText(s)
            }

            break
        }

        return
      }

      switch (e.code) {
        case 'Tab':
          // eslint-disable-next-line no-case-declarations
          const s1: ICell = {
            r: selection.current.start.r,
            c: selection.current.start.c + 1,
          }

          if (s1.c === df.shape[0]) {
            s1.r = Math.min(df.shape[0] - 1, selection.current.start.r + 1)
            s1.c = 0
          }

          selectAndFocus(s1)
          break
        case 'ArrowLeft':
          if (e.shiftKey) {
            const end = {
              r: selection.current.start.r,
              c: Math.max(0, selection.current.end.c - 1),
            }
            resizeSelection({
              start: selection.current.start,
              end,
            })
            setFocusCell(end)
          } else {
            selectAndFocus({
              r: selection.current.start.r,
              c: Math.max(0, selection.current.start.c - 1),
            })
          }
          break
        case 'ArrowRight':
          if (e.shiftKey && e.ctrlKey) {
            const end = { r: selection.current.start.r, c: df.shape[1] - 1 }
            resizeSelection({
              start: selection.current.start,
              end,
            })

            setFocusCell(end)
          } else if (e.shiftKey) {
            const end = {
              r: selection.current.start.r,
              c: Math.min(df.shape[1] - 1, selection.current.end.c + 1),
            }
            resizeSelection({
              start: selection.current.start,
              end,
            })

            setFocusCell(end)
          } else {
            selectAndFocus({
              r: selection.current.start.r,
              c: Math.min(df.shape[1] - 1, selection.current.start.c + 1),
            })
          }
          break
        case 'ArrowUp':
          if (e.shiftKey) {
            const end = {
              r: Math.max(0, selection.current.end.r - 1),
              c: selection.current.end.c,
            }
            resizeSelection({
              start: selection.current.start,
              end,
            })
            setFocusCell(end)
          } else {
            selectAndFocus({
              r: Math.max(0, selection.current.start.r - 1),
              c: selection.current.end.c,
            })
          }
          break
        case 'ArrowDown':
          if (e.shiftKey && e.ctrlKey) {
            const end = { r: df.shape[0] - 1, c: selection.current.start.c }
            resizeSelection({
              start: selection.current.start,
              end,
            })
            setFocusCell(end)
          } else if (e.shiftKey) {
            const end = {
              r: Math.min(df.shape[0] - 1, selection.current.end.r + 1),
              c: selection.current.end.c,
            }
            resizeSelection({
              start: selection.current.start,
              end,
            })
            setFocusCell(end)
          } else {
            selectAndFocus({
              r: Math.min(df.shape[0] - 1, selection.current.start.r + 1),
              c: selection.current.start.c,
            })
          }
          break
        case 'PageUp':
          d.scrollTop -= d.clientHeight
          break
        case 'PageDown':
          d.scrollTop += d.clientHeight
          break
        case 'Escape':
          resizeSelection(NO_SELECTION_RANGE)

          //onSelectionChange && onSelectionChange(NO_SELECTION_RANGE)
          //setFocusCell(NO_SELECTION)
          //setEditCell(NO_SELECTION)
          //res(NO_SELECTION)
          break
        case 'Enter':
          setEditCell(selection.current.start)
          break
        default:
          break
      }

      //e.preventDefault()
      //e.stopPropagation()
    }

    function resizeTable() {
      window.requestAnimationFrame(() => {
        const d = scrollRef.current

        if (!d) {
          return
        }

        const [w, h] = getSize(d)

        let canvas: HTMLCanvasElement | null

        canvas = bgCanvasRef.current

        if (canvas) {
          canvas.style.width = `${w}px`
          canvas.style.height = `${h}px`
          setupCanvas(canvas, scale)
        }

        canvas = tableCanvasRef.current

        if (canvas) {
          canvas.style.width = `${w}px`
          canvas.style.height = `${h}px`
          setupCanvas(canvas, scale)
        }

        if (!bgCanvasRef.current) {
          return
        }

        const [, , normLeft, normTop] = getScrollProps(lastScroll.current)

        const ctx = bgCanvasRef.current.getContext('2d')

        if (!ctx) {
          return
        }

        drawHeaderBg(ctx, normLeft, w)
        drawIndexBg(ctx, normTop, h)

        ctx.save()

        ctx.translate(dfProps.scaledRowIndexW, cellSize[1])

        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, w, h)

        draw()

        ctx.restore()

        // if (frameID.current) {
        //   window.cancelAnimationFrame(frameID.current)
        //   frameID.current = undefined
        // }
      })
    }

    function onClick(e: MouseEvent) {
      //containerRef?.current && containerRef.current.focus()

      if (e.detail == 2) {
        setEditCell(selection.current.start)
      }

      //e.stopPropagation()
      e.preventDefault()
    }

    function onEditChange(e: ChangeEvent) {
      setEditText((e.target as HTMLInputElement).value)
    }

    function updateCell(p: ICell) {
      window.requestAnimationFrame(() => {
        const d = scrollRef.current

        if (d) {
          //const [w, h] = getSize(d)
          const [l, t] = getScrollProps(lastScroll.current)
          const ctx = tableCanvasRef?.current?.getContext('2d')

          drawCell(ctx, l, t, p.r, p.c)
        }
      })
    }

    function onEditKeyDown(e: KeyboardEvent) {
      if (!editable) {
        return
      }

      switch (e.code) {
        case 'Enter':
          if (selection.current.start.r !== -1) {
            df.set(
              selection.current.start.r,
              selection.current.start.c,
              editText
            )
          }

          updateCell(selection.current.start)
          setEditCell(NO_SELECTION)
          break
      }
    }

    function onCellEditKeyDown(e: KeyboardEvent) {
      if (!editable) {
        return
      }

      switch (e.code) {
        case 'Enter':
          df.set(
            selection.current.start.r,
            selection.current.start.c,
            (e.target as HTMLInputElement).value
          )

          updateCell(selection.current.start)

          setEditCell(NO_SELECTION)

          ref?.current && ref.current.focus()

          break
        case 'Escape':
          // reset the text to its original value
          setEditText(
            cellStr(
              df.get(selection.current.start.r, selection.current.start.c)
            )
          )

          // remove the selection
          setEditCell(NO_SELECTION)
          break
      }

      e.stopPropagation()
    }

    //const scrollRef = useRef(); // We will use React useRef hook to reference the wrapping div:
    //const { events } = useDraggable(containerRef as MutableRefObject<HTMLElement>)

    return (
      <BaseCol ref={ref} className={cn('grow gap-y-2', className)}>
        <VCenterRow className="gap-x-3 text-sm">
          <Input
            value={selText}
            className="w-24 rounded-md"
            readOnly
            aria-label="Cell Location"
          />
          {editable ? (
            <Input
              id="cell-edit-input"
              aria-label="Cell Edit"
              value={editText}
              className="w-full rounded-md"
              onChange={onEditChange}
              onKeyDown={onEditKeyDown}
            />
          ) : (
            <Input
              id="cell-edit-input"
              aria-label="Cell Edit"
              value={editText}
              className="w-full rounded-md"
              readOnly
            />
          )}
        </VCenterRow>

        <BaseCol
          className={cn('relative z-50 grow overflow-hidden', FOCUS_RING_CLS)}
        >
          <BaseCol
            onKeyDown={onKeyDown}
            onMouseDown={onHeaderMouseDown}
            onMouseMove={onHeaderMouseMove}
            onMouseUp={onMouseUp}
            onWheel={onHeaderWheel}
            ref={outerRef}
            className="relative z-40 grow overflow-hidden border border-border rounded-md"
            style={{
              paddingLeft: dfProps.scaledRowIndexW,
              paddingTop: dfProps.scaledCellSize[1],
            }}
            tabIndex={0}
          >
            <div
              ref={(e: HTMLDivElement) => {
                scrollRef.current = e
                //scrollTargetRef(e)
              }}
              //className="relative z-50 overflow-scroll border border-orange-400"
              className="custom-scrollbar relative z-50 grow overflow-scroll"
              //onMouseMove={onMouseMove}
              onClick={onClick}
              onScroll={(e: UIEvent<HTMLDivElement>) => {
                onScroll(e)
                //   e.preventDefault()
                //   console.log('scroll', e.currentTarget.scrollLeft,  e.currentTarget.scrollTop)
                //   //e.stopPropagation()
              }}
              //{...events}

              //onMouseUp={scrollOnEdgesMouseUp}
              //onMouseMove={scrollOnEdgesMouseMove}
            >
              {/* Used to create scroll bars */}
              <div
                className="invisible absolute left-0 top-0"
                style={{
                  width: dfProps.maxScaledDim[0],
                  height: 1,
                }}
              />

              <div
                className="invisible absolute left-0 top-0"
                style={{
                  width: 1,
                  height: dfProps.maxScaledDim[1],
                }}
              />

              {/* <div
            ref={selectionRef}
            className="pointer-events-none invisible absolute z-70 border"
            style={{
              borderColor: SELECTION_STROKE_COLOR,
              backgroundColor: SELECTION_FILL,
            }}
          /> */}

              {/* <div
            ref={selectionCellRef}
            className="pointer-events-none invisible absolute z-80 border-2"
            style={{
              borderColor: SELECTION_STROKE_COLOR,
            }}
          /> */}

              {editable && editCell.r !== -1 && (
                <VCenterRow
                  className="absolute z-100 overflow-hidden p-1 text-sm animate-in fade-in-0"
                  style={{
                    left: colPositions.current[editCell.c] * scale,
                    top: editCell.r * dfProps.scaledCellSize[1],
                    width:
                      (colPositions.current[editCell.c + 1] -
                        colPositions.current[editCell.c]) *
                        scale +
                      scale,
                    height: dfProps.scaledCellSize[1] + scale,
                  }}
                  onMouseDown={(e: MouseEvent) => e.preventDefault()}
                  onMouseUp={(e: MouseEvent) => e.preventDefault()}
                >
                  <input
                    className={cn('w-full resize-none bg-white outline-none', [
                      !isNaN(parseFloat(editText)),
                      'text-right',
                    ])}
                    value={editText}
                    onKeyDown={onCellEditKeyDown}
                    onChange={onEditChange}
                    onFocus={e => e.target.select()}
                    onClick={(e: MouseEvent) => e.stopPropagation()}
                    onMouseDown={(e: MouseEvent) => e.stopPropagation()}
                    readOnly={false}
                    ref={editRef}
                  />
                </VCenterRow>
              )}
            </div>

            <canvas
              ref={tableCanvasRef}
              className="absolute left-0 top-0 z-10"
            />

            <canvas ref={bgCanvasRef} className="absolute left-0 top-0 z-0" />
          </BaseCol>
        </BaseCol>
      </BaseCol>
    )
  }
)
