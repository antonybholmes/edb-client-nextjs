import { BaseCol } from "@components/base-col"
import { ContentDiv } from "@components/content-div"

import { VCenterCol } from "@components/v-center-col"
import { cn } from "@lib/class-names"
import { forwardRef, type HTMLAttributes } from "react"

interface ICardContainerProps extends HTMLAttributes<HTMLDivElement> {
  gap?: string
}

export const CardContainer = forwardRef<HTMLDivElement, ICardContainerProps>(
  ({ className, gap = "gap-y-8", children, ...props }, ref) => (
    <ContentDiv className="py-8" ref={ref}>
      <BaseCol className={cn("text-sm", gap, className)}>{children}</BaseCol>
    </ContentDiv>
  ),
)

export const CenteredCardContainer = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
  // eslint-disable-next-line react/prop-types
>(({ className, children, ...props }, ref) => (
  <VCenterCol ref={ref} className="grow">
    <CardContainer>{children}</CardContainer>
  </VCenterCol>
))

const BaseCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
  // eslint-disable-next-line react/prop-types
>(({ className, ...props }, ref) => (
  <BaseCol
    ref={ref}
    className={cn("rounded-xl bg-card", className)}
    {...props}
  />
))

const Card = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
  // eslint-disable-next-line react/prop-types
>(({ className, ...props }, ref) => (
  <BaseCard ref={ref} className={cn("p-8 gap-y-8", className)} {...props} />
))
Card.displayName = "Card"

const SecondaryCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
  // eslint-disable-next-line react/prop-types
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-2xl bg-accent/50 text-foreground", className)}
    {...props}
  />
))
SecondaryCard.displayName = "SecondaryCard"

const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
  // eslint-disable-next-line react/prop-types
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
  // eslint-disable-next-line react/prop-types
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
  // eslint-disable-next-line react/prop-types
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-foreground/50", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
  // eslint-disable-next-line react/prop-types
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
  // eslint-disable-next-line react/prop-types
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export {
  BaseCard,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  SecondaryCard,
}
