# 哄哄模拟器 — AGENTS.md

## 项目概览

AI 驱动的仿微信聊天模拟器，用于练习"哄人"技巧。用户选择角色（女朋友/男朋友）后，AI 扮演该角色生气，用户通过自由输入对话将怒气值从 100 降到 0。

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI**: Tailwind CSS 4 + shadcn/ui
- **AI**: coze-coding-dev-sdk (LLM)

## 目录结构

```
src/
├── app/
│   ├── api/
│   │   ├── start/route.ts      # 生成生气场景
│   │   └── chat/route.ts       # AI 对话 + 怒气值判定 (SSE)
│   ├── chat/page.tsx           # 聊天界面 (高仿微信)
│   ├── page.tsx                # 角色选择入口
│   ├── layout.tsx              # 全局布局
│   └── globals.css             # 全局样式
├── components/ui/              # shadcn 组件
└── ...
public/
├── avatar-girlfriend.jpeg      # 女朋友头像
└── avatar-boyfriend.jpeg       # 男朋友头像
```

## 核心数据流

1. 用户选择角色 → `/api/start` 生成随机场景 → 进入聊天页
2. 用户输入消息 → `/api/chat` (SSE 流式) → AI 逐字输出 + 怒气值更新
3. 怒气值归零 → 胜利；怒气值超 100 → 失败

## 关键技术决策

- **SSE 流式输出**：AI 回复和怒气值更新通过 Server-Sent Events 实时推送
- **怒气值标记**：LLM 在回复开头输出 `[ANGER:+/-N]` 标记，后端解析后转为 SSE event
- **上下文窗口**：保留最近 6 轮对话（`chatMessages.slice(-6)`）
- **头像存储**：本地 `/public/` 目录

## 构建与运行

- `pnpm install` — 安装依赖
- `pnpm run dev` — 开发模式 (端口 5000, HMR)
- `pnpm run build` — 生产构建
- `pnpm run start` — 生产启动