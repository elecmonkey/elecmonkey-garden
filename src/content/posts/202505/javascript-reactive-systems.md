---
title: "JavaScript 响应式系统，从框架实现到 TC39 Signals"
date: "2025-05-07"
description: "四分五裂的前端生态中，响应式数据成为一项隐约诞生的新共识"
tags: ["响应式系统", "Vue", "Solid", "JavaScript", "ECMAScript"]
author: "Elecmonkey"
---

## "响应式数据"

传统的 UI 开发，开发者通常采用一种"命令"的画风去更新 UI——命令某个具体的组件，做一个具体的更改。不管是客户端开发，使用 Qt：

```cpp
QPushButton *button = new QPushButton("Click me");
connect(button, &QPushButton::clicked, this, [this]() {
    button->setText("Clicked!");
});
```

还是 Web 开发，原生的操作 DOM：

```js
const button = document.querySelector("button");
button.addEventListener("click", () => {
    button.textContent = "Clicked!";
});
```

在那个年代风靡前端的工具是 jQuery，用它来实现可以少些很多固定的 DOM 操作：

```js
$("button").click(function() {
    $(this).text("Clicked!");
});
```

当界面较为简单的时候，代码仍然是一目了然的。但随着界面数据越来越多、更新逻辑越来越复杂，代码会有一个明显的特点——**更新 UI 的逻辑和数据本身的逻辑耦合在一起**。但其实 UI 和数据是不同的东西——同一套数据逻辑可能渲染在不同的 UI 平台上。例如我要实现一个 Web 应用，还要用 Qt 实现一个桌面客户端，或许还要写一个小程序，再用 Kotlin 实现一个 Android APP。它们的数据逻辑是相同的，是 **UI 无关**的。

于是前端就诞生了各种各样的 UI 框架，负责接管 UI 的更新逻辑，我们开发者则只需要关心数据逻辑本身——这是我们实际要实现的业务逻辑。这种分离为很多事情带来了可能，比如遵循相同的 API，React 的底层也可以渲染在移动设备上（所以我们有了 React Native）。

除了包装大量的 DOM 操作之外，框架们不约而同的采用了"声明式"的画风，用"声明"来描述 UI 的"样子"。至于这些数据如何渲染在 DOM 上，则被框架全权接管。一种名为"响应式数据"的概念被提出，它允许我们声明式地描述数据之间的依赖关系，当数据发生变化时，所有依赖于这些数据的计算和 UI 都会自动更新。这种模式不仅让代码更加清晰，也让状态管理变得更加可预测。

在过去的十年里，前端框架在响应式系统的实现上经历了多次迭代。现在我们熟悉的响应式系统的核心思想在 2010 年的开源 JavaScript Web 框架 [Knockout.js](https://knockoutjs.com/) 中首次受到关注，随后经 [Angular](https://angular.dev/) 发扬光大。在此后的几年中，已经创建了许多变体和实现，从 Vue2 的 `Object.defineProperty` 到 Vue3 的 `Proxy`，从 SolidJS 的细粒度响应式，每个框架都在探索更高效、更易用的响应式方案。而最近，TC39 委员会提出了 Signals 提案，试图为 JavaScript 提供标准化的响应式原语，这可能会彻底改变前端框架的响应式实现方式。

## 主流框架实现

### Vue 2

Vue 2 的响应式系统是基于 `Object.defineProperty` 实现的。这是 Javascript 标准提供的 API，它允许我们拦截对象属性的访问和修改操作。

```js
const data = {
  count: 0
}

Object.defineProperty(data, 'count', {
  get: () => data.count,
  set: (value) => data.count = value
})
```

所谓响应式系统，就是希望我的某一个值发生改变，与它有关的值就会自动重新计算（像 Excel 表格一样，$A2 = A1 * 2$，当 A1 的值发生变化时，A2 的值会自动重新计算），与它有关的"动作"也会自动重新执行。

其实"更新与它（**响应式数据**）有关的值"（**计算属性**）也是一种与它有关的"动作"（**副作用**）——我们的核心目标是"自动的收集（**依赖收集**）和执行（**派发更新**）这些动作"。

Vue 2 的响应式系统核心是**依赖收集**和**派发更新**两个机制：

当组件渲染时，会访问响应式数据，触发 getter。Vue 会在 getter 中**收集**当前正在渲染的组件作为依赖。

```js
// 依赖收集示例

let activeEffect = null;
function effect(fn) {
  activeEffect = fn;
  // 执行 effect，这会触发响应式数据的 getter
  fn();
  activeEffect = null;
}

function defineReactive(obj, key, val) {
  const deps = new Set(); // 存储依赖的桶🪣

  Object.defineProperty(obj, key, {
    get() {
      // 收集依赖，进桶吧您嘞
      // 这就是为什么副作用一定要用effect包起来——Vue才能拿到这个函数
      deps.add(activeEffect);
      return val;
    },
    set(newVal) {
      if (val === newVal) return;
      val = newVal;
      // 派发更新：挨个儿调用
      deps.forEach(effect => effect());
    }
  });
}

// 使用示例，下面的写法写过Vue太熟悉了
const data = { count: 0 };
defineReactive(data, 'count', 0);

// 创建一个 effect，它会自动收集依赖
effect(() => {
  console.log('count is:', data.count);
});

// 修改数据，触发更新
data.count = 1; // 输出: count is: 1
```

当响应式数据发生变化时，触发 setter，Vue 会**派发更新**，通知所有依赖该数据的组件重新渲染。

```js
// 简化的组件更新机制
function createComponent(options) {
  const component = {
    render() {
      // 组件渲染函数
      activeEffect = () => {
        // 重新渲染组件
        component.update();
      };
      // 执行渲染，触发依赖收集
      return options.render.call(this);
    },
    update() {
      // 更新 DOM
    }
  };
  return component;
}
```

Vue 2 的实现复杂得多，但差不多是这么个意思。在 Vue 2 中常见以下用法：


```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Doubled: {{ doubled }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  computed: {
    doubled() {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>
```

### Vue 3 with Composition API

Vue 2 使用的 `Object.defineProperty` 有以下限制：
- 无法检测对象属性的添加或删除
- 无法检测数组索引的直接修改和长度的变化
- 需要递归遍历对象的所有属性，对深层嵌套对象进行响应式转换

Vue 3 的响应式系统是基于 `Proxy` 实现的。`Proxy` API 于 ES6 中被引入，它提供了更强大的对象拦截能力，可以拦截对象的几乎所有操作，解决了 `Object.defineProperty` 的诸多限制——例如不能监听新增属性、删除属性，以及数组索引的变更等。

```js
const data = {
  count: 0
}

const proxy = new Proxy(data, {
  get: (target, prop) => target[prop],
  set: (target, prop, value) => target[prop] = value
})
```

Vue 3 引入了 Composition API 和 Setup 语法糖，可以更加优雅的把"属于相同部分的逻辑"聚合在一起。

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Doubled: {{ doubled }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>
```

### SolidJS & Signals

Solid 说，我们核心的过程就是把用到这个数据的函数收集起来（依赖收集），然后当数据变化的时候，执行这些函数（派发更新）。那其实 `Proxy` 和 `Object.defineProperty` 这俩 API 只是给我们包了一下，让开发者能用接近原生 JS 变量的使用风格去写代码，这俩并不是必须的。我们直接把这个思路做出来，但不进行任何包装，做一个裸金属风格的响应式系统。你不管是读还是写都要调用我框架给你的函数，既然函数是我给的，那我在里面"横插一脚"去做依赖收集、派发更新不是随随便便的事儿。

同时 Solid 还使用 JSX ，于是有了这样一个很 React 味儿的写法：

```jsx
import { createSignal, createEffect } from 'solid-js'

function Counter() {
  const [count, setCount] = createSignal(0)
  const doubled = () => count() * 2
  
  createEffect(() => {
    console.log(`Count: ${count()}, Doubled: ${doubled()}`)
  })
  
  return (
    <div>
      <p>Count: {count()}</p>
      <p>Doubled: {doubled()}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  )
}
```

## 响应式系统核心概念

到这里，我们大概就可以抽象出各种响应式系统的核心概念了——我们需要一个**Signal**，它是一个**可读可写**的值，并且当它发生变化时，会有**Computed**计算属性发生变化 + 自动触发**副作用**。

### Signal（信号）

```typescript
type Signal<T> = [() => T, (value: T) => void];

function createSignal<T>(value: T): Signal<T> {
  const subscribers = new Set<Effect>();

  function read(): T {
    if (currentEffect) {
      subscribers.add(currentEffect);
    }
    return value;
  }

  function write(newValue: T): void {
    if (value === newValue) return;
    value = newValue;
    const effectsToRun = new Set(subscribers);
    effectsToRun.forEach(effect => {
      try {
        effect();
      } catch (e) {
        console.error('Error running effect:', e);
      }
    });
  }

  return [read, write];
}
```

Signal是响应式系统的基础，它包含：
- 一个值
- 一个订阅者集合
- 读取方法（自动收集依赖）
- 写入方法（通知所有订阅者）

### Effect（副作用）

```typescript
type Effect = () => void;
let currentEffect: Effect | null = null;

function effect(fn: Effect): void {
  const wrappedEffect = () => {
    currentEffect = wrappedEffect;
    try {
      fn();
    } finally {
      currentEffect = null;
    }
  };
  wrappedEffect();
}
```

Effect是响应式系统的执行单元：
- 在创建时执行一次
- 在其依赖的信号变化时重新执行
- 通过全局变量追踪当前正在"被收集"的副作用

### Computed（计算值）

```typescript
function computed<T>(fn: () => T): () => T {
  const [get, set] = createSignal<T>(fn());

  effect(() => {
    const newValue = fn();
    set(newValue);
  });

  return get;
}
```

Computed是基于其他信号派生的值：
- 在创建时计算初始值
- 当依赖的信号变化时自动重新计算


## TC39 Signals提案

好，现在问题来了。这么多框架都手工实现了一套相似的功能，说明这是一个很有需求量的功能。`Proxy` 进入 ES 标准，大大的简化了 Vue 3 的实现，增强了功能。Signal 这个东西非常好，如果我们让它进入 ES 标准，那框架设计的时候只需要包装一下 API 就行了。

[TC39 Signals](https://github.com/tc39/proposal-signals) 提案旨在为 JavaScript 提供标准化的信号原语，目前处于 TC39 提案 Stage 1 阶段。

目前提案包含三个核心概念：
1. `Signal.State` - 可写状态信号
2. `Signal.Computed` - 派生计算信号
3. `Signal.Watcher` - 用于观察信号变化的低级API

提案给出了一个光明的前景——

```js
// 创建一个可写的状态信号，初始值为0
const counter = new Signal.State(0);

// 创建一个计算信号，依赖于counter
const isEven = new Signal.Computed(() => (counter.get() & 1) == 0);

// 创建另一个计算信号，依赖于isEven
const parity = new Signal.Computed(() => isEven.get() ? "even" : "odd");

// 库或框架可以基于Signal原语定义effect
declare function effect(cb: () => void): (() => void);

// 创建一个effect，当parity变化时更新DOM
effect(() => element.innerText = parity.get());

// 模拟外部更新counter...
// 每秒counter加1，这会触发一系列更新：
// 1. counter变化
// 2. isEven重新计算
// 3. parity重新计算
// 4. effect重新执行，更新DOM
setInterval(() => counter.set(counter.get() + 1), 1000);
```

目前该提案已有一个 polyfill 实现：[signal-polyfill](https://github.com/proposal-signals/signal-polyfill)。