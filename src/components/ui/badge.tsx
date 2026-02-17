import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 backdrop-blur-md",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md",
        secondary:
          "border-white/30 bg-white/20 text-gray-800",
        outline:
          "border-blue-500/50 text-blue-700 bg-blue-50/50",
        success:
          "border-transparent bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md",
        warning:
          "border-transparent bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
