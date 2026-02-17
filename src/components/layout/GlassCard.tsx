import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const glassCardVariants = cva(
  // Base styles - the foundation of our glass aesthetic
  [
    'relative',
    'overflow-hidden',
    'rounded-2xl',
    'border border-white/20',
    'backdrop-blur-xl',
    'transition-all duration-500 ease-out',
    // Subtle inner glow for depth
    'before:absolute before:inset-0',
    'before:rounded-2xl',
    'before:bg-gradient-to-br before:from-white/10 before:to-transparent',
    'before:opacity-0 before:transition-opacity before:duration-500',
    // Shimmer effect on hover
    'after:absolute after:inset-0',
    'after:rounded-2xl',
    'after:bg-gradient-to-br after:from-transparent after:via-white/5 after:to-transparent',
    'after:opacity-0 after:transition-all after:duration-700',
    'hover:after:opacity-100',
    // Lift on hover
    'hover:before:opacity-100',
    'hover:-translate-y-0.5',
    'hover:shadow-2xl hover:shadow-blue-500/10',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-white/10',
          'shadow-xl shadow-black/5',
          // Soft border gradient
          'before:border before:border-white/10',
        ],
        strong: [
          'bg-white/20',
          'border-white/30',
          'shadow-2xl shadow-black/10',
          // More pronounced gradient
          'before:bg-gradient-to-br before:from-white/20 before:to-transparent',
          'before:border before:border-white/20',
        ],
        subtle: [
          'bg-white/5',
          'border-white/10',
          'shadow-lg shadow-black/5',
        ],
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-12',
      },
      glow: {
        none: '',
        blue: 'hover:shadow-blue-400/20',
        teal: 'hover:shadow-teal-400/20',
        purple: 'hover:shadow-purple-400/20',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      glow: 'none',
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  children: React.ReactNode;
  hoverable?: boolean;
  animated?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant,
      padding,
      glow,
      children,
      hoverable = true,
      animated = true,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          glassCardVariants({ variant, padding, glow }),
          !hoverable && 'hover:transform-none hover:shadow-xl',
          !animated && 'transition-none',
          className
        )}
        {...props}
      >
        {/* Content wrapper with proper z-index */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// Specialized variants for common use cases
export const GlassCardFeature = ({ children, className, ...props }: GlassCardProps) => (
  <GlassCard
    variant="strong"
    padding="lg"
    glow="blue"
    className={cn('text-center', className)}
    {...props}
  >
    {children}
  </GlassCard>
);

export const GlassCardMinimal = ({ children, className, ...props }: GlassCardProps) => (
  <GlassCard
    variant="subtle"
    padding="md"
    hoverable={false}
    className={className}
    {...props}
  >
    {children}
  </GlassCard>
);
