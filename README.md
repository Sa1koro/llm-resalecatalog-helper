# llm-resalecatalog-helper 📦 ResaleBox (断舍离中心)

> 一个以 AI 驱动的二手物品流转与跨平台营销管理系统，支持提示词导入/导出与多平台文案分发。
> An AI‑prompt–driven resale catalog and omnichannel marketing system with prompt import/export and multi‑platform copy distribution.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)](https://tailwindcss.com/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSa1koro%2Fllm-resalecatalog-helper)

[🌍 访问线上预览 (Live Demo)](https://rsb.saikoro.me/) | [📄 查看 Figma 设计复盘](https://www.figma.com/board/MHpSxlS05dWj50BrBSEgyG/ResaleBox?node-id=0-1&t=Z3VEngMscwBNKOwa-1)

## ✨ 核心亮点 (Core Features)

- **🌗 现代化 UI 与双语架构**：自研轻量级 i18n 响应系统，支持无缝中英热切换；提取全局 Design Tokens，完美支持深浅色模式 (Dark/Light Mode)。
- **🤖 AI 提示词工作流 (Prompt Workflow)**：支持提示词导入/导出、模板化管理与批量生成商品文案，形成可复用的内容资产。
- **📣 多平台文案分发 (Omnichannel Copy Distribution)**：一键生成并适配多平台文案与图文素材，减少重复运营成本。
- **🛠 沉浸式 B 端管理后台**：支持表格内一键状态切换与拖拽排序 (Drag & Drop)；通过多 Tabs 逻辑降维，优雅处理组合套装 (Bundle) 的跨实体关系绑定[...]
- **🚀 自动化全渠道营销 (Omnichannel)**：首创“一键多端铺货”功能，结合浏览器原生 Clipboard/Canvas API，将底层结构化商品数据动态编译为适配小红书[...]
- **⚡️ 极致交互体验**：采用高内聚组件化设计，集成 Web Share API，基于乐观更新 (Optimistic UI) 保障弱网环境下的前端零延迟反馈。

## 💻 技术栈 (Tech Stack)

- **前端框架:** Next.js (App Router), React, TypeScript
- **样式与设计:** Tailwind CSS, Radix UI, CSS Variables
- **数据与存储:** Supabase (PostgreSQL), Vercel Blob
- **工程化:** ESLint, Prettier, Vercel CI/CD

## 📂 核心代码导航 (Code Navigation)

- `lib/types.ts` & `app-context.tsx`: 轻量级双语架构与全局状态流转核心实现。
- `components/item-form-modal.tsx`: 复杂多 Tab 关联数据表单与拖拽上传逻辑。
- `components/import-tool.tsx`: 帖子跨平台文案 AST 生成与 Canvas 图片处理引擎。
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Supabase Security Setup

This project now uses server-side admin write APIs for the admin panel.

1. Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
   - `ADMIN_SESSION_SECRET` (random long string)
   - `BLOB_READ_WRITE_TOKEN` (if image upload is used)
2. In Supabase SQL Editor, run `scripts/004_enable_rls_and_read_policies.sql`.
3. Deploy with the same environment variables set in your hosting platform.

After this setup:
- Storefront stays publicly readable.
- Admin panel writes go through `app/api/admin/*` with secure HttpOnly cookie session.
- Anonymous direct writes to tables are blocked by RLS.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/Sa1koro/llm-resalecatalog-helper" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=tru[...]
