import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/utils/classnames';

const typographyVariants = cva('text-foreground', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-4xl font-semibold tracking-tight lg:text-5xl font-display text-foreground',
      h2: 'scroll-m-20 border-b pb-2 text-3xl font-medium tracking-tight first:mt-0 font-display',
      h3: 'scroll-m-20 text-2xl font-medium tracking-tight font-display',
      h4: 'scroll-m-20 text-xl font-medium tracking-tight font-display',
      p: 'leading-7 [&:not(:first-child)]:mt-6 font-sans text-muted-foreground',
      blockquote: 'mt-6 border-l-2 border-border pl-6 italic font-sans',
      list: 'my-6 ml-6 list-disc [&>li]:mt-2 font-sans',
      lead: 'text-xl text-muted-foreground font-sans',
      large: 'text-lg font-semibold font-sans',
      small: 'text-sm font-medium leading-none font-mono opacity-80',
      muted: 'text-sm text-muted-foreground font-mono',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
});

type TagName =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'div'
  | 'blockquote'
  | 'ul'
  | 'li';

interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof typographyVariants> {
  as?: TagName;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as, ...props }, ref) => {
    const Tag = (as ||
      (variant === 'h1'
        ? 'h1'
        : variant === 'h2'
          ? 'h2'
          : variant === 'h3'
            ? 'h3'
            : variant === 'h4'
              ? 'h4'
              : variant === 'blockquote'
                ? 'blockquote'
                : variant === 'list'
                  ? 'ul'
                  : 'p')) as React.ElementType;

    return <Tag ref={ref} className={cn(typographyVariants({ variant, className }))} {...props} />;
  }
);
Typography.displayName = 'Typography';

export { Typography };
