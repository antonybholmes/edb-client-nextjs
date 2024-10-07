import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'

export function FavIcon({ w = 'w-7', className }: IIconProps) {
  return (
    <svg
      version="1.1"
      viewBox="0 0 14.5 14.5"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(ICON_CLS, w, className)}
    >
      <g transform="translate(-33.407 -100.86)">
        <g transform="translate(0,5)">
          <g transform="rotate(45 35.968 104.08)">
            <g transform="translate(.19027 .19027)">
              <g
                transform="matrix(1.0253 0 0 1.0253 -16.35 -4.2442)"
                fill="#afc6e9"
              >
                <ellipse
                  cx="59.041"
                  cy="101.75"
                  rx="2.4383"
                  ry="2.4383"
                  fill="white"
                  fillOpacity="0.6"
                />
              </g>
              <g
                transform="matrix(.51266 0 0 .51266 6.4211 41.664)"
                fill="#5f8dd3"
              >
                <ellipse
                  cx="59.041"
                  cy="101.75"
                  rx="2.4383"
                  ry="2.4383"
                  fill="white"
                  fillOpacity="0.6"
                />
              </g>
              <circle
                cx="36.686"
                cy="100.08"
                r="5"
                fill="white"
                fillOpacity="0.6"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
