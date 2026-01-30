# Industrial Design Spec (工业/技术风格规范)

适用于高级分析、AI 调试与系统监控模块的 UI 设计语言。

## 1. 核心理念 (Core Philosophy)

**"Function over Form" (功能至上)**。

此设计语言剥离了所有装饰性的圆角、柔和阴影和模糊效果，回归到最原始、最直接的信息展示方式。它模仿工业控制面板、军用 HUD (平视显示器) 和复古终端界面。

- **Keywords**: Square, Boxy, Raw, Monospace, High-Contrast.
- **Vibe**: 精密 (Precision)、硬核 (Hardcore)、系统化 (Systematic).

## 2. 设计要素 (Design Tokens)

### 2.1 形状 (Shapes)

- **绝不使用圆角** (`rounded-none`)。所有的容器、按钮、输入框必须是直角。
- **边框 (Borders)** 是构建层级的主要手段，而非阴影。
  - 使用 `border`, `border-r`, `border-b` 来切割空间。
  - 边框颜色多为 `slate-200` (轻微) 或 `slate-900` (强调)。

### 2.2 排版 (Typography)

利用字体区分 "阅读内容" 与 "数据/状态"。

- **Heading (标题)**: `font-display` (Outfit)。大写字母，加粗，宽字间距 (`tracking-widest`)。
- **Data/Label (数据/标签)**: `font-mono` (Space Grotesk / JetBrains Mono)。
  - 用于 ID、错误码、状态标记 (e.g., `[CRITICAL]`)、数值。
- **Body (正文)**: `font-sans` (Inter)。仅用于长段落描述。

### 2.3 颜色与状态 (Colors & Status)

色彩仅用于指示系统状态，不用于装饰。透明度用于背景而非主体。

- **Severity Indicators**:
  - 🔴 **Critical**: `bg-red-50 text-red-600 border-red-600`
  - 🟠 **Warning/Skill Mismatch**: `bg-orange-50 text-orange-600 border-orange-600`
  - 🔵 **Info/Scale**: `bg-blue-50 text-blue-600 border-blue-600`
  - 🟢 **Success/Optimization**: `bg-emerald-50 text-emerald-600 border-emerald-600`
  - 🟣 **Performance**: `bg-purple-50 text-purple-600 border-purple-600`

### 2.4 交互与动效 (Interaction)

- **Instant Feedback**: 拒绝 `fade-in` 等软过渡。信息展示应如终端般 "即刻呈现"。
- **System Idle**: 空状态不应只是 "空白"，而应显示 "System Idle" 或 "Ready for Input" 等系统术语。
- **Hover**: 机械式反馈。例如边框颜色突变、背景色快切，而非平滑过渡。

## 3. 组件示例 (Component Examples)

### 3.1 Card (卡片)

```tsx
<div className="border border-slate-300 bg-white p-0">
  {/* Header Bar */}
  <div className="flex justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
    <span className="font-mono text-xs font-bold uppercase">[SYSTEM_LOG]</span>
    <span className="font-mono text-[10px] text-slate-400">ID: 001</span>
  </div>
  {/* Content */}
  <div className="p-4">Content goes here...</div>
</div>
```

### 3.2 Badge (标记)

并不是胶囊形状，而是方块或带括号的文本。

```tsx
// ✅ Correct
<span className="bg-red-50 border border-red-200 text-red-700 px-1 font-mono text-xs">CRITICAL</span>
// OR
<span className="font-mono text-red-600 font-bold uppercase">[CRITICAL]</span>

// ❌ Avoid
<span className="rounded-full bg-red-100 px-2 py-1">Critical</span>
```

### 3.3 List (列表)

使用编号或连接线，模仿目录结构。

```tsx
<ul className="space-y-1">
  <li className="font-mono text-xs text-slate-600 border-l border-slate-200 pl-2">
    <span className="text-slate-400">01</span> System check
  </li>
  <li className="font-mono text-xs text-slate-600 border-l border-slate-200 pl-2">
    <span className="text-slate-400">02</span> Data verification
  </li>
</ul>
```

## 4. 避免事项 (Don'ts)

1.  ❌ 不要使用 `rounded-lg`, `rounded-md`, `rounded-full`。
2.  ❌ 不要使用大面积的投影 (`shadow-xl`)，改用实线边框。
3.  ❌ 不要隐藏初始化数据（避免 `opacity-0` 初始状态）。
4.  ❌ 不要在展示 ID、代码、数值时使用非等宽字体。
