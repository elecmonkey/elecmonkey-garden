---
title: "The Story Behind the Mysterious javascript:void(0) Link"
date: "2025-04-16"
description: "Every tiny detail change in the frontend world reflects the evolution of the whole Web ecosystem."
tags: ["JavaScript", "Web History", "TypeScript"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

In the ancient Internet era, everyone may have seen this mysterious link: `javascript:void(0)`. This `javascript:void(0)` link once appeared in every corner of the Internet.

Today, handwritten code rarely uses this strange JavaScript operator. It executes any expression, but its return value is always `undefined`. However, it still appears in some build outputs. For example, write this magical TS function:

```typescript
function test(param: any) {
    console.log(param.data?.value);
}
```

`tsc` compiles it into:

```javascript
function test(param) {
    var _a;
    console.log((_a = param.data) === null || _a === void 0 ? void 0 : _a.value);
}
```

Huh? `void 0`, why not `undefined`?

## undefined in JavaScript 👻

The existence of `void` does have some reason. In JavaScript, `undefined` is not a keyword, but only an ordinary property of the global object:

```javascript
// 在 ES5 之前，这样的代码是完全合法的
undefined = "这不是 undefined 了";
console.log(undefined);
```

After ES6, the property's value was set to read-only (`writable: false`) and can no longer be modified. However, it can still be shadowed in a local scope:

```javascript
function evil() {
    let undefined = "我是邪恶的值";
    console.log(undefined);
}
```

Although no one should deliberately name a variable `undefined` and reassign it, in short, theoretically speaking, using `undefined` cannot guarantee that what you get is `undefined`. By contrast, using the `void` operator can always obtain the real `undefined`.

## The void Operator

So, to solve this problem, JavaScript introduced the `void` operator. No matter how `undefined` is polluted, the `void` operator always returns the true `undefined` value:

```javascript
// 即使 undefined 被重新赋值
globalThis.undefined = "被污染了";
// window 和 global

// void 运算符仍然返回真正的 undefined
console.log(void 0); // undefined
console.log(void(0)); // undefined
console.log(void "任何表达式"); // undefined
```

Because `void 0` is the shortest way to obtain `undefined`, it became the preferred choice for many JavaScript minification tools.

## The Origin of javascript:void(0)

So why was `javascript:void(0)` frequently seen in early web pages? This has to do with the behavior of the `<a>` tag in early browser HTML.

When a user clicks a link with the `javascript:` protocol, the browser will:

1. Execute the JavaScript code in the `href` attribute
2. Use the return value to update the current page, if there is a return value

For example:

```html
<!-- 这会导致页面被替换为 "1" -->
<a href="javascript:1">点击我</a>

<!-- 这什么都不会发生 -->
<a href="javascript:void(0)">点击我</a>
```

(You do not need to try this yourself. Modern browsers will not rewrite the page content unless you use `document.write`.)

Therefore, `javascript:void(0)` became the standard way to prevent a link's default behavior.

## JavaScript Pseudo-Protocol

Links starting with `javascript:` are called the JavaScript pseudo-protocol. This is a special protocol from early Web development that allowed JavaScript code to be executed directly in the `href` attribute of HTML elements or in the browser address bar.

```html
<a href="javascript:alert('Hello World')">点击我</a>
```

(Modern browsers still pop this one.)

```html
<a href="javascript:var x=1;console.log(x);void 0;">多语句</a>
```

However, the JavaScript pseudo-protocol has serious security risks, such as XSS attacks.

```html
<a href="javascript:alert(document.cookie)">看似正常的链接</a>
```

So Content Security Policy often forbids the use of the JavaScript pseudo-protocol:

```header
Content-Security-Policy: script-src 'self'
```

This is also why modern Web development no longer recommends using the JavaScript pseudo-protocol.

## void and the Modern Frontend

### Preventing Link Default Behavior

In modern JavaScript, there are better ways to prevent a link's default behavior:

```html
<!-- 使用 preventDefault() -->
<a href="#" onclick="event.preventDefault(); doSomething()">点击我</a>
```

But if clicking this thing executes a piece of JavaScript code, why are you using an `<a>` tag?

```html
<!-- 或者直接使用按钮 -->
<button onclick="doSomething()">点击我</button>
```

### Handling Arrow Functions

The `void` operator has another use in modern JavaScript: handling return values of arrow functions. Arrow functions are also a new feature after ES6. Suppose our arrow function only calls another function, but when an arrow function does not use `{}`, it returns the value of the call expression by default. If we may have type constraints on the return value, we can use the `void` operator to handle it:

```typescript
type VoidFunc = () => void;
const fn: VoidFunc = () => void someExpression();
```

Of course, you can also write:

```typescript
type VoidFunc = () => void;
const fn: VoidFunc = () => {
    someExpression();
};
```

### Immediately Invoked Expression

```javascript
void function() {
    console.log("这个函数会立即执行");
}();
```

Because `void` is an operator, it converts a function declaration into a function expression, allowing it to be called directly with parentheses.

But nowadays it seems people usually write this:

```javascript
(function() {
    console.log("这个函数会立即执行");
})();
```
