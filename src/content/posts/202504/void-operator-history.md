---
title: "神秘链接 javascript:void(0) 背后的故事。"
date: "2025-04-16"
description: "前端世界的每一处细节变化都映射着整个 Web 生态的变迁。"
tags: ["JavaScript", "Web历史", "TypeScript"]
author: "Elecmonkey"
---

在上古互联网时代，大家可能都见过这么一个神秘链接：`javascript:void(0)`。这个`javascript:void(0)` 链接曾经遍布互联网的每个角落。

今天手写代码已经很少用到这个奇怪的 JavaScript 运算符了——它执行任何表达式，但返回值总是 `undefined`。不过在一些构建产物中还有它的身影，比如，写这么一个神奇的TS函数：

```typescript
function test(param: any) {
    console.log(param.data?.value);
}
```

`tsc` 会把它编译成：

```javascript
function test(param) {
    var _a;
    console.log((_a = param.data) === null || _a === void 0 ? void 0 : _a.value);
}
```

蒽？`void 0`，why not `undefined`？

## undefined in JavaScript 👻

`void` 的存在确实有那么一点道理。在 JavaScript 中，`undefined` 并不是一个关键字，而仅仅是全局对象的一个普通属性：

```javascript
// 在 ES5 之前，这样的代码是完全合法的
undefined = "这不是 undefined 了";
console.log(undefined);
```

ES6 之后，该属性的值被设置为只读（`writable: false`），无法再被修改。不过，在局部作用域中仍然可以被覆盖：

```javascript   
function evil() {
    let undefined = "我是邪恶的值";
    console.log(undefined);
}
```

虽然应该不会有人故意把变量命名成 `undefined` 并重新赋值，但总之，理论上讲，使用 `undefined` 你不能保证你获取到的是 `undefined`，反而是使用 `void` 运算符总能获取到真正的 `undefined`。

## void 运算符

So，为了解决这个问题，JavaScript 引入了 `void` 运算符。无论 `undefined` 被如何污染，`void` 运算符总是会返回真正的 `undefined` 值：

```javascript
// 即使 undefined 被重新赋值
globalThis.undefined = "被污染了";
// window 和 global

// void 运算符仍然返回真正的 undefined
console.log(void 0); // undefined
console.log(void(0)); // undefined
console.log(void "任何表达式"); // undefined
```

由于 `void 0` 是获取 `undefined` 最短的方式，它成为了许多 JavaScript 压缩工具的首选。

## javascript:void(0) 的由来

那么，为什么在早期的网页中会经常看到 `javascript:void(0)` 呢？这和早期浏览器 HTML 中 `<a>` 标签的行为有关。

当用户点击一个`javascript:` 协议的链接时，浏览器会：
1. 执行 `href` 属性中的 JavaScript 代码
2. 使用返回值更新当前页面（如果有返回值的话）

例如：
```html
<!-- 这会导致页面被替换为 "1" -->
<a href="javascript:1">点击我</a>

<!-- 这什么都不会发生 -->
<a href="javascript:void(0)">点击我</a>
```

（大家不用自己去试了，现代浏览器除非你 `document.write`，否则不会重写页面内容的）

因此，`javascript:void(0)` 成为了阻止链接默认行为的标准方式。

## JavaScript 伪协议

`javascript:` 开头的链接被称为 JavaScript 伪协议。这是一个早期 Web 开发中的特殊协议，允许在 HTML 元素的 href 属性或浏览器地址栏中直接执行 JavaScript 代码。

```html
<a href="javascript:alert('Hello World')">点击我</a>
```
（这个现代浏览器还会弹的）

```html
<a href="javascript:var x=1;console.log(x);void 0;">多语句</a>
```

不过，JavaScript 伪协议存在严重的安全风险，比如XSS 攻击。

```html
<a href="javascript:alert(document.cookie)">看似正常的链接</a>
```

所以内容安全策略经常会禁止使用 JavaScript 伪协议：

```header
Content-Security-Policy: script-src 'self'
```

这也是为什么现代 Web 开发中不再推荐使用 JavaScript 伪协议。

## void 与现代前端

### 阻止链接默认行为

在现代 JavaScript 中，阻止链接默认行为还有更好的办法：

```html
<!-- 使用 preventDefault() -->
<a href="#" onclick="event.preventDefault(); doSomething()">点击我</a>
```

不过，如果你这个玩意儿点击之后是执行一段 Javascript 代码，那你为啥要用 `<a>` 标签啊？

```html
<!-- 或者直接使用按钮 -->
<button onclick="doSomething()">点击我</button>
```

### 处理箭头函数

`void` 运算符在现代 JavaScript 中还有个用途，就是处理箭头函数的返回值。箭头函数也是 ES6 之后的新特性了，假如我们箭头函数只是调用一个其它函数，但是箭头函数在不写 `{}` 的时候，默认会返回调用表达式的值。而我们又有可能对返回值的类型有约束，这时候就可以用 `void` 运算符来处理：

```typescript
type VoidFunc = () => void;
const fn: VoidFunc = () => void someExpression();
```

当然，你也完全可以：

```typescript
type VoidFunc = () => void;
const fn: VoidFunc = () => {
    someExpression();
};
```

### 立即执行表达式

```javascript
void function() {
    console.log("这个函数会立即执行");
}();
```

由于 `void` 是个运算符，它将函数声明转换为函数表达式，这样就可以直接括号调用了。

不过现在似乎一般都这么写：

```javascript
(function() {
    console.log("这个函数会立即执行");
})();
```