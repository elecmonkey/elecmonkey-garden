---
title: "JavaScript Reactive Systems, from Framework Implementations to TC39 Signals"
date: "2025-05-07"
description: "In the fragmented frontend ecosystem, reactive data has become a faintly emerging new consensus"
tags: ["Reactive Systems", "Vue", "Solid.js", "JavaScript", "ECMAScript"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

## "Reactive Data"

In traditional UI development, developers usually updated the UI in a "command" style: command a specific component to make a specific change. Whether in client development with Qt:

```cpp
QPushButton *button = new QPushButton("Click me");
connect(button, &QPushButton::clicked, this, [this]() {
    button->setText("Clicked!");
});
```

Or in Web development, operating the DOM directly:

```js
const button = document.querySelector("button");
button.addEventListener("click", () => {
    button.textContent = "Clicked!";
});
```

At that time, the tool popular across frontend development was jQuery. Using it could reduce a lot of repetitive DOM operations:

```js
$("button").click(function() {
    $(this).text("Clicked!");
});
```

When the interface is simple, the code is still clear at a glance. But as interface data grows and update logic becomes more complex, the code develops an obvious characteristic: **the logic for updating the UI and the logic of the data itself are coupled together**. Yet UI and data are actually different things. The same set of data logic may be rendered on different UI platforms. For example, I may want to implement a Web application, then also build a desktop client with Qt, perhaps write a mini program, and then implement an Android app with Kotlin. Their data logic is the same and is **UI-independent**.

So the frontend world produced all kinds of UI frameworks, responsible for taking over UI update logic, while we developers only need to care about the data logic itself: the business logic we actually need to implement. This separation made many things possible. For example, by following the same API, React's underlying layer can also render on mobile devices, which is why we have React Native.

Besides wrapping large amounts of DOM operations, frameworks all moved toward a "declarative" style, using declarations to describe what the UI should "look like". As for how the data is rendered into the DOM, frameworks take full control. A concept called "reactive data" was proposed. It allows us to declaratively describe dependencies between data. When data changes, all computations and UI that depend on that data automatically update. This pattern not only makes code clearer, but also makes state management more predictable.

Over the past decade, frontend frameworks have gone through multiple iterations in reactive-system implementation. The core idea of the reactive systems we are familiar with today first gained attention in the open source JavaScript Web framework [Knockout.js](https://knockoutjs.com/) in 2010, and was later popularized by [Angular](https://angular.dev/). In the following years, many variants and implementations were created, from Vue 2's `Object.defineProperty` to Vue 3's `Proxy`, and from SolidJS's fine-grained reactivity. Every framework has explored more efficient and easier-to-use reactive solutions. Recently, the TC39 committee proposed the Signals proposal, attempting to provide standardized reactive primitives for JavaScript. This may completely change how frontend frameworks implement reactivity.

## Mainstream Framework Implementations

### Vue 2

Vue 2's reactive system is implemented based on `Object.defineProperty`. This is an API provided by the JavaScript standard. It allows us to intercept access and modification operations on object properties.

```js
const data = {
  count: 0
}

Object.defineProperty(data, 'count', {
  get: () => data.count,
  set: (value) => data.count = value
})
```

A so-called reactive system means that when one of my values changes, values related to it will automatically recalculate, like an Excel spreadsheet: $A2 = A1 * 2$, and when A1 changes, A2 automatically recalculates. Related "actions" will also automatically re-execute.

In fact, "updating values related to it (**reactive data**)" (**computed properties**) is also a kind of related "action" (**side effect**). Our core goal is to "automatically collect (**dependency collection**) and execute (**dispatch updates**) these actions".

The core of Vue 2's reactive system consists of two mechanisms: **dependency collection** and **dispatching updates**:

When a component renders, it accesses reactive data and triggers the getter. Vue **collects** the currently rendering component as a dependency in the getter.

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

When reactive data changes, it triggers the setter. Vue **dispatches updates** and notifies all components that depend on the data to re-render.

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

Vue 2's actual implementation is much more complex, but the idea is roughly this. In Vue 2, the following usage is common:

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

The `Object.defineProperty` used by Vue 2 has the following limitations:

- It cannot detect adding or deleting object properties
- It cannot detect direct modification of array indexes or changes to array length
- It requires recursively traversing all properties of an object to make deeply nested objects reactive

Vue 3's reactive system is implemented based on `Proxy`. The `Proxy` API was introduced in ES6. It provides more powerful object interception capabilities and can intercept almost all object operations, solving many limitations of `Object.defineProperty`, such as inability to observe added properties, deleted properties, and array index changes.

```js
const data = {
  count: 0
}

const proxy = new Proxy(data, {
  get: (target, prop) => target[prop],
  set: (target, prop, value) => target[prop] = value
})
```

Vue 3 introduced the Composition API and Setup syntax sugar, making it more elegant to aggregate "logic that belongs to the same part" together.

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

Solid says: our core process is to collect the functions that use this data (dependency collection), and when the data changes, execute those functions (dispatch updates). In fact, `Proxy` and `Object.defineProperty` are just two APIs that wrap this for us, allowing developers to write code in a style close to native JS variables. They are not required. We can implement this idea directly without any wrapping, building a bare-metal-style reactive system. Whether you read or write, you have to call functions provided by my framework. Since I provide those functions, inserting my own logic inside them to do dependency collection and dispatch updates is easy.

At the same time, Solid also uses JSX, giving it a React-flavored style:

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

## Core Concepts of Reactive Systems

At this point, we can roughly abstract the core concepts of various reactive systems. We need a **Signal**: a **readable and writable** value. When it changes, **Computed** values change and **side effects** are automatically triggered.

### Signal

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

Signal is the foundation of a reactive system. It contains:

- A value
- A set of subscribers
- A read method that automatically collects dependencies
- A write method that notifies all subscribers

### Effect

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

Effect is the execution unit of a reactive system:

- It runs once when created
- It re-runs when its dependent signals change
- It tracks the side effect currently being "collected" through a global variable

### Computed

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

Computed is a value derived from other signals:

- It calculates the initial value when created
- It automatically recalculates when dependent signals change

## TC39 Signals Proposal

Now the question comes. So many frameworks have manually implemented similar functionality, which means this is a highly demanded feature. `Proxy` entering the ES standard greatly simplified Vue 3's implementation and enhanced its capabilities. Signal is a very good thing. If we let it enter the ES standard, framework designers only need to wrap the API.

The [TC39 Signals](https://github.com/tc39/proposal-signals) proposal aims to provide standardized signal primitives for JavaScript. It is currently at TC39 proposal Stage 1.

The current proposal includes three core concepts:

1. `Signal.State` - writable state signal
2. `Signal.Computed` - derived computed signal
3. `Signal.Watcher` - low-level API for observing signal changes

The proposal presents a bright future:

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

The proposal currently already has a polyfill implementation: [signal-polyfill](https://github.com/proposal-signals/signal-polyfill).
