# Framer Motion 使用指南

本项目已集成 Framer Motion 动画库，提供了丰富的动画效果和可复用组件。

## 📦 已安装的包

- `framer-motion`: ^12.29.0

## 🎨 动画配置

所有动画配置都在 `src/utils/animations.ts` 中定义，包括：

### 页面动画

- `pageVariants`: 页面切换动画（淡入淡出 + 垂直移动）
- `fadeInVariants`: 简单的淡入淡出动画
- `slideUpVariants`: 从下方滑入动画
- `scaleVariants`: 缩放动画

### 容器和列表动画

- `containerVariants`: 容器动画，用于子元素的交错动画
- `itemVariants`: 子元素动画，配合 containerVariants 使用

### 交互动画

- `navLinkHover`: 导航链接悬停动画
- `buttonHover`: 按钮悬停动画
- `buttonTap`: 按钮点击动画

### 特殊效果

- `spinnerVariants`: 旋转加载动画
- `pulseVariants`: 脉冲动画

## 🧩 可复用组件

### 1. AnimatedPage

页面容器组件，自动添加页面切换动画。

```tsx
import { AnimatedPage } from '../components';

function MyPage() {
  return (
    <AnimatedPage className="page-container">
      <h1>页面内容</h1>
    </AnimatedPage>
  );
}
```

### 2. AnimatedLoader

带动画的加载指示器。

```tsx
import { AnimatedLoader } from '../components';

function MyComponent() {
  return isLoading ? <AnimatedLoader /> : <Content />;
}
```

### 3. AnimatedButton

带悬停和点击动画的按钮组件。

```tsx
import { AnimatedButton } from '../components';

function MyComponent() {
  return (
    <>
      <AnimatedButton variant="primary" onClick={handleClick}>
        主要按钮
      </AnimatedButton>
      <AnimatedButton variant="secondary">次要按钮</AnimatedButton>
      <AnimatedButton variant="outline">轮廓按钮</AnimatedButton>
    </>
  );
}
```

### 4. AnimatedCard

带淡入和悬停效果的卡片组件。

```tsx
import { AnimatedCard } from '../components';

function MyComponent() {
  return (
    <AnimatedCard delay={0.2} hoverScale={1.05}>
      <h3>卡片标题</h3>
      <p>卡片内容</p>
    </AnimatedCard>
  );
}
```

## 🎯 使用示例

### 交错动画列表

```tsx
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../utils/animations';

function List() {
  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate">
      {items.map((item) => (
        <motion.div key={item.id} variants={itemVariants}>
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### 自定义悬停效果

```tsx
import { motion } from 'framer-motion';

function CustomCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      卡片内容
    </motion.div>
  );
}
```

### 路径动画

```tsx
import { motion } from 'framer-motion';

function AnimatedIcon() {
  return (
    <motion.svg>
      <motion.path
        d="M 0 0 L 100 100"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2 }}
      />
    </motion.svg>
  );
}
```

### 手势动画

```tsx
import { motion } from 'framer-motion';

function DraggableBox() {
  return (
    <motion.div
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      dragElastic={0.2}
      whileDrag={{ scale: 1.1 }}
    >
      可拖拽的盒子
    </motion.div>
  );
}
```

## 🔧 高级用法

### 动画序列

```tsx
import { motion } from 'framer-motion';

function Sequence() {
  return (
    <motion.div
      animate={{
        x: [0, 100, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 2,
        times: [0, 0.5, 1],
        repeat: Infinity,
      }}
    >
      序列动画
    </motion.div>
  );
}
```

### 布局动画

```tsx
import { motion, AnimatePresence } from 'framer-motion';

function LayoutAnimation() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div layout onClick={() => setIsExpanded(!isExpanded)}>
      <motion.h2 layout>标题</motion.h2>
      <AnimatePresence>
        {isExpanded && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            展开的内容
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

### 滚动触发动画

```tsx
import { motion, useScroll, useTransform } from 'framer-motion';

function ScrollAnimation() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return <motion.div style={{ opacity }}>随滚动淡出</motion.div>;
}
```

## 📚 更多资源

- [Framer Motion 官方文档](https://www.framer.com/motion/)
- [动画示例库](https://www.framer.com/motion/examples/)
- [API 参考](https://www.framer.com/motion/component/)

## 💡 最佳实践

1. **性能优化**: 使用 `layout` 属性时要谨慎，可能会影响性能
2. **减少重渲染**: 将动画配置提取到组件外部
3. **使用 variants**: 对于复杂动画，使用 variants 可以使代码更清晰
4. **AnimatePresence**: 处理组件卸载动画时必须使用
5. **will-change**: Framer Motion 会自动处理，无需手动添加

## 🎨 当前项目集成

项目中已经为以下部分添加了动画：

- ✅ 导航栏（滑入 + 交错动画）
- ✅ 页面切换（淡入淡出 + 垂直移动）
- ✅ 加载器（旋转动画）
- ✅ 所有页面组件（Home, Resume, Analysis, Discover）
- ✅ 列表项交错动画
- ✅ 悬停和点击效果

你可以在这些组件的基础上继续扩展和自定义动画效果！
