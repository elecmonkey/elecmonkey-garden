---
title: 'Mermaid 图表测试'
date: '2024-03-25'
description: '这篇文章展示了 Mermaid 图表在 Markdown 中的使用'
tags: ['Mermaid', 'Markdown', '图表', '技术演示']
author: 'Elecmonkey'
---

# Mermaid 图表测试

这篇文章展示了如何在 Markdown 中使用 Mermaid 图表，并通过服务端渲染在 Next.js 中展示它们。

## 流程图示例

下面是一个简单的流程图示例：

```mermaid
graph TD
    A[开始] --> B{是否有账户?}
    B -->|是| C[登录]
    B -->|否| D[注册]
    C --> E[进入应用]
    D --> E
    E --> F[结束]
```

## 时序图示例

下面是一个时序图示例，展示了用户与系统的交互：

```mermaid
sequenceDiagram
    participant 用户
    participant 浏览器
    participant 服务器
    participant 数据库
    
    用户->>浏览器: 输入用户名和密码
    浏览器->>服务器: 发送登录请求
    服务器->>数据库: 验证用户凭据
    数据库-->>服务器: 返回验证结果
    服务器-->>浏览器: 返回登录状态
    浏览器-->>用户: 显示登录结果
```

## 类图示例

下面是一个简单的类图示例：

```mermaid
classDiagram
    class Animal {
        +String name
        +move()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Bird {
        +String color
        +fly()
    }
    Animal <|-- Dog
    Animal <|-- Bird
```

## 甘特图示例

下面是一个甘特图示例，展示了项目进度：

```mermaid
gantt
    title 项目进度计划
    dateFormat  YYYY-MM-DD
    section 准备阶段
    需求分析        :done,    des1, 2024-03-01, 2024-03-05
    系统设计        :active,  des2, 2024-03-06, 2024-03-15
    section 开发阶段
    编码实现        :         des3, 2024-03-16, 2024-04-10
    测试            :         des4, 2024-04-11, 2024-04-20
    section 发布阶段
    部署上线        :         des5, 2024-04-21, 2024-04-25
    用户培训        :         des6, 2024-04-26, 2024-04-30
```

## 使用注意事项

1. Mermaid 图表需要包含在 \`\`\`mermaid 代码块中
2. 图表语法需要符合 Mermaid 规范
3. 复杂图表可能需要额外的配置

希望这些示例对你有所帮助！ 