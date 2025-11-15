---
title: '看看 React Compiler 对你的组件做了些什么'
date: '2025-11-15'
description: '一个浏览器内的可视化工具，让你看到 React Compiler 如何转换你的代码。'
tags: ['React', 'React Compiler', '前端工具', '开源项目']
author: 'Elecmonkey'
---

[indent]做了一个小工具：**See React Compiler**。

## 在线体验

- 🔗 **在线地址：** [https://react-compiler.edev.uno/](https://react-compiler.edev.uno/)
- 📦 **GitHub：** [https://github.com/elecmonkey/see-react-compiler](https://github.com/elecmonkey/see-react-compiler)

## 一个例子

**原始代码：**

```jsx
import React, { useState } from 'react';

export const Demo = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
};
```

**编译后：**

```jsx
import { c as _c } from "react/compiler-runtime";
import React, { useState } from 'react';

export const Demo = () => {
  const $ = _c(6);
  if ($[0] !== "c8ddead80551c9ffa196048aad479d7c4518a54bc7192e6ca422a973a27883f7") {
    for (let $i = 0; $i < 6; $i += 1) {
      $[$i] = Symbol.for("react.memo_cache_sentinel");
    }
    $[0] = "c8ddead80551c9ffa196048aad479d7c4518a54bc7192e6ca422a973a27883f7";
  }
  const [count, setCount] = useState(0);
  let t0;
  if ($[1] !== count) {
    t0 = () => setCount(count + 1);
    $[1] = count;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  let t1;
  if ($[3] !== count || $[4] !== t0) {
    t1 = <button onClick={t0}>Count: {count}</button>;
    $[3] = count;
    $[4] = t0;
    $[5] = t1;
  } else {
    t1 = $[5];
  }
  return t1;
};
```

编译器做了什么？

1. **创建缓存数组** - 存储中间结果和依赖
2. **缓存 onClick 函数** - 只在 `count` 变化时重新创建（相当于 `useCallback`）
3. **缓存 JSX 元素** - 只在依赖变化时重新创建（相当于 `useMemo`）