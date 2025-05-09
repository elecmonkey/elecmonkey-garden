---
title: "用户鉴权系统：JWT 实现无状态认证"
date: "2025-03-31"
description: "JWT 认证学习笔记。无状态认证的原理分析、前后端实现方案、安全防护措施，以及在实际项目中遇到的跨域、单点登录等问题。"
tags: ["身份认证", "Web安全", "JavaScript"]
author: "Elecmonkey"
---

## Why JWT

JWT（JSON Web Token）是一种用户认证的标准，它可以让服务器在不储存登录状态的情况下实现对用户登录的认证、登录状态保持和过期等操作。

传统的登录模式，当用户名和密码核验正确后，服务器通常会生成一个随机字符串作为 Token 自己存起来，同时给客户端发一份。后续访问客户端每次都会带上这个 Token，服务器就和数据库去对比，比对成功则认为有权限访问资源，否则则没有。这种方式服务器对整个应用全局的登录状态有着绝对的掌控，新增、注销登录状态都很容易实现。不过代价就是登录系统本身消耗巨大的服务器资源。每次登录都是一场酣畅淋漓的数据库操作。

JWT，它的优势就在于，签发后服务器不需要储存，全权交由客户端储存管理。通过密码学验算保障客户端提交上来的信息**未经篡改**。使用 JWT 作为鉴权机制的 Web 应用，服务器不知道现在还有哪些用户处在有效的登录状态，客户端储存的信息中含有登录状态，我们可以说 JWT 是**无状态的**、**自令牌的**。

## JWT 的结构与生成原理

实现完整的登录功能，靠的是服务器签发的 JWT 令牌——由服务器生成的一个字符串。JWT 由三部分组成，以点（.）分隔，三部分分别是：

- **Header**：标头
- **Payload**：负荷
- **Signature**：签名

当服务器验证用户用户名密码均正确，登录成功，便着手签发 JWT。 Header 和 Payload 是用 Base64 明文储存信息的。Header 只是简要的声明令牌和签名算法：
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Payload 部分理论上可以储存任何你需要/你想在客户端储存的信息。不过由于 Base64 是明文编码，并无加密措施，因此**不应该**储存密码等敏感或隐私信息。一般来讲，有一个公开的用户唯一标识符是登录功能所必需的，也可以再放一些昵称、个性签名、头像url等公开且客户端常用的数据，客户端 Javascript 可以直接取来用，不需要频繁的从服务器拿这些东西。

关于 Payload 部分怎么写，JWT 的标准 [RFC 7591 Section 4.1](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1) 有一个推荐性的字段名称规定。不过这只是推荐性标准——事实上它也只能是推荐性标准，因为自己实现一套 JWT 工具实在是太容易了。我倾向于把原理差不多的登录鉴权过程都称为 JWT。

比如，一个可能的 Payload 信息：
```json
{
  "sub": "userid_12345",
  "iat": 1743424700,
  "exp": 1743511100,
  "avatar": "a.png",
  "role": ["editor", "administrator"]
}
```

准备好了 Header 和 Payload 的明文，我们转换成 Base64 形式，Web 开发常用语言工具几乎都有相关功能内置——
```js
const jsonHeaderString = `{"alg":"HS256","typ":"JWT"}`;
const jsonPayloadString = `{"sub":"userid_12345","iat":1743424700,"exp":1743511100,"avatar":"a.png","role": ["editor","administrator"]}`;

const base64HeaderString = btoa(jsonHeaderString);
const base64PayloadString = btoa(jsonPayloadString);

console.log(base64HeaderString);
console.log(base64PayloadString);
```

输出：
```shell
# base64HeaderString
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9

# jsonPayloadString
eyJzdWIiOiJ1c2VyaWRfMTIzNDUiLCJpYXQiOjE3NDM0MjQ3MDAsImV4cCI6MTc0MzUxMTEwMCwiYXZhdGFyIjoiYS5wbmciLCJyb2xlIjogWyJlZGl0b3IiLCJhZG1pbmlzdHJhdG9yIl19
```

以上这两部分信息客户端想伪造不是随便伪造，那服务器怎么知道客户端提交上来的 JWT 有没有伪造篡改过呢？这就是第三部分 Signature 的作用。生成 Signature 需要一个**永远只有服务器知道**的密钥。通常在服务端 Web 应用中由环境变量来控制。

将前两部分的 Base64 编码以及服务端的密钥整体拼起来（RFC7591 有标准，但是自己实现起来其实怎么拼无所谓），然后 Hash 一下。我们都知道 Hash 摘要算法的数学特点——确定的输入永远得到确定的输出、难以构造具有相同输出的输入、无法从输出反向得到输入。所以只要把前面的 Header、Payload 和密钥揉成一团 Hash，就可以签发给客户端了。客户端下次请求带着同样的东西来，服务端按相同的规则验算一遍就可以知道有没有篡改过了。只要服务端密钥没有泄漏，客户端就不可能伪造出能通过服务端检验的非由服务器签发的 JWT。

```js
const secretKey = "江山代有才人出各领风骚数百年"; // 密钥
const unsignedToken = `${base64HeaderString}.${base64PayloadString}`;

function generateSignature(message, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(key => {
    return crypto.subtle.sign('HMAC', key, messageData);
  }).then(signature => {
    const signatureArray = Array.from(new Uint8Array(signature));
    const signatureBase64 = btoa(String.fromCharCode(...signatureArray));
    return signatureBase64;
  });
}

const signature = (await generateSignature(unsignedToken, secretKey)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

console.log(signature);
```

输出：
```shell
# Signature
-ZjUVrcynB1FLMw8Opdlh-y1dAyghL2BkOY3MOzMAMQ
```

这仨拼到一块儿就是完整的 JWT 令牌了。

```shell
# JWT
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyaWRfMTIzNDUiLCJpYXQiOjE3NDM0MjQ3MDAsImV4cCI6MTc0MzUxMTEwMCwiYXZhdGFyIjoiYS5wbmciLCJyb2xlIjogWyJlZGl0b3IiLCJhZG1pbmlzdHJhdG9yIl19.-ZjUVrcynB1FLMw8Opdlh-y1dAyghL2BkOY3MOzMAMQ
```

当然——在 Payload 里能设置"过期时间"（`exp`）也是在同样的地方做验算——如果服务端发现已经不在 Payload 部分的有效期内，那后面不用做验算就可以直接判定这个 JWT 无效了。

![JWT](https://images.elecmonkey.com/articles/202503/note-jwt.png)

[JWT.io](https://jwt.io/) 有一个在线的小工具可以帮你生成 JWT 或者验证 JWT 是否正确，方便开发调试。

JWT 整体的的工作流程如下：

```mermaid
sequenceDiagram
    participant Client
    participant Server

    Note over Client: 登录请求
    Client->>Server: 发送用户名/密码
    Server-->>Client: 验证通过，返回JWT

    Note over Client: 携带JWT访问资源
    Client->>Server: 请求API (Header: Authorization: Bearer <JWT>)
    
    Server->>Server: 1. 解析JWT头部和签名
    Server->>Server: 2. 验证签名有效性
    Server->>Server: 3. 检查有效期和声明(claims)
    
    alt 验证成功
        Server-->>Client: 返回请求的资源数据
    else 验证失败
        Server-->>Client: 返回401未授权
    end
```

## JWT 的不足

JWT 与传统 Session 鉴权的对比：

| 特性 | JWT | Session |
|------|-----|---------|
| 存储位置 | 客户端 | 服务端 |
| 可扩展性 | 高 (无状态) | 低 (需共享会话存储) |
| 安全性 | 依赖签名算法 | 依赖会话 ID |
| 性能 | 验证在服务端进行，无需查询数据库 | 需要查询会话存储 |
| 大小 | 较大 (包含所有信息) | 较小 (只是标识符) |
| 跨域 | 容易实现 | 需要特殊配置 |
| 注销 | 复杂 (需要额外机制) | 简单 (直接删除会话) |

其实能发现 JWT 最重要的缺陷就在服务器端对于会话完全没有管理能力。以下常见需求 JWT 难以实现：

 - 强迫某会话下线
 - 限制单个用户仅允许单点登录

如果非要实现，那就还得引入数据库做手脚。可选的方案有给用户的 MySQL 表格加验证字段、引入 Redis 缓存会话信息。那这种情况下就算 JWT 也得每次登录对着数据库一顿操作。当有这样的需求时，保留 JWT，在此基础上引入数据库机制，还是干脆别这么麻烦直接回到传统 Session Token 模式，就看具体的业务场景怎么考虑了。

## XSS 与 CSRF 攻击防范

XSS（跨站脚本攻击）对 JWT 的威胁主要体现在：攻击者可能通过注入恶意脚本获取到存储在 localStorage 或 cookie 中的 JWT。CSRF（跨站请求伪造）则可能利用 cookie 自动被带在请求头中来提交某些并非出自用户本意的破坏性操作。

一个解法是将 JWT 存储在 HttpOnly Cookie 中，这样 JavaScript 就无法访问到 token。不过，这么搞最好使用 Nginx 
之类的反向代理，将前后端服务代理到同一个域名下，否则可能又会被跨域的各种问题折腾个半死。既然已经将 JWT 储存在 
Cookie 中了，CSRF 的防范则相对简单，设置 Cookie 的 SameSite 属性为 Strict 或 Lax 基本就不
会出问题。不过，HttpOnly Cookie 的话，前端就拿不到 JWT Payload 里的信息了。可以选择干脆不在 Payload 里放太多有效信息——辛苦前端后端，使劲 Fetch 拿数据吧。

对于需要在前端使用 Payload 数据的场景，还是得老老实实用 Javascript 存在 localStorage 之类的地方，那就得对 XSS 上点心了。用 CSP（内容安全策略）限制页面中可执行的脚本来源，同时一定对所有用户输入进行严格的验证和转义。

当然，对于 Web 应用，无感续签也是很重要的话题，不过不在本文讨论范围之内了。如果实现了“使用 refresh token 获取新的 access token”的机制，refresh token 比 access token 有更长的有效期——那么可以配置前者储存在 HttpOnly Cookie 中，后者储存在 Javascript 可及的 localStorage 中。无感刷新机制配置的真“无感”的话，完全可以将后者的有效期设置的非常短——十五分钟，或者十分钟。这样即使发生 XSS，失窃的 refresh token 也只会带来很短的攻击窗口。