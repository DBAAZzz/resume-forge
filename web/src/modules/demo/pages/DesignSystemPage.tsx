import { useState } from 'react';

import { Button, Input, Typography } from '@/components/base';

const DesignSystem = () => {
  const [isDark, setIsDark] = useState(false); // Default to light for Luxury theme

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
    setIsDark(!isDark);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-500 selection:bg-primary/10">
      <div className="relative z-10 mx-auto max-w-6xl animate-fade-in space-y-24 p-12">
        {/* Header */}
        <header className="flex items-end justify-between border-b border-border pb-8">
          <div className="space-y-4">
            <Typography
              variant="h4"
              className="font-sans text-xs uppercase tracking-widest text-muted-foreground"
            >
              01 — Design System
            </Typography>
            <Typography variant="h1" className="font-display text-6xl tracking-tight">
              Silent Luxury
            </Typography>
            <Typography
              variant="lead"
              className="max-w-xl font-sans font-light text-muted-foreground"
            >
              A minimalist design language focusing on typography, negative space, and monochromatic
              textures.
            </Typography>
          </div>
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="sm"
            className="font-mono text-xs uppercase tracking-wider"
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </header>

        {/* Buttons Showcase */}
        <section className="space-y-12">
          <div className="space-y-4 border-l-2 border-primary/20 pl-6">
            <Typography variant="h2" className="text-3xl font-light">
              Interaction
            </Typography>
            <Typography variant="p" className="max-w-lg text-muted-foreground">
              Buttons are refined to be subtle and tactile. Shadows are minimal, hover states are
              gentle shifts in opacity or tone.
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
            <div className="space-y-8">
              <Typography
                variant="h4"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                Main Actions
              </Typography>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </div>

            <div className="space-y-8">
              <Typography
                variant="h4"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                Utilities
              </Typography>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="link">Read More &rarr;</Button>
                <Button variant="glass">Glass Effect</Button>
                <Button size="icon" variant="outline" className="rounded-full">
                  ＋
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Showcase */}
        <section className="space-y-12">
          <div className="space-y-4 border-l-2 border-primary/20 pl-6">
            <Typography variant="h2" className="text-3xl font-light">
              Typography
            </Typography>
            <div className="flex gap-8 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <span>Display: Outfit</span>
              <span>Body: Inter</span>
            </div>
          </div>

          <div className="grid gap-12 md:grid-cols-12">
            <div className="space-y-10 md:col-span-7">
              <div className="space-y-2">
                <Typography variant="h1" className="text-8xl font-thin tracking-tighter">
                  Aa
                </Typography>
                <Typography variant="p" className="text-muted-foreground">
                  Outfit — Light 300
                </Typography>
              </div>

              <div className="space-y-6">
                <Typography variant="h1">The quick brown fox jumps.</Typography>
                <Typography variant="h2">The quick brown fox jumps.</Typography>
                <Typography variant="h3">The quick brown fox jumps.</Typography>
              </div>
            </div>

            <div className="space-y-8 pt-8 md:col-span-5">
              <div className="space-y-4">
                <Typography variant="large" className="font-sans font-light leading-relaxed">
                  "Simplicity is the ultimate sophistication. Design is not just what it looks like
                  and feels like. Design is how it works."
                </Typography>
                <Typography variant="muted" className="font-serif italic">
                  — Steve Jobs
                </Typography>
              </div>

              <div className="space-y-4 border-t border-border pt-8">
                <Typography variant="p" className="text-sm leading-loose text-muted-foreground">
                  Standard body text is set in Inter for maximum legibility. The color contrast is
                  kept high but soft (Charcoal on Off-White) to reduce eye strain while maintaining
                  a sharp, premium look.
                </Typography>
              </div>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section className="space-y-12 pb-24">
          <div className="space-y-4 border-l-2 border-primary/20 pl-6">
            <Typography variant="h2" className="text-3xl font-light">
              Input Fields
            </Typography>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Default
              </label>
              <Input placeholder="Enter your email..." />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Focused
              </label>
              <Input placeholder="Focused State" autoFocus />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Disabled
              </label>
              <Input placeholder="Disabled Input" disabled />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DesignSystem;
