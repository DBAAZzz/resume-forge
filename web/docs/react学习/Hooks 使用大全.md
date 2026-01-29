# React Hooks 使用大全

本文核心观点提取自 [「React 进阶」 React 全部 Hooks 使用大全](https://juejin.cn/post/7118937685653192735)，并结合本项目实际代码、底层原理和实战场景进行深度说明。

---

## 目录

- [一、Hooks 之数据更新驱动](#一-hooks-之数据更新驱动)
  - [1.1 useState](#11-usestate)
  - [1.2 useReducer](#12-usereducer)
  - [1.3 useSyncExternalStore](#13-usesyncexternalstore-react-18)
  - [1.4 useTransition](#14-usetransition-react-18)
  - [1.5 useDeferredValue](#15-usedeferredvalue-react-18)
- [二、Hooks 之执行副作用](#二-hooks-之执行副作用)
  - [2.1 useEffect](#21-useeffect)
  - [2.2 useLayoutEffect](#22-uselayouteffect)
  - [2.3 useInsertionEffect](#23-useinsertioneffect-react-18)
- [三、Hooks 之状态获取与传递](#三-hooks-之状态获取与传递)
  - [3.1 useContext](#31-usecontext)
  - [3.2 useRef](#32-useref)
  - [3.3 useImperativeHandle](#33-useimperativehandle)
- [四、Hooks 之状态派生与保存（性能优化）](#四-hooks-之状态派生与保存性能优化)
  - [4.1 useMemo](#41-usememo)
  - [4.2 useCallback](#42-usecallback)
- [五、Hooks 之工具](#五-hooks-之工具)
  - [5.1 useDebugValue](#51-usedebugvalue)
  - [5.2 useId](#52-useid-react-18)
- [六、自定义 Hooks](#六-自定义-hooks)
- [七、React 19 新增 Hooks](#七-react-19-新增-hooks)
- [八、Hooks 使用规则与常见陷阱](#八-hooks-使用规则与常见陷阱)

---

## 一、 Hooks 之数据更新驱动

### 1.1 useState

`useState` 是 React 中最基础、最常用的 Hook，让函数组件拥有状态管理能力。

#### 基本定义

```tsx
const [state, setState] = useState(initialState);
```

- **state**：当前状态值，提供给 UI 渲染的数据源
- **setState**：状态更新函数，触发组件重新渲染
- **initialState**：初始值，可以是普通值或惰性初始化函数

#### 底层原理：Fiber 与 Hook 链表

要理解 `useState`，需要先理解 React 的 Fiber 架构：

```
FiberNode {
  memoizedState: Hook1 -> Hook2 -> Hook3 -> ...  (链表结构)
  ...
}

每个 Hook 节点:
Hook {
  memoizedState: any,        // 当前状态值
  baseState: any,            // 初始状态
  baseQueue: Update | null,  // 待处理的更新
  queue: UpdateQueue,        // 更新队列
  next: Hook | null          // 下一个 Hook
}
```

**为什么 Hooks 不能在条件语句中使用？**

因为 React 通过 **调用顺序** 来匹配每次渲染时的 Hook。如果条件语句改变了 Hook 的调用顺序，React 就无法正确对应状态：

```tsx
// ❌ 错误示例
function BadComponent({ condition }) {
  if (condition) {
    const [a, setA] = useState(0); // 有时是第1个，有时不存在
  }
  const [b, setB] = useState(0); // 有时是第2个，有时是第1个
  // React 无法正确匹配！
}

// ✅ 正确做法
function GoodComponent({ condition }) {
  const [a, setA] = useState(0); // 始终是第1个
  const [b, setB] = useState(0); // 始终是第2个

  // 在使用时判断条件
  if (condition) {
    // 使用 a
  }
}
```

#### 惰性初始化

当初始状态需要通过复杂计算得出时，使用函数形式避免每次渲染都重新计算：

```tsx
// ❌ 每次渲染都会执行 expensiveComputation
const [state, setState] = useState(expensiveComputation(props));

// ✅ 只在首次渲染时执行
const [state, setState] = useState(() => expensiveComputation(props));
```

**典型场景：从 localStorage 读取初始值**

```tsx
const [theme, setTheme] = useState(() => {
  // 只在组件首次挂载时执行
  const saved = localStorage.getItem('theme');
  return saved ? JSON.parse(saved) : 'light';
});
```

#### 函数式更新

当新状态依赖于旧状态时，**必须使用函数式更新**：

```tsx
// ❌ 问题代码：快速点击3次，count 只变成 1
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1); // 闭包捕获的是点击时的 count 值
    setCount(count + 1); // 还是同一个 count
    setCount(count + 1); // 依然是同一个 count
    // 三次设置的都是 0 + 1 = 1
  };
}

// ✅ 正确做法：快速点击3次，count 变成 3
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((prev) => prev + 1); // 基于最新值 +1
    setCount((prev) => prev + 1); // 基于上一次的结果 +1
    setCount((prev) => prev + 1); // 再 +1
    // 0 -> 1 -> 2 -> 3
  };
}
```

#### 批量更新（Automatic Batching）

React 18 引入了**自动批量更新**，多次 setState 会被合并为一次重渲染：

```tsx
function App() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  const handleClick = () => {
    // React 18: 无论在哪里调用，都会批量处理
    setCount((c) => c + 1);
    setFlag((f) => !f);
    // 只触发一次重渲染！
  };

  // 即使在 setTimeout/Promise 中也会批量
  const handleAsync = () => {
    setTimeout(() => {
      setCount((c) => c + 1);
      setFlag((f) => !f);
      // React 18: 仍然只触发一次重渲染
      // React 17: 会触发两次重渲染
    }, 0);
  };
}
```

**如果你需要立即触发重渲染**（极少数情况）：

```tsx
import { flushSync } from 'react-dom';

const handleClick = () => {
  flushSync(() => {
    setCount((c) => c + 1);
  });
  // DOM 已更新

  flushSync(() => {
    setFlag((f) => !f);
  });
  // DOM 再次更新
};
```

#### 闭包陷阱深度剖析

这是 React 初学者最容易踩的坑：

```tsx
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      console.log(count); // 永远打印 0（闭包捕获）
      setCount(count + 1); // 永远设置为 1
    }, 1000);
    return () => clearInterval(id);
  }, []); // 空依赖，effect 只在挂载时创建

  return <div>{count}</div>; // 显示：1, 1, 1, 1...
}
```

**原因分析：**

- `useEffect` 的回调函数在首次渲染时创建
- 形成闭包，捕获了 `count = 0`
- 由于依赖数组为空，这个闭包永远不会更新
- 每秒都在执行 `setCount(0 + 1)`

**解决方案：**

```tsx
// 方案一：函数式更新（推荐）
useEffect(() => {
  const id = setInterval(() => {
    setCount((prev) => prev + 1); // 不依赖外部 count
  }, 1000);
  return () => clearInterval(id);
}, []);

// 方案二：使用 useRef 保存最新值
function Timer() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  countRef.current = count; // 每次渲染更新 ref

  useEffect(() => {
    const id = setInterval(() => {
      console.log(countRef.current); // 总是最新值
      setCount(countRef.current + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);
}

// 方案三：添加正确的依赖（可能导致定时器重建）
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]); // 每次 count 变化都重建定时器
```

#### 项目实践

在 `src/pages/AnimationDemo.tsx` 中，使用 `useState` 控制加载状态：

```tsx
import { useState } from 'react';

export default function AnimationDemo() {
  const [loading, setLoading] = useState(false);

  const toggleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };
}
```

在 `src/pages/DesignSystem.tsx` 中，使用 `useState` 切换主题模式：

```tsx
const [isDark, setIsDark] = useState(false);

const toggleTheme = () => {
  setIsDark(!isDark);
};
```

---

### 1.2 useReducer

`useReducer` 是 `useState` 的替代方案，适合处理**复杂的状态逻辑**。本质上，`useState` 就是基于 `useReducer` 实现的。

#### 基本定义

```tsx
const [state, dispatch] = useReducer(reducer, initialArg, init?);
```

- **reducer**：`(state, action) => newState`，纯函数
- **dispatch**：派发 action 的函数，触发 reducer 执行
- **initialArg**：初始状态或传给 init 函数的参数
- **init**：可选的惰性初始化函数

#### useState vs useReducer 对比

```tsx
// useState 方式
const [count, setCount] = useState(0);

// 等价的 useReducer 实现
const [count, dispatch] = useReducer(
  (state, action) => action, // reducer 直接返回 action 作为新状态
  0
);
// dispatch(5) 等价于 setCount(5)
```

**选择建议：**

| 场景                       | 推荐                   |
| -------------------------- | ---------------------- |
| 单个简单状态               | `useState`             |
| 状态更新逻辑复杂           | `useReducer`           |
| 多个相关状态               | `useReducer`           |
| 状态更新依赖于 action 类型 | `useReducer`           |
| 状态结构深层嵌套           | `useReducer`           |
| 需要在子组件触发更新       | `useReducer` + Context |

#### 完整示例：表单状态管理

```tsx
interface FormState {
  name: string;
  email: string;
  password: string;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

type FormAction =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_FAILURE'; errors: Record<string, string> }
  | { type: 'RESET' };

const initialState: FormState = {
  name: '',
  email: '',
  password: '',
  errors: {},
  isSubmitting: false,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: '' }, // 清除该字段错误
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, errors: {} };
    case 'SUBMIT_SUCCESS':
      return initialState; // 重置表单
    case 'SUBMIT_FAILURE':
      return { ...state, isSubmitting: false, errors: action.errors };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function RegistrationForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT_START' });

    try {
      await api.register(state);
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'SUBMIT_FAILURE', errors: error.errors });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={state.name}
        onChange={(e) =>
          dispatch({
            type: 'SET_FIELD',
            field: 'name',
            value: e.target.value,
          })
        }
      />
      {state.errors.name && <span>{state.errors.name}</span>}
      {/* ... */}
    </form>
  );
}
```

#### 高级模式：状态机

`useReducer` 非常适合实现**有限状态机**：

```tsx
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

type FetchAction<T> =
  | { type: 'FETCH' }
  | { type: 'SUCCESS'; data: T }
  | { type: 'ERROR'; error: Error }
  | { type: 'RESET' };

function fetchReducer<T>(state: FetchState<T>, action: FetchAction<T>): FetchState<T> {
  switch (action.type) {
    case 'FETCH':
      return { status: 'loading' };
    case 'SUCCESS':
      return { status: 'success', data: action.data };
    case 'ERROR':
      return { status: 'error', error: action.error };
    case 'RESET':
      return { status: 'idle' };
    default:
      return state;
  }
}

function useFetch<T>(url: string) {
  const [state, dispatch] = useReducer(fetchReducer<T>, { status: 'idle' });

  const execute = useCallback(async () => {
    dispatch({ type: 'FETCH' });
    try {
      const response = await fetch(url);
      const data = await response.json();
      dispatch({ type: 'SUCCESS', data });
    } catch (error) {
      dispatch({ type: 'ERROR', error: error as Error });
    }
  }, [url]);

  return { state, execute, reset: () => dispatch({ type: 'RESET' }) };
}

// 使用
function UserProfile({ userId }: { userId: string }) {
  const { state, execute } = useFetch<User>(`/api/users/${userId}`);

  useEffect(() => {
    execute();
  }, [execute]);

  // TypeScript 会根据 status 自动收窄类型！
  switch (state.status) {
    case 'idle':
      return <div>点击加载</div>;
    case 'loading':
      return <Spinner />;
    case 'success':
      return <div>{state.data.name}</div>; // state.data 类型正确
    case 'error':
      return <div>Error: {state.error.message}</div>; // state.error 类型正确
  }
}
```

#### 惰性初始化

```tsx
function init(initialCount: number): State {
  // 复杂的初始化逻辑
  return { count: initialCount, history: [initialCount] };
}

function Counter({ initialCount }: { initialCount: number }) {
  // init 函数只在首次渲染时调用
  const [state, dispatch] = useReducer(reducer, initialCount, init);

  // 重置时可以复用 init 函数
  const handleReset = () => {
    dispatch({ type: 'RESET', payload: initialCount });
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'RESET':
      return init(action.payload); // 复用初始化逻辑
    // ...
  }
}
```

#### 配合 Context 实现跨组件状态管理

```tsx
// store.tsx
const StateContext = createContext<State | null>(null);
const DispatchContext = createContext<Dispatch<Action> | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// 自定义 hooks
export function useAppState() {
  const context = useContext(StateContext);
  if (!context) throw new Error('useAppState must be used within StoreProvider');
  return context;
}

export function useAppDispatch() {
  const context = useContext(DispatchContext);
  if (!context) throw new Error('useAppDispatch must be used within StoreProvider');
  return context;
}

// 分离 State 和 Dispatch 的好处：
// - dispatch 引用稳定，不会导致依赖它的组件重渲染
// - 只需要触发 action 的组件不会因为 state 变化而重渲染
```

---

### 1.3 useSyncExternalStore (React 18)

`useSyncExternalStore` 用于订阅外部数据源，是 React 18 并发模式下保证**数据一致性**的关键 Hook。

#### 为什么需要这个 Hook？

在 React 18 的并发模式下，渲染可能被中断和恢复。如果在渲染过程中外部数据源发生变化，可能出现**撕裂问题（Tearing）**：

```
时间线:
  t1: 渲染组件A，读取 store.value = 1
  t2: (高优先级任务中断渲染)
  t3: store.value 被更新为 2
  t4: 继续渲染组件B，读取 store.value = 2

结果: 同一次渲染中，A 和 B 看到了不同的值！这就是撕裂。
```

#### 基本定义

```tsx
const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?);
```

- **subscribe**：订阅函数，当数据源变化时调用传入的 callback
- **getSnapshot**：获取当前数据快照的函数
- **getServerSnapshot**：（可选）SSR 时获取初始数据的函数

#### 原理解析

```tsx
function useSyncExternalStore<T>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => T,
  getServerSnapshot?: () => T
): T {
  // 1. 获取当前快照
  const value = getSnapshot();

  // 2. 渲染期间如果快照变化，强制同步重渲染
  //    这就是 "Sync" 的含义 - 同步地保证一致性

  // 3. 订阅变化，变化时触发重渲染
  useEffect(() => {
    const handleChange = () => {
      // 检查快照是否真的变化了
      // 使用 Object.is 比较
    };
    return subscribe(handleChange);
  }, [subscribe]);

  return value;
}
```

#### 实战示例：订阅浏览器 API

**1. 订阅网络状态：**

```tsx
function useOnlineStatus() {
  return useSyncExternalStore(
    // subscribe
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    // getSnapshot
    () => navigator.onLine,
    // getServerSnapshot (SSR 假设在线)
    () => true
  );
}

function StatusBar() {
  const isOnline = useOnlineStatus();
  return <div>{isOnline ? '🟢 在线' : '🔴 离线'}</div>;
}
```

**2. 订阅 URL hash：**

```tsx
function useHash() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('hashchange', callback);
      return () => window.removeEventListener('hashchange', callback);
    },
    () => window.location.hash,
    () => '' // SSR 时没有 hash
  );
}
```

**3. 订阅媒体查询：**

```tsx
function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', callback);
      return () => mediaQuery.removeEventListener('change', callback);
    },
    () => window.matchMedia(query).matches,
    () => false // SSR 默认值
  );
}

function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
```

#### 与外部状态库集成

这个 Hook 是 Zustand、Redux 等状态管理库的底层基础：

```tsx
// 简化的 Zustand 实现原理
function createStore<T>(createState: (set: SetState<T>) => T) {
  let state: T;
  const listeners = new Set<() => void>();

  const setState = (partial: Partial<T>) => {
    state = { ...state, ...partial };
    listeners.forEach((listener) => listener());
  };

  state = createState(setState);

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const getState = () => state;

  // useStore hook
  function useStore<U>(selector: (state: T) => U): U {
    return useSyncExternalStore(
      subscribe,
      () => selector(getState()),
      () => selector(getState())
    );
  }

  return { useStore, getState, setState };
}
```

#### 重要注意事项

**getSnapshot 必须返回不可变数据：**

```tsx
// ❌ 错误：每次调用都返回新对象
const getSnapshot = () => ({
  todos: store.todos,
  count: store.count,
}); // 每次都是新引用，会无限循环！

// ✅ 正确：返回稳定引用或使用选择器
const getSnapshot = () => store.state; // 返回整个 state

// ✅ 或者使用 useMemo 缓存
function useSelectedState() {
  const state = useSyncExternalStore(subscribe, getSnapshot);
  return useMemo(
    () => ({
      todos: state.todos,
      count: state.count,
    }),
    [state.todos, state.count]
  );
}
```

---

### 1.4 useTransition (React 18)

`useTransition` 是 React 18 并发特性的核心，用于将某些状态更新标记为**非紧急（低优先级）**，保持 UI 响应性。

#### 基本定义

```tsx
const [isPending, startTransition] = useTransition();
```

- **isPending**：布尔值，表示过渡是否正在进行
- **startTransition**：将状态更新标记为 transition 的函数

#### 底层原理：优先级调度

React 18 引入了**优先级**概念：

```
高优先级（Urgent）:
  - 用户输入（点击、键盘输入）
  - 悬停、聚焦
  - 这些更新会立即执行

低优先级（Transition）:
  - 通过 startTransition 包裹的更新
  - 可以被高优先级更新打断
  - 在空闲时执行
```

**执行流程：**

```
用户输入 "abc"
  ├─ "a" 输入 → 高优先级，立即更新输入框显示 "a"
  │           └─ 触发 transition: 过滤列表 (低优先级，排队)
  ├─ "b" 输入 → 高优先级，立即更新输入框显示 "ab"
  │           └─ 之前的 transition 被丢弃
  │           └─ 触发新 transition: 过滤列表 (低优先级，排队)
  ├─ "c" 输入 → 高优先级，立即更新输入框显示 "abc"
  │           └─ 之前的 transition 被丢弃
  │           └─ 触发新 transition: 过滤列表 (低优先级，排队)
  └─ 用户停止输入 → transition 执行，显示过滤后的列表
```

#### 实战示例：搜索过滤

```tsx
function SearchableList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 立即更新输入框（高优先级）
    setQuery(value);

    // 延迟更新列表（低优先级）
    startTransition(() => {
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
    });
  };

  return (
    <div>
      <input value={query} onChange={handleSearch} />

      {/* 显示加载指示器 */}
      {isPending && <Spinner />}

      {/* 即使在过滤中，列表也会显示旧数据，不会卡顿 */}
      <List items={filteredItems} style={{ opacity: isPending ? 0.7 : 1 }} />
    </div>
  );
}
```

#### 实战示例：Tab 切换

```tsx
function TabContainer() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (newTab: string) => {
    startTransition(() => {
      setTab(newTab);
    });
  };

  return (
    <div>
      <TabButtons activeTab={tab} onTabChange={handleTabChange} isPending={isPending} />

      {/* 使用 Suspense 配合 */}
      <Suspense fallback={<Skeleton />}>
        {tab === 'home' && <HomeTab />}
        {tab === 'profile' && <ProfileTab />}
        {tab === 'settings' && <SettingsTab />}
      </Suspense>
    </div>
  );
}
```

#### 与 setTimeout/防抖的区别

| 特性     | useTransition    | setTimeout/防抖      |
| -------- | ---------------- | -------------------- |
| 调度方式 | React 智能调度   | 固定延迟             |
| 可中断性 | 可被新输入打断   | 无法中断已安排的任务 |
| 时机     | 基于浏览器空闲   | 固定时间后执行       |
| 响应性   | 始终保持输入响应 | 可能有固定延迟感     |

```tsx
// ❌ setTimeout 方式：固定延迟，不够灵活
const handleSearch = (value: string) => {
  setQuery(value);
  clearTimeout(timer);
  timer = setTimeout(() => {
    setFilteredItems(filter(items, value));
  }, 300); // 总是等 300ms
};

// ✅ useTransition：React 智能调度
const handleSearch = (value: string) => {
  setQuery(value);
  startTransition(() => {
    setFilteredItems(filter(items, value));
  }); // 在浏览器空闲时执行，快速设备可能立即完成
};
```

---

### 1.5 useDeferredValue (React 18)

`useDeferredValue` 延迟更新某个值，让你在保持 UI 响应的同时处理昂贵的渲染。

#### 基本定义

```tsx
const deferredValue = useDeferredValue(value);
```

#### 与 useTransition 的区别

| 特性     | useTransition     | useDeferredValue |
| -------- | ----------------- | ---------------- |
| 控制对象 | 状态更新函数      | 值本身           |
| 使用场景 | 你能控制 setState | 你只能接收 props |
| 语法     | 包裹更新逻辑      | 包裹值           |

```tsx
// useTransition：你控制状态更新
const [isPending, startTransition] = useTransition();
startTransition(() => {
  setSearchResults(results);
});

// useDeferredValue：你只接收值
function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  // deferredQuery 会延迟更新
}
```

#### 实战示例：大列表渲染优化

```tsx
function HugeList({ query }: { query: string }) {
  // query 立即更新，但 deferredQuery 会延迟
  const deferredQuery = useDeferredValue(query);

  // 判断是否正在等待（通过比较两个值）
  const isStale = query !== deferredQuery;

  // 使用 useMemo 避免不必要的重计算
  const filteredItems = useMemo(() => {
    return hugeArray.filter((item) => item.name.includes(deferredQuery));
  }, [deferredQuery]); // 依赖 deferred 值

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      {filteredItems.map((item) => (
        <ExpensiveItem key={item.id} data={item} />
      ))}
    </div>
  );
}

function App() {
  const [query, setQuery] = useState('');

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {/* 输入框立即响应，列表延迟更新 */}
      <HugeList query={query} />
    </div>
  );
}
```

#### 结合 Suspense 使用

```tsx
function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />

      <Suspense fallback={<Loading />}>
        {/* 使用 deferred 值，Suspense 不会立即显示 fallback */}
        <SearchResults query={deferredQuery} style={{ opacity: isStale ? 0.7 : 1 }} />
      </Suspense>
    </div>
  );
}
```

---

## 二、 Hooks 之执行副作用

### 2.1 useEffect

`useEffect` 是 React 中处理**副作用**的核心 Hook，用于与外部系统同步。

#### 基本定义

```tsx
useEffect(() => {
  // 副作用逻辑（setup）

  return () => {
    // 清理逻辑（cleanup）
  };
}, [dependencies]);
```

#### 执行时机详解

理解 useEffect 的执行时机至关重要：

```
组件渲染流程:
  1. 执行函数组件体（计算状态、创建 JSX）
  2. React 计算 DOM diff
  3. React 将变更提交到 DOM（Commit 阶段）
  4. 浏览器绘制屏幕（Paint）
  5. useEffect 回调异步执行 ← 在这里！

注意：useEffect 是异步的，不会阻塞绘制
```

```tsx
function Example() {
  console.log('1. 渲染');

  useEffect(() => {
    console.log('3. Effect 执行（浏览器绘制后）');
    return () => console.log('4. Cleanup（下次 effect 前/卸载时）');
  });

  console.log('2. 渲染完成');

  return <div>Hello</div>;
}

// 输出顺序：
// 1. 渲染
// 2. 渲染完成
// (浏览器绘制)
// 3. Effect 执行
```

#### 依赖数组详解

```tsx
// 1. 没有依赖数组：每次渲染后都执行
useEffect(() => {
  console.log('每次渲染后执行');
});

// 2. 空依赖数组：仅挂载和卸载时执行
useEffect(() => {
  console.log('组件挂载');
  return () => console.log('组件卸载');
}, []);

// 3. 有依赖：依赖变化时执行
useEffect(() => {
  console.log(`count 变为 ${count}`);
  return () => console.log(`清理 count=${count} 的 effect`);
}, [count]);
```

#### 依赖项的正确处理

**原则：effect 中用到的所有响应式值都应该在依赖数组中**

```tsx
// ❌ 错误：遗漏依赖
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults(query).then(setResults);
  }, []); // 遗漏 query！query 变化时不会重新请求
}

// ✅ 正确：包含所有依赖
useEffect(() => {
  fetchResults(query).then(setResults);
}, [query]);

// ✅ 如果不需要依赖某个值，重构代码
useEffect(() => {
  // 使用函数式更新，不依赖 count
  setCount((c) => c + 1);
}, []); // 合法的空依赖
```

#### 清理函数的重要性

```tsx
// 1. 清理订阅
useEffect(() => {
  const subscription = dataSource.subscribe(handleChange);
  return () => subscription.unsubscribe();
}, []);

// 2. 清理定时器
useEffect(() => {
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
}, []);

// 3. 清理事件监听
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

// 4. 清理异步请求（避免更新已卸载组件）
useEffect(() => {
  let cancelled = false;

  async function fetchData() {
    const data = await api.getData(id);
    if (!cancelled) {
      setData(data);
    }
  }

  fetchData();

  return () => {
    cancelled = true;
  };
}, [id]);

// 5. 使用 AbortController（推荐）
useEffect(() => {
  const controller = new AbortController();

  async function fetchData() {
    try {
      const response = await fetch(url, {
        signal: controller.signal,
      });
      const data = await response.json();
      setData(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error);
      }
    }
  }

  fetchData();

  return () => controller.abort();
}, [url]);
```

#### 常见错误与解决方案

**1. 无限循环**

```tsx
// ❌ 无限循环：每次渲染创建新对象
useEffect(() => {
  setUser({ name: 'John' }); // 新对象 → 触发渲染 → 又执行 effect
}, [user]); // user 每次都是新引用

// ✅ 解决：不依赖对象，或使用 useMemo
const user = useMemo(() => ({ name }), [name]);
```

**2. Effect 里的陈旧闭包**

```tsx
// ❌ 问题：总是获取旧的 count
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count); // 永远是 0
  }, 1000);
  return () => clearInterval(timer);
}, []); // 空依赖，闭包捕获初始值

// ✅ 解决方案 1：添加依赖
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count);
  }, 1000);
  return () => clearInterval(timer);
}, [count]); // 每次 count 变化重建 timer

// ✅ 解决方案 2：使用 ref
const countRef = useRef(count);
countRef.current = count;

useEffect(() => {
  const timer = setInterval(() => {
    console.log(countRef.current); // 总是最新
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

**3. 不必要的 Effect**

```tsx
// ❌ 不需要 Effect：派生状态应该直接计算
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState('');

useEffect(() => {
  setFullName(firstName + ' ' + lastName);
}, [firstName, lastName]);

// ✅ 直接计算
const fullName = firstName + ' ' + lastName;

// ✅ 如果计算昂贵，使用 useMemo
const fullName = useMemo(() => expensiveCalculation(firstName, lastName), [firstName, lastName]);
```

#### 项目实践

```tsx
// 数据获取
useEffect(() => {
  async function loadUser() {
    setLoading(true);
    try {
      const data = await fetchUser(userId);
      setUser(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }
  loadUser();
}, [userId]);

// 同步到 localStorage
useEffect(() => {
  localStorage.setItem('theme', theme);
}, [theme]);

// 订阅 WebSocket
useEffect(() => {
  const ws = new WebSocket(url);
  ws.onmessage = (event) => {
    setMessages((prev) => [...prev, JSON.parse(event.data)]);
  };
  return () => ws.close();
}, [url]);
```

---

### 2.2 useLayoutEffect

`useLayoutEffect` 与 `useEffect` 的 API 完全相同，但**执行时机不同**。

#### 执行时机对比

```
useEffect:
  渲染 → DOM 更新 → 浏览器绘制 → useEffect 执行（异步）

useLayoutEffect:
  渲染 → DOM 更新 → useLayoutEffect 执行（同步） → 浏览器绘制
```

#### 何时使用 useLayoutEffect？

**当你需要在浏览器绘制前同步读取/修改 DOM 时**：

```tsx
// 场景 1：测量 DOM 尺寸
function Tooltip({ targetRef, children }) {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // ❌ useEffect：可能闪烁
  // useEffect(() => {
  //   const rect = targetRef.current.getBoundingClientRect();
  //   setPosition({ top: rect.bottom, left: rect.left });
  // }, []);

  // ✅ useLayoutEffect：测量后立即更新位置，绘制前完成
  useLayoutEffect(() => {
    const rect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + 8,
      left: rect.left + (rect.width - tooltipRect.width) / 2,
    });
  }, []);

  return (
    <div ref={tooltipRef} style={{ position: 'fixed', top: position.top, left: position.left }}>
      {children}
    </div>
  );
}
```

```tsx
// 场景 2：滚动位置恢复
function ChatMessages({ messages }) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    // 新消息到达时滚动到底部
    // 使用 useLayoutEffect 避免闪烁
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  return (
    <div ref={containerRef} style={{ overflow: 'auto', height: 400 }}>
      {messages.map((msg) => (
        <Message key={msg.id} {...msg} />
      ))}
    </div>
  );
}
```

```tsx
// 场景 3：同步动画
function AnimatedHeight({ children, isOpen }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (isOpen) {
      // 测量内容高度
      const contentHeight = ref.current.scrollHeight;
      setHeight(contentHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div
      ref={ref}
      style={{
        height,
        overflow: 'hidden',
        transition: 'height 300ms ease',
      }}
    >
      {children}
    </div>
  );
}
```

#### 性能注意事项

```tsx
// ⚠️ useLayoutEffect 会阻塞绘制
useLayoutEffect(() => {
  // 这里的代码会延迟页面显示
  heavyComputation(); // 避免耗时操作！
}, []);

// ✅ 大多数情况使用 useEffect
useEffect(() => {
  heavyComputation(); // 不阻塞绘制
}, []);
```

---

### 2.3 useInsertionEffect (React 18)

`useInsertionEffect` 在 DOM 变更**之前**执行，专为 **CSS-in-JS 库**设计。

#### 执行时机

```
useInsertionEffect → DOM 变更 → useLayoutEffect → 绘制 → useEffect
```

#### 使用场景

**99% 的开发者不需要直接使用这个 Hook**，它是给 CSS-in-JS 库（如 styled-components、Emotion）的作者用的：

```tsx
// CSS-in-JS 库内部实现示例
let isInserted = new Set();

function useCSS(rule: string) {
  useInsertionEffect(() => {
    if (!isInserted.has(rule)) {
      isInserted.add(rule);
      // 在 DOM 变更前注入样式
      const style = document.createElement('style');
      style.textContent = rule;
      document.head.appendChild(style);
    }
  }, [rule]);

  return rule;
}

// 使用
function Button() {
  const className = useCSS('.my-button { color: red; }');
  return <button className="my-button">Click</button>;
}
```

**为什么需要在 DOM 变更前？**

- 如果在 useLayoutEffect 中注入样式，DOM 已经存在但样式还没有
- 可能导致一帧的样式闪烁
- useInsertionEffect 确保样式在 DOM 元素创建前就绑定好

---

## 三、 Hooks 之状态获取与传递

### 3.1 useContext

`useContext` 用于访问 React Context，解决**跨层级组件通信**问题。

#### 基本定义

```tsx
const value = useContext(SomeContext);
```

#### Context 工作原理

```tsx
// 1. 创建 Context
const ThemeContext = createContext<Theme>('light');

// 2. 提供 Context
function App() {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <ThemeContext.Provider value={theme}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// 3. 消费 Context（useContext 方式）
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Themed</button>;
}
```

#### Context 的性能问题

**问题：Provider value 变化时，所有消费者都会重渲染**

```tsx
function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  // ❌ 问题：每次渲染创建新对象
  const value = { user, theme, setUser, setTheme };

  return (
    <AppContext.Provider value={value}>
      {/* 每次 App 渲染，所有消费者都重渲染！ */}
      <LargeTree />
    </AppContext.Provider>
  );
}
```

#### 性能优化方案

**方案 1：拆分 Context**

```tsx
// 将不同更新频率的数据分离
const UserContext = createContext(null);
const ThemeContext = createContext('light');
const ActionsContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  // actions 引用稳定
  const actions = useMemo(
    () => ({
      setUser,
      setTheme,
    }),
    []
  );

  return (
    <UserContext.Provider value={user}>
      <ThemeContext.Provider value={theme}>
        <ActionsContext.Provider value={actions}>
          <LargeTree />
        </ActionsContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}

// 只关心 theme 的组件不会因 user 变化而重渲染
function ThemeDisplay() {
  const theme = useContext(ThemeContext);
  return <div>{theme}</div>;
}
```

**方案 2：useMemo 稳定 value**

```tsx
function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  // ✅ 只有依赖变化时才创建新对象
  const value = useMemo(
    () => ({
      user,
      theme,
      setUser,
      setTheme,
    }),
    [user, theme]
  );

  return (
    <AppContext.Provider value={value}>
      <LargeTree />
    </AppContext.Provider>
  );
}
```

**方案 3：状态下移（State Colocation）**

```tsx
// ❌ 在顶层管理所有状态
function App() {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <SelectionContext.Provider value={selectedId}>
      <BigList onSelect={setSelectedId} />
    </SelectionContext.Provider>
  );
}

// ✅ 将状态移到需要它的地方
function BigList() {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div>
      {items.map((item) => (
        <ListItem
          key={item.id}
          isSelected={item.id === selectedId}
          onSelect={() => setSelectedId(item.id)}
        />
      ))}
    </div>
  );
}
```

**方案 4：使用选择器模式（需要外部库或自定义实现）**

```tsx
// 使用 use-context-selector 等库
import { createContext, useContextSelector } from 'use-context-selector';

const Context = createContext({ user: null, theme: 'light' });

function UserDisplay() {
  // 只有 user 变化时才重渲染
  const user = useContextSelector(Context, (state) => state.user);
  return <div>{user?.name}</div>;
}
```

#### 最佳实践：创建 Context Hook

```tsx
// contexts/AuthContext.tsx
interface AuthContextValue {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// 自定义 Hook，提供类型安全和错误提示
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(async (credentials: Credentials) => {
    const user = await authApi.login(credentials);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  // 引用稳定的 value
  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isLoading,
    }),
    [user, login, logout, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 使用
function Profile() {
  const { user, logout } = useAuth();
  // ...
}
```

---

### 3.2 useRef

`useRef` 返回一个可变的 ref 对象，其 `.current` 属性在组件的整个生命周期内保持不变。

#### 基本定义

```tsx
const ref = useRef(initialValue);
// ref.current 可以读写
```

#### 两种主要用途

**1. 访问 DOM 元素**

```tsx
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>聚焦</button>
    </>
  );
}
```

**2. 保存可变值（不触发重渲染）**

```tsx
function Timer() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const start = () => {
    // 保存 interval ID
    intervalRef.current = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);
  };

  const stop = () => {
    // 使用保存的 ID 清除定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div>
      <span>{count}</span>
      <button onClick={start}>开始</button>
      <button onClick={stop}>停止</button>
    </div>
  );
}
```

#### useRef vs useState

| 特性               | useRef                    | useState          |
| ------------------ | ------------------------- | ----------------- |
| 更新是否触发重渲染 | ❌ 否                     | ✅ 是             |
| 更新时机           | 立即同步更新              | 下次渲染时更新    |
| 值的可变性         | `.current` 可直接修改     | 必须通过 setState |
| 适用场景           | DOM 引用、计时器 ID、缓存 | UI 状态           |

```tsx
// 对比示例
function Comparison() {
  const [stateCount, setStateCount] = useState(0);
  const refCount = useRef(0);

  const handleClick = () => {
    // ref 立即更新
    refCount.current++;
    console.log('ref:', refCount.current); // 立即看到新值

    // state 异步更新
    setStateCount(stateCount + 1);
    console.log('state:', stateCount); // 还是旧值
  };

  return (
    <div>
      <p>State: {stateCount}</p>
      {/* ref 变化不会触发渲染，这里显示旧值 */}
      <p>Ref: {refCount.current}</p>
      <button onClick={handleClick}>+1</button>
    </div>
  );
}
```

#### 高级用法：回调 Ref

当你需要在 ref 附加/分离时执行逻辑：

```tsx
function MeasureExample() {
  const [height, setHeight] = useState(0);

  // 回调 ref：元素挂载/卸载时调用
  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);

  return (
    <>
      <div ref={measuredRef}>内容...</div>
      <p>高度: {height}px</p>
    </>
  );
}
```

#### 实用场景：保存前一个值

```tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  // 返回 effect 更新前的旧值
  return ref.current;
}

// 使用
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>
        当前: {count}, 之前: {prevCount}
      </p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}
```

#### 实用场景：最新值引用（解决闭包问题）

```tsx
function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value; // 每次渲染更新
  return ref;
}

// 使用
function EventListener() {
  const [count, setCount] = useState(0);
  const latestCount = useLatest(count);

  useEffect(() => {
    const handler = () => {
      // 使用 ref 获取最新值，避免闭包问题
      console.log('最新 count:', latestCount.current);
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []); // 空依赖，但仍能获取最新值
}
```

---

### 3.3 useImperativeHandle

`useImperativeHandle` 用于自定义暴露给父组件的实例值，配合 `forwardRef` 使用。

#### 基本定义

```tsx
useImperativeHandle(ref, createHandle, dependencies?)
```

#### 使用场景

**默认情况下，函数组件没有实例，无法直接使用 ref：**

```tsx
// ❌ 这样不行
function MyInput() {
  return <input />;
}

function Parent() {
  const ref = useRef(null);
  ref.current.focus(); // ref.current 是 null！
  return <MyInput ref={ref} />; // 警告：函数组件不能接收 ref
}
```

**使用 forwardRef + useImperativeHandle：**

```tsx
interface InputHandle {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

const MyInput = forwardRef<InputHandle, InputProps>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // 自定义暴露的方法
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      clear: () => {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      },
      getValue: () => {
        return inputRef.current?.value ?? '';
      },
    }),
    []
  ); // 依赖数组

  return <input ref={inputRef} {...props} />;
});

// 父组件使用
function Form() {
  const inputRef = useRef<InputHandle>(null);

  const handleSubmit = () => {
    const value = inputRef.current?.getValue();
    console.log(value);
    inputRef.current?.clear();
  };

  return (
    <>
      <MyInput ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>聚焦</button>
      <button onClick={handleSubmit}>提交</button>
    </>
  );
}
```

#### 实战示例：复杂组件封装

```tsx
interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ src, poster, onTimeUpdate }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(
      ref,
      () => ({
        play: () => videoRef.current?.play(),
        pause: () => videoRef.current?.pause(),
        seek: (time: number) => {
          if (videoRef.current) {
            videoRef.current.currentTime = time;
          }
        },
        getCurrentTime: () => videoRef.current?.currentTime ?? 0,
      }),
      []
    );

    return <video ref={videoRef} src={src} poster={poster} onTimeUpdate={onTimeUpdate} />;
  }
);

// 使用
function App() {
  const playerRef = useRef<VideoPlayerHandle>(null);

  return (
    <>
      <VideoPlayer ref={playerRef} src="/video.mp4" />
      <button onClick={() => playerRef.current?.play()}>播放</button>
      <button onClick={() => playerRef.current?.seek(30)}>跳到 30s</button>
    </>
  );
}
```

#### 最佳实践

1. **最小化暴露**：只暴露必要的方法，不要暴露整个内部实现
2. **避免滥用**：优先使用 props 和状态提升，命令式 ref 是最后手段
3. **类型安全**：始终定义清晰的 Handle 接口

```tsx
// ❌ 避免：暴露太多内部细节
useImperativeHandle(ref, () => ({
  internalState,
  internalMethod1,
  internalMethod2,
  // ...
}));

// ✅ 推荐：只暴露公共 API
useImperativeHandle(ref, () => ({
  focus,
  blur,
  scrollIntoView,
}));
```

---

## 四、 Hooks 之状态派生与保存（性能优化）

### 4.1 useMemo

`useMemo` 用于缓存**计算结果**，避免每次渲染都执行昂贵的计算。

#### 基本定义

```tsx
const cachedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

#### 工作原理

```
首次渲染:
  useMemo(() => compute(a, b), [a, b])
  → 执行 compute，缓存结果

后续渲染:
  1. 比较依赖 [a, b] 是否变化（Object.is）
  2. 如果没变 → 返回缓存的结果
  3. 如果变了 → 重新计算，更新缓存
```

#### 何时使用 useMemo？

**1. 昂贵的计算**

```tsx
function ProductList({ products, filterText }) {
  // ✅ 过滤大列表是昂贵操作
  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [products, filterText]);

  return <List items={filteredProducts} />;
}
```

**2. 保持引用稳定（传递给优化过的子组件）**

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 每次渲染创建新对象，子组件总是重渲染
  const style = { color: 'red' };

  // ✅ 引用稳定，子组件不会不必要地重渲染
  const style = useMemo(() => ({ color: 'red' }), []);

  return <MemoizedChild style={style} />;
}

const MemoizedChild = React.memo(({ style }) => {
  console.log('Child rendered');
  return <div style={style}>Hello</div>;
});
```

**3. 作为其他 Hook 的依赖**

```tsx
function SearchResults({ query, filters }) {
  // ✅ 引用稳定，避免 effect 不必要地执行
  const searchOptions = useMemo(
    () => ({
      query,
      ...filters,
    }),
    [query, filters]
  );

  useEffect(() => {
    search(searchOptions);
  }, [searchOptions]); // 依赖稳定的对象
}
```

#### 何时不需要 useMemo？

```tsx
// ❌ 简单计算，useMemo 的开销可能大于计算本身
const doubled = useMemo(() => count * 2, [count]);
// ✅ 直接计算
const doubled = count * 2;

// ❌ 原始值不需要 memo
const name = useMemo(() => 'John', []);
// ✅ 直接使用
const name = 'John';

// ❌ 没有被传递给优化过的组件或作为依赖
const data = useMemo(() => ({ a: 1 }), []);
return <NormalChild data={data} />; // NormalChild 没有用 memo
// ✅ 不需要 memo
const data = { a: 1 };
```

#### 常见误区

```tsx
// ❌ 误区 1：useMemo 内部的函数每次都会创建
const memoizedValue = useMemo(() => {
  const innerFn = () => doSomething(); // 每次重新计算都创建新函数
  return innerFn();
}, [dep]);

// ❌ 误区 2：认为 useMemo 阻止子组件渲染
function Parent() {
  const data = useMemo(() => ({ a: 1 }), []);
  // useMemo 只保证引用稳定
  // 子组件是否重渲染取决于子组件是否使用 React.memo
  return <Child data={data} />;
}

// ❌ 误区 3：过度使用
// 每个 useMemo 都有比较依赖的开销
// 如果计算很简单，useMemo 反而更慢
```

---

### 4.2 useCallback

`useCallback` 用于缓存**函数引用**，避免每次渲染都创建新函数。

#### 基本定义

```tsx
const cachedFn = useCallback(fn, dependencies);

// 等价于
const cachedFn = useMemo(() => fn, dependencies);
```

#### 何时使用 useCallback？

**1. 传递给 React.memo 优化的子组件**

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 每次渲染创建新函数，子组件总是重渲染
  const handleClick = () => {
    console.log('clicked');
  };

  // ✅ 函数引用稳定
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <MemoizedButton onClick={handleClick} />;
}

const MemoizedButton = React.memo(({ onClick }) => {
  console.log('Button rendered');
  return <button onClick={onClick}>Click</button>;
});
```

**2. 作为其他 Hook 的依赖**

```tsx
function SearchComponent({ query }) {
  // ✅ 函数引用稳定，effect 不会不必要地执行
  const search = useCallback(() => {
    fetchResults(query);
  }, [query]);

  useEffect(() => {
    search();
  }, [search]);
}
```

**3. 自定义 Hook 返回的函数**

```tsx
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  // ✅ 返回稳定的函数引用
  const increment = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount((c) => c - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}
```

#### 常见误区

```tsx
// ❌ 误区 1：所有函数都用 useCallback
function Form() {
  // 不需要！这个函数没有作为依赖或传递给优化过的组件
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    submit();
  }, []);

  // ✅ 直接定义即可
  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// ❌ 误区 2：忘记依赖
const handleClick = useCallback(() => {
  console.log(count); // 使用了 count
}, []); // 但没有添加到依赖！永远打印旧值

// ✅ 正确
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);

// ❌ 误区 3：子组件没有用 memo，useCallback 就没意义
function Parent() {
  const handleClick = useCallback(() => {}, []);
  return <Child onClick={handleClick} />; // Child 没有 memo，照样重渲染
}
```

#### useCallback 与 useMemo 的关系

```tsx
// 这两个是等价的
const memoizedFn = useCallback(fn, deps);
const memoizedFn = useMemo(() => fn, deps);

// useCallback 是 useMemo 的语法糖
// useCallback(fn, deps) 就是 useMemo(() => fn, deps) 的简写
```

#### 性能优化决策树

```
函数需要 useCallback 吗？
  ├─ 传递给 React.memo 包裹的子组件？ → ✅ 需要
  ├─ 作为 useEffect/useMemo/useCallback 的依赖？ → ✅ 需要
  ├─ 作为自定义 Hook 的返回值？ → ✅ 需要
  └─ 其他情况 → ❌ 不需要

值需要 useMemo 吗？
  ├─ 计算成本高（大数组过滤/排序/复杂计算）？ → ✅ 需要
  ├─ 作为 React.memo 组件的 prop？ → ✅ 需要
  ├─ 作为其他 Hook 的依赖？ → ✅ 需要
  └─ 简单计算或不传递给优化过的组件？ → ❌ 不需要
```

---

## 五、 Hooks 之工具

### 5.1 useDebugValue

`useDebugValue` 用于在 React DevTools 中为自定义 Hook 添加标签。

#### 基本使用

```tsx
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  // 在 DevTools 中显示 "OnlineStatus: Online" 或 "OnlineStatus: Offline"
  useDebugValue(isOnline ? 'Online' : 'Offline');

  // ...
  return isOnline;
}
```

#### 延迟格式化

```tsx
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);

  // 第二个参数是格式化函数，只在 DevTools 打开时执行
  useDebugValue(user, (user) => (user ? user.name : 'Loading...'));

  // ...
  return user;
}
```

#### 使用建议

- 主要用于**共享库**中的自定义 Hook
- 应用代码中的自定义 Hook 通常不需要
- 不要给每个 Hook 都加，只给重要的调试信息加

---

### 5.2 useId (React 18)

`useId` 生成在服务端和客户端之间**稳定的唯一 ID**，主要用于可访问性属性。

#### 为什么需要 useId？

在 SSR（服务端渲染）场景下，服务端和客户端需要生成相同的 ID：

```tsx
// ❌ 问题：Math.random() 在服务端和客户端生成不同的值
function Input() {
  const id = Math.random().toString(); // Hydration 不匹配！
  return (
    <>
      <label htmlFor={id}>Name</label>
      <input id={id} />
    </>
  );
}

// ✅ 使用 useId
function Input() {
  const id = useId(); // 服务端和客户端生成相同的 ID
  return (
    <>
      <label htmlFor={id}>Name</label>
      <input id={id} />
    </>
  );
}
```

#### 基本使用

```tsx
function PasswordField() {
  const passwordId = useId();
  const passwordHintId = useId();

  return (
    <>
      <label htmlFor={passwordId}>密码</label>
      <input id={passwordId} type="password" aria-describedby={passwordHintId} />
      <p id={passwordHintId}>密码至少 8 个字符</p>
    </>
  );
}
```

#### 为多个元素生成相关 ID

```tsx
function FormField({ label }) {
  const id = useId();

  return (
    <>
      <label htmlFor={`${id}-input`}>{label}</label>
      <input id={`${id}-input`} aria-describedby={`${id}-hint`} />
      <p id={`${id}-hint`}>提示信息</p>
    </>
  );
}
```

#### 注意事项

```tsx
// ❌ 不要用于列表的 key
function List({ items }) {
  return items.map((item) => (
    <li key={useId()}>{item}</li> // 错误！
  ));
}

// ✅ 列表 key 应该来自数据
function List({ items }) {
  return items.map((item) => <li key={item.id}>{item.name}</li>);
}
```

---

## 六、自定义 Hooks

自定义 Hook 是复用状态逻辑的主要方式。

#### 命名规范

- 必须以 `use` 开头（如 `useWindowSize`、`useFetch`）
- 这是 React 识别 Hook 的方式，影响 lint 规则

#### 常用自定义 Hook 模式

**1. 状态 + 副作用封装**

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  // 状态
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // 副作用：同步到 localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

// 使用
function App() {
  const [name, setName] = useLocalStorage('name', 'Guest');
}
```

**2. 订阅外部数据源**

```tsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// 使用 useSyncExternalStore 的版本（更推荐）
function useWindowSize() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    () => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }),
    () => ({ width: 0, height: 0 }) // SSR
  );
}
```

**3. 抽象复杂交互**

```tsx
function useHover<T extends HTMLElement>(): [RefObject<T>, boolean] {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return [ref, isHovered];
}

// 使用
function Tooltip() {
  const [hoverRef, isHovered] = useHover<HTMLDivElement>();

  return (
    <div ref={hoverRef}>
      Hover me
      {isHovered && <span>Tooltip!</span>}
    </div>
  );
}
```

**4. 防抖/节流**

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// 使用
function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      searchApi(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

**5. 数据获取**

```tsx
interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// 使用
function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error, refetch } = useFetch<User>(`/api/users/${userId}`);

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} onRetry={refetch} />;
  if (!user) return null;

  return <Profile user={user} />;
}
```

**6. 前一个值**

```tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// 使用
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      Now: {count}, Before: {prevCount ?? 'N/A'}
    </div>
  );
}
```

#### 自定义 Hook 最佳实践

1. **单一职责**：每个 Hook 只做一件事
2. **命名清晰**：名字应该表明 Hook 的用途
3. **返回值一致**：考虑返回对象还是数组
4. **处理边界情况**：加载、错误、空状态
5. **类型安全**：使用 TypeScript 定义完整类型

```tsx
// 返回数组：适合简单的值，支持自定义命名
const [value, setValue] = useLocalStorage('key', 'default');

// 返回对象：适合复杂返回值，不支持重命名但更清晰
const { data, loading, error, refetch } = useFetch('/api/data');
```

---

## 七、React 19 新增 Hooks

> React 19 引入了多个新 Hook，进一步简化常见模式。

### 7.1 use

`use` 是一个特殊的 Hook，可以读取 Promise 或 Context 的值。

```tsx
// 读取 Promise（配合 Suspense）
function Comments({ commentsPromise }) {
  // 在 Promise 解决前，组件会挂起
  const comments = use(commentsPromise);
  return comments.map((comment) => <p key={comment.id}>{comment}</p>);
}

// 读取 Context（可以在条件语句中使用！）
function HorizontalRule({ show }) {
  if (show) {
    const theme = use(ThemeContext);
    return <hr className={theme} />;
  }
  return null;
}
```

**与 useContext 的区别**：

- `use` 可以在条件语句和循环中使用
- `use` 可以读取 Promise
- `useContext` 只能在组件顶层使用

### 7.2 useOptimistic

用于**乐观更新**——在服务器响应前立即显示预期结果。

```tsx
function TodoList({ todos, addTodo }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    // 更新函数：返回乐观状态
    (state, newTodo) => [...state, { ...newTodo, sending: true }]
  );

  async function formAction(formData: FormData) {
    const title = formData.get('title') as string;
    // 立即显示乐观结果
    addOptimisticTodo({ id: Date.now(), title });
    // 发送请求（完成后 todos prop 会更新，乐观状态被替换）
    await addTodo(title);
  }

  return (
    <form action={formAction}>
      <input name="title" />
      <button type="submit">Add</button>
      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id} style={{ opacity: todo.sending ? 0.5 : 1 }}>
            {todo.title}
          </li>
        ))}
      </ul>
    </form>
  );
}
```

### 7.3 useFormStatus

获取父级 `<form>` 的提交状态。

```tsx
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  );
}

function Form() {
  async function submitAction(formData: FormData) {
    await saveToServer(formData);
  }

  return (
    <form action={submitAction}>
      <input name="name" />
      <SubmitButton /> {/* 自动获取表单状态 */}
    </form>
  );
}
```

### 7.4 useFormState (useActionState)

管理表单 action 的状态。

```tsx
import { useActionState } from 'react';

async function submitForm(prevState: State, formData: FormData) {
  const error = await validateAndSave(formData);
  if (error) {
    return { error };
  }
  return { success: true };
}

function Form() {
  const [state, formAction, isPending] = useActionState(submitForm, {});

  return (
    <form action={formAction}>
      <input name="email" />
      {state.error && <p className="error">{state.error}</p>}
      <button disabled={isPending}>{isPending ? '提交中...' : '提交'}</button>
    </form>
  );
}
```

---

## 八、Hooks 使用规则与常见陷阱

### 8.1 两条核心规则

**规则 1：只在顶层调用 Hooks**

```tsx
// ❌ 条件语句中
if (condition) {
  const [state, setState] = useState(0);
}

// ❌ 循环中
for (let i = 0; i < 5; i++) {
  useEffect(() => {});
}

// ❌ 嵌套函数中
function Component() {
  function nestedFn() {
    const [state, setState] = useState(0);
  }
}

// ✅ 组件顶层
function Component() {
  const [state, setState] = useState(0);

  if (condition) {
    // 使用 state
  }
}
```

**规则 2：只在 React 函数中调用 Hooks**

```tsx
// ❌ 普通 JavaScript 函数
function regularFunction() {
  const [state, setState] = useState(0); // 错误！
}

// ✅ React 函数组件
function ReactComponent() {
  const [state, setState] = useState(0);
}

// ✅ 自定义 Hook
function useCustomHook() {
  const [state, setState] = useState(0);
}
```

### 8.2 常见陷阱汇总

| 陷阱               | 问题                       | 解决方案                                 |
| ------------------ | -------------------------- | ---------------------------------------- |
| 闭包陷阱           | Effect 中获取陈旧值        | 函数式更新 / useRef                      |
| 无限循环           | 每次渲染创建新对象作为依赖 | useMemo 稳定引用                         |
| 遗漏依赖           | Effect 不响应变化          | 添加正确依赖 / eslint-plugin-react-hooks |
| 过度优化           | 到处用 useMemo/useCallback | 只在需要时使用                           |
| 竞态条件           | 请求响应顺序错乱           | cleanup 函数 / AbortController           |
| 状态更新后立即读取 | 读到旧值                   | 在下次渲染读取 / useRef                  |

### 8.3 ESLint 配置

```json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

## 总结

### Hooks 速查表

| Hook                 | 用途                        | 触发渲染 |
| -------------------- | --------------------------- | -------- |
| useState             | 状态管理                    | ✅       |
| useReducer           | 复杂状态管理                | ✅       |
| useContext           | 跨组件数据传递              | ✅       |
| useRef               | DOM 引用 / 缓存可变值       | ❌       |
| useEffect            | 副作用（异步）              | -        |
| useLayoutEffect      | 副作用（同步，DOM 后）      | -        |
| useInsertionEffect   | 副作用（DOM 前，CSS-in-JS） | -        |
| useMemo              | 缓存计算结果                | -        |
| useCallback          | 缓存函数                    | -        |
| useTransition        | 标记非紧急更新              | ✅       |
| useDeferredValue     | 延迟值更新                  | ✅       |
| useId                | 生成稳定唯一 ID             | ❌       |
| useSyncExternalStore | 订阅外部数据源              | ✅       |
| useImperativeHandle  | 自定义 ref 暴露值           | -        |
| useDebugValue        | DevTools 调试标签           | -        |

### 推荐学习资源

- [React 官方文档 - Hooks](https://react.dev/reference/react)
- [React 18 并发特性](https://react.dev/blog/2022/03/29/react-v18)
- [Dan Abramov - A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)
- [Kent C. Dodds - When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)

---

> 掌握 Hooks 的关键在于理解**闭包**、**依赖追踪**和**执行时机**。多写、多调试、多踩坑，才能真正掌握。
