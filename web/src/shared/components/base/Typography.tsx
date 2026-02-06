import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/shared/utils/classnames';

const typographyVariants = cva('text-foreground', {
  variants: {
    variant: {
      h1: 'scroll-m-20 font-display text-4xl font-semibold tracking-tight text-foreground lg:text-5xl',
      h2: 'scroll-m-20 border-b pb-2 font-display text-3xl font-medium tracking-tight first:mt-0',
      h3: 'scroll-m-20 font-display text-2xl font-medium tracking-tight',
      h4: 'scroll-m-20 font-display text-xl font-medium tracking-tight',
      p: 'font-sans leading-7 text-muted-foreground [&:not(:first-child)]:mt-6',
      blockquote: 'mt-6 border-l-2 border-border pl-6 font-sans italic',
      list: 'my-6 ml-6 list-disc font-sans [&>li]:mt-2',
      lead: 'font-sans text-xl text-muted-foreground',
      large: 'font-sans text-lg font-semibold',
      small: 'font-mono text-sm font-medium leading-none opacity-80',
      muted: 'font-mono text-sm text-muted-foreground',
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
