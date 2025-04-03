---
title: "AI Agent 进化路：Node.js 搭建 Model Context Protocol 服务器"
date: "2025-04-04"
description: "Model Context Protocol —— 模型上下文，AI大模型打破对话框“次元壁”。"
tags: ["AI", "LLM", "MCP", "Node.js", "Agent"]
author: "Elecmonkey"
---

众所周知，2022 年底以来，全球各路大语言模型 LLMs 大爆发。在大家被 LLMs 所表现出的类“智力”、解决问题的能力所震惊的同时，很快发现，把这么能当牛做马的东西困在对话框里不是个事儿啊。然后就纷纷走上了“训练黑猩猩使用工具”的路。这个笨办法当然是有的——通过 Prompt 一次一次不厌其烦的教大模型生成指定格式的文段来表示自己对外部世界的渴求。不过提示词工程总是很难保证可靠性——除了调用工具，怎么让 LLMs 输出规定格式 JSON 大家也是各显神通。

不过呢，现在的大模型也有了类似原生的能力。比如 DeepSeek 的[JSON Mode](https://api-docs.deepseek.com/zh-cn/guides/json_mode)、[Function Call](https://api-docs.deepseek.com/zh-cn/guides/function_calling)。

## What's & Why MCP

2024 年 11 月底，Anthropic 推出了一种开放标准——Model Context Protocol，模型上下文，可以简称 MCP ——旨在统一大型语言模型（LLMs）与外部数据源和工具之间的通信协议。MCP 是专为 AI 语言模型设计的「通用插座」协议。它让 LLM 能安全、标准化地连接各种工具和数据源。

目前，Anthropic 提供了 Python、Typescript、Java、Kotlin、C# 的 SDK 工具。

## MCP Server

MCP Server 支持两种通信方式，分别是 `STDIO` 和 `SSE` 。

 - **STDIO 标准输入输出**

  本地 CLI 工具用用，无需网络的环境。比如目前给有很多这种本机运行的 MCP Server，Cursor 之类的 Agent 工具都可以集成。Claude 集成大量 MCP Server 后其实也相当于 Agent 了——其实 Cursor 也就是自动读代码、生成代码、生成文件、执行命令嘛。看 Cursor / Trae / Windsurf 干活儿看多了，常用的工具也不太多。

  ```javascript
  const server = new McpServer();
  server.connect(new StdioTransport());
  ```

 - **SSE Server-Sent Events**

   相当于以 Web API 的方式提供服务了，Node.js 环境中需要用 Express 之类的 HTTP Server 转发一层。

MCP 使用 **JSON-RPC 2.0** 作为消息格式标准，所有传输层需将二进制数据转换为以下三类结构化消息：

- **请求 (Request)**  
  ```json
  {
    "jsonrpc": "2.0",
    "id": "req_123",  // 唯一请求ID
    "method": "get_weather",
    "params": {"city": "北京"}
  }
  ```
- **响应 (Response)**  
  ```json
  {
    "jsonrpc": "2.0",
    "id": "req_123",
    "result": {"temp": 28, "condition": "晴"}
  }
  ```
- **通知 (Notification)**  
  ```json
  {
    "jsonrpc": "2.0",
    "method": "alert",
    "params": {"message": "高温预警"}
  }
  ```

## 搭一个计算器 MCP Server By Node.js

虽说我这里只是举一个例子，但是计算器对于各种 LLMs 来说太重要了。ChatGPT 诞生之后被嘲笑最多的就是数学差的不行，经典笑话之1.12和1.8哪个大。DeepSeek-R1 解各种高数、概率论的题目已经很nb了，但每次看它深度思考的过程为了一个简单的乘除在那儿各种列举各种枚举真看不下去了。

**Zod** 是一个为 TypeScript 设计的数据验证工具，对于不确定的数据，比如用户输入、API 返回、配置文件，它能自动进行校验、生成 Typescript 类型之类的。MCP 官方的 `typescript-sdk` 使用了 Zod。


```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import calculator from './calculator.js';
```

这里的 `calculator.js` 用逆波兰表达式实现了一个中缀表达式的计算器。

```typescript
// 创建 MCP 服务器实例
const server = new McpServer({
  name: 'RPN Calculator',
  version: '1.0.0'
});

// 添加计算工具
server.tool("calculate",
  { expression: z.string().describe('Mathematical expression in standard infix notation (e.g. "3+4*2")') },
  async ({ expression }) => { 
    try {
      const result = calculator.compute(expression);
      return { content: [{  type: "text", text: `${result}`}]};
    } catch (error) {
      return { content: [{type: "text", text: `Error: ${(error as Error).message}`}]};
    }
  }
);
```

最后就是启动服务器了。

```typescript
// 启动 STDIO 服务器
const transport = new StdioServerTransport();
await server.connect(transport);
console.log('MCP Calculator server running in STDIO mode...'); 
```

## 测试 MCP Server

怎么测试呢？最简单的当然是直接添加到支持 MCP 的工具里测试一通。这里以 Cursor 为例。其实对于涉及文本文件的操作，这类 Agent 已经能自动化的完成很多任务了，再通过 MCP 授予各种操作浏览器之类的能力，想象空间还是挺大的。不过话说回来，Manus 一阵爆火之后啥也没有，现在这种 Agent 产品，除了编程类的（Cursor/Trae/Windsurf），都还在一个玩具的状态。

在 Cursor MCP 里添加：

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["******/dist/server.js"]
    }
  }
}
```

![Cursor MCP](https://images.elecmonkey.com/articles/202504/mcp-cursor.png)

MCP 官方还提供了一个 WebUI 工具 MCP Inspector。可以可视化的测试你的 MCP Server 是否能成功连接、有什么 Tools，动手发 Request 然后查看 MCP Server 的 Response。

```shell
pnpm add -D @modelcontextprotocol/inspector
npx @modelcontextprotocol/inspector
```
![MCP Inspector](https://images.elecmonkey.com/articles/202504/mcp-inspector.png)

比如说我搭好的计算器 MCP Server，一来一回就可以看到

```json
{"method":"tools/list","params":{}}
```

WebUI 问：你有什么工具？

```json
{
    "tools": [
        {
            "name":"calculate",
            "inputSchema":{
                "type":"object",
                "properties":{
                    "expression":{
                        "type":"string",
                        "description":"Mathematical expression in standard infix notation (e.g. \"3 + 4 * 2\")"
                    }
                },
                "required":["expression"],
                "additionalProperties":false,
                "$schema":"http://json-schema.org/draft-07/schema#"
            }
        }
    ]
}
```

MCP Server 吐了一个列表，其实就一个工具。

```json
{
    "method": "tools/call",
    "params": {
        "name": "calculate",
        "arguments": {
            "expression": "12+(3*4)"
        },
        "_meta": {
            "progressToken": 0
        }
    }
}
```

服务器：调用！计算 `12+(3*4)`！

```json
{"content":[{"type":"text","text":"Result of 12+(3*4) = 24"}]}
```

MCP Server：OK，24。

这个剩下的后端逻辑全靠自己实现，想象力空间非常大。不过捏，如果 MCP 涉及什么操作文件、删除 GitHub 仓库这一类的，还是最好用户确认一下……