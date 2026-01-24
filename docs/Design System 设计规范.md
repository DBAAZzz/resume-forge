# Design System 设计规范: Silent Luxury

## 1. 核心理念

本项目的 UI 设计遵循 **Minimalist Luxury (朴素高级)** 理念，强调排版、留白和材质感。

- **Vibe**: 宁静、高级、永恒 (Sophisticated, Timeless, Airy).
- **Architecture**: Atomic Design + Semantic Tokens.

---

## 2. 设计系统架构

### 2.1 Color Palette (Neutral)

我们采用全中性色调，移除高饱和度的装饰色。

| Token 类别     | Light Mode (Warm Stone)    | Dark Mode (Matte Obsidian) |
| :------------- | :------------------------- | :------------------------- |
| **Background** | `hsl(40 20% 99%)` 暖米白   | `hsl(24 10% 5%)` 深暖黑    |
| **Foreground** | `hsl(24 10% 10%)` 深炭黑   | `hsl(60 5% 90%)` 柔白      |
| **Primary**    | `hsl(24 10% 10%)` (Action) | `hsl(60 5% 90%)` (Action)  |
| **Secondary**  | `hsl(60 5% 96%)`           | `hsl(24 5% 18%)`           |
| **Border**     | `hsl(20 6% 90%)`           | `hsl(24 5% 18%)`           |

### 2.2 Typography

- **Headings**: `Outfit` (Google Fonts). 现代、几何感强。
  - 特征：Tighter spacing (`tracking-tight`), Lighter weights (300/400/500).
- **Body**: `Inter`. 最佳可读性。
- **Technical**: `Space Grotesk`. 用于代码、标签、辅助信息。

---

## 3. 原子组件库 (Atomic Components)

### 3.1 Button

交互追求克制 (Restraint)。没有霓虹光晕，只有微妙的透明度和阴影变化。

- **Variants**: `default` (Solid), `outline` (Thin border), `ghost` (Text only), `glass` (Frosted).

```tsx
<Button variant="default">Primary Action</Button>
<Button variant="glass">Glass Action</Button>
```

### 3.2 Typography

统一的文本排版组件。

```tsx
<Typography variant="h1">Silent Luxury</Typography>
<Typography variant="lead" className="text-muted-foreground">
  Less is more.
</Typography>
```

### 3.3 Layout

- **Spacing**: 增加留白，使用 `gap-8`, `gap-12` 等大间距。
- **Grid**: 简单的网格布局，注重垂直韵律。

---

## 4. 开发指南

### 4.1 新增页面

所有新页面应使用 `AnimatedPage` 包裹，并使用 `Typography` 组件而非原始 HTML 标签。

```tsx
// ❌ Avoid
<h1>Title</h1>

// ✅ Recommended
<Typography variant="h1">Title</Typography>
```

### 4.2 修改主题

修改 `src/index.css` 中的 HSL 变量即可调整全局色调。保持饱和度低 (<10%) 是保持“高级感”的关键。

---

_文档更新日期: 2026-01-25_
