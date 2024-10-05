import { ICON_CLS, type IIconProps } from "@interfaces/icon-props"
import { cn } from "@lib/class-names"

export function PlusIcon({
  w = "w-4",
  stroke = "stroke-2",
  fill = "stroke-foreground",
  style,
  className,
  ...props
}: IIconProps) {
  // const lineCls = cn(
  //   "rounded-full absolute left-0.25 right-0.25 top-1/2 -translate-y-1/2",
  //   fill,
  // )
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 18 18"
      className={cn(ICON_CLS, stroke, fill, w, className)}
      style={{
        strokeLinecap: "round",
        strokeLinejoin: "round",
        ...style,
      }}
      {...props}
    >
      <path d="M 4,9 L 14,9 M 9,4 L 9,14" />

      {/* <g transform="rotate(45 155.95 -44.512)">
        <path d="m79.391 96.481c-0.05206-0.04707-0.13213-0.04545-0.18234 0.0048l-0.56127 0.56127-0.56127-0.56127c-0.05182-0.05182-0.13527-0.05182-0.18709 0s-0.05182 0.13526 0 0.18709l0.56127 0.56127-0.56127 0.56127c-0.05182 0.05182-0.05182 0.13526 0 0.18709 0.05182 0.05182 0.13526 0.05182 0.18709 0l0.56127-0.56127 0.56127 0.56127c0.05182 0.05182 0.13526 0.05182 0.18709 0 0.05182-0.05182 0.05182-0.13526 0-0.18709l-0.56127-0.56132 0.56127-0.56127c0.05182-0.05182 0.05182-0.13527 0-0.18709-0.0016-0.0016-0.0031-0.0032-0.0048-0.0048z" />
      </g> */}
    </svg>

    // <div className={cn(ICON_CLS, w, className)} style={style}>
    //   <span className={lineCls} />
    //   <span className={cn(lineCls, "rotate-90")} />
    // </div>
  )
}
