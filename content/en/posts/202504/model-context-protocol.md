---
title: "The Evolution Path of AI Agents: Building a Model Context Protocol Server with Node.js"
date: "2025-04-04"
description: "Model Context Protocol: model context, helping AI large models break through the dimensional wall of the chat box."
tags: ["AI", "Large Language Model (LLM)", "Node.js", "Agent"]
author: "Elecmonkey"
---

> This article was translated by AI and has not been manually reviewed.

As everyone knows, since the end of 2022, all kinds of large language models, LLMs, have exploded worldwide. While everyone was shocked by the "intelligence" and problem-solving ability shown by LLMs, people soon realized that trapping something so capable inside a chat box was not the right path. Then everyone began walking down the road of "training chimpanzees to use tools". This clumsy method of course exists: use prompts again and again, tirelessly teaching the large model to generate text in a specified format to express its desire for the external world. But prompt engineering is always hard to make reliable. Besides tool calling, people have tried all kinds of methods to make LLMs output JSON in a required format.

That said, today's large models also have something close to native capabilities. For example, DeepSeek's [JSON Mode](https://api-docs.deepseek.com/zh-cn/guides/json_mode) and [Function Call](https://api-docs.deepseek.com/zh-cn/guides/function_calling).

## What's & Why MCP

At the end of November 2024, Anthropic launched an open standard: Model Context Protocol, abbreviated as MCP. It aims to unify the communication protocol between large language models (LLMs) and external data sources and tools. MCP is a "universal socket" protocol designed specifically for AI language models. It allows LLMs to connect safely and in a standardized way to various tools and data sources.

Currently, Anthropic provides SDK tools for Python, Typescript, Java, Kotlin, and C#.

## MCP Server

MCP Server supports two communication methods: `STDIO` and `SSE`.

- **STDIO standard input/output**

  Used for local CLI tools and environments without networking. For example, many MCP Servers currently run locally, and Agent tools such as Cursor can integrate them. After Claude integrates many MCP Servers, it is essentially also an Agent. Actually, Cursor is just automatically reading code, generating code, generating files, and executing commands. After watching Cursor / Trae / Windsurf work for a long time, the commonly used tools are not that many.

  ```javascript
  const server = new McpServer();
  server.connect(new StdioTransport());
  ```

- **SSE Server-Sent Events**

  This is equivalent to providing services as a Web API. In a Node.js environment, it needs an HTTP Server such as Express to forward a layer.

MCP uses **JSON-RPC 2.0** as its message format standard. All transport layers need to convert binary data into the following three kinds of structured messages:

- **Request**

  ```json
  {
    "jsonrpc": "2.0",
    "id": "req_123",  // 唯一请求ID
    "method": "get_weather",
    "params": {"city": "北京"}
  }
  ```

- **Response**

  ```json
  {
    "jsonrpc": "2.0",
    "id": "req_123",
    "result": {"temp": 28, "condition": "晴"}
  }
  ```

- **Notification**

  ```json
  {
    "jsonrpc": "2.0",
    "method": "alert",
    "params": {"message": "高温预警"}
  }
  ```

## Building a Calculator MCP Server with Node.js

Although I am only giving an example here, calculators are extremely important for various LLMs. After ChatGPT was born, one of the most mocked things was how bad it was at math. A classic joke is which is larger, 1.12 or 1.8. DeepSeek-R1 is already very good at solving advanced mathematics and probability problems, but every time I watch its deep-thinking process enumerate things again and again for a simple multiplication or division, I really cannot stand it.

**Zod** is a data validation tool designed for TypeScript. For uncertain data such as user input, API responses, and configuration files, it can automatically validate data and generate Typescript types. MCP's official `typescript-sdk` uses Zod.

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import calculator from './calculator.js';
```

The `calculator.js` here implements an infix-expression calculator using Reverse Polish Notation.

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

The final step is to start the server.

```typescript
// 启动 STDIO 服务器
const transport = new StdioServerTransport();
await server.connect(transport);
console.log('MCP Calculator server running in STDIO mode...');
```

## Testing the MCP Server

How do you test it? The simplest way is, of course, to add it directly to a tool that supports MCP and test it thoroughly. Here I use Cursor as an example. For operations involving text files, these Agent tools can already automate many tasks. If MCP grants additional capabilities such as operating a browser, the room for imagination is still large. That said, after Manus suddenly became popular, nothing much followed. Current Agent products, except programming-related ones (Cursor/Trae/Windsurf), are still in a toy-like state.

Add this in Cursor MCP:

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

MCP also officially provides a WebUI tool, MCP Inspector. It can visually test whether your MCP Server can connect successfully, what Tools it has, manually send Requests, and then view the MCP Server's Response.

```shell
pnpm add -D @modelcontextprotocol/inspector
npx @modelcontextprotocol/inspector
```

![MCP Inspector](https://images.elecmonkey.com/articles/202504/mcp-inspector.png)

For example, with the calculator MCP Server I built, you can see this round trip:

```json
{"method":"tools/list","params":{}}
```

WebUI asks: what tools do you have?

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

MCP Server spits out a list. Actually, it only has one tool.

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

Server: call it! Calculate `12+(3*4)`!

```json
{"content":[{"type":"text","text":"Result of 12+(3*4) = 24"}]}
```

MCP Server: OK, 24.

The rest of the backend logic is all up to you to implement, leaving a lot of room for imagination. However, if MCP involves operations such as manipulating files or deleting GitHub repositories, it is still best to ask the user for confirmation...
