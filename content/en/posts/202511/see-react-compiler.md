---
title: 'See What React Compiler Does to Your Components'
date: '2025-11-15'
description: 'An in-browser visualization tool that lets you see how React Compiler transforms your code.'
tags: ['React', 'React Compiler', 'Frontend Tooling']
author: 'Elecmonkey'
---

> This article was translated by AI and has not been manually reviewed.

I made a small tool: **See React Compiler**.

## Online Demo

- 🔗 **Online URL:** [https://react-compiler.edev.uno/](https://react-compiler.edev.uno/)
- 📦 **GitHub:** [https://github.com/elecmonkey/see-react-compiler](https://github.com/elecmonkey/see-react-compiler)

## An Example

**Original code:**

```jsx
import React, { useState } from 'react';

export const Demo = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
};
```

**Compiled output:**

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

What did the compiler do?

1. **Create a cache array** - stores intermediate results and dependencies
2. **Cache the onClick function** - recreates it only when `count` changes, equivalent to `useCallback`
3. **Cache the JSX element** - recreates it only when dependencies change, equivalent to `useMemo`
