# 药点 MediPoint — 前端战情室 (Frontend Dashboard)

> **Slogan:** 看懂舆论风向，做对每次备货
> **核心价值:** 结合「社群舆情」与「ERP 库存」的智慧采购决策系统
> **后端:** [MediPoint_backend](../MediPoint_backend) (FastAPI + MongoDB + DeepSeek)

---

## 📖 项目简介

**药点 MediPoint** 是一个面向药店的 B2B SaaS 战情室, 解决药店「备货滞后」与「库存积压」的痛点。

前端基于 Vue 3 + Vite, 提供三个角色 (总部管理者 / 区域督导 / 门店药师) 的差异化战情视图, 接入后端真实数据, 把「政府公告 / 流感周报 / 微博小红书舆情」与「ERP 库存」交叉比对, 给出一键式的补货/促销建议和药师行销话术。

### ✨ 核心功能 (Key Features)

1. **三角色战情室**
   - **总部管理者 (HQ Manager)** — 跨区域汇总, 紧急建议按信心等级 (A/B/C) 排序
   - **区域督导 (区域督导)** — 区域内门店对比, 待审核事项清单
   - **门店药师 (门店药师)** — 今日速报, 客流行销话术
2. **AI 采购决策** (`/decisions`)
   - 库存 × 舆情交叉分析, 自动生成「补货 / 促销」建议块
   - 每块带政府公告引用 (红标 🔔), 信心 A/B/C 颜色徽章
   - 异步加载药师行销话术 / 采购补货理由, 不阻塞页面
3. **AI 舆情分析** (`/sentiment`)
   - 微博/小红书/PTT/Dcard/政府公告 五源聚合
   - 关键词热度排行 + 7 日时序趋势 + 实体抽取 (药品/疾病/症状/品牌)
4. **RAG 药师 AI 助手** (`/chat` + 右下角浮窗)
   - 药品说明书 / SOP / FAQ / 公告 全库检索
   - DeepSeek 流式输出 (SSE), 带引用溯源
   - 检索弱相关时自动降级为通用 LLM
5. **法规速查** (`/regulations`)
   - NMPA / 福建卫健委 / 中国 CDC 公告按风险等级 (High/Medium/Low) 排序
6. **本地优先 + 离线降级**
   - `VITE_USE_MOCK=false` (默认) 走真实 API
   - 失败 fallback 到 mock 数据, 演示永不挂

---

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| Framework | Vue 3 (Composition API + `<script setup>`) |
| 路由 | Vue Router 4 |
| Build Tool | Vite 7 |
| 样式 | Tailwind CSS (CDN & Config) |
| HTTP | Fetch API (无 axios, 直接用 fetch + EventSource) |
| Markdown | (无) |
| 图表 | ECharts (备用) |
| PDF/CSV | jsPDF + html2canvas (采购单导出) |
| Node.js | 20+ |

---

## 📁 目录结构

```
MediPoint/
├── package.json
├── vite.config.js                  # Vite 配置 + /api proxy → 后端
├── index.html                       # 入口 HTML
├── .env / .env.production           # 环境变量
├── public/                          # 静态资源
├── src/
│   ├── main.js                      # 入口, 注册路由
│   ├── App.vue                      # 根组件
│   ├── router/index.js              # 路由表 (10 个 view)
│   ├── data/                        # mock 数据 + API 封装
│   │   ├── index.js                 # 重导出
│   │   ├── mockAccounts.js          # 5 个演示账号
│   │   ├── mockDashboard.js         # 战情室 mock
│   │   ├── mockDecisions.js         # 采购决策 mock
│   │   ├── mockSentiment.js         # 舆情 mock
│   │   ├── mockRegulations.js       # 法规 mock
│   │   └── mockChat.js              # 聊天 fallback 答案
│   ├── composables/                 # 跨组件逻辑
│   │   ├── useAuth.js               # 登录态 + currentRole
│   │   ├── useStoreScope.js         # 角色 → 可见门店范围
│   │   ├── useScopedLoader.js       # 通用数据加载器 (防过期请求)
│   │   └── useStoreData.js          # 真实 API + 30s 内存缓存
│   ├── components/                  # 通用组件
│   │   ├── NavBar.vue
│   │   ├── KpiCards.vue
│   │   ├── SuggestionCard.vue       # 决策卡片 (角色化面板)
│   │   ├── ScriptModal.vue          # 详情弹窗 (药师版 / 管理者版)
│   │   ├── AIChatPanel.vue          # 全屏 AI 助手
│   │   ├── AIChatWidget.vue         # 右下角浮窗
│   │   ├── AlertTicker.vue          # 顶部跑马灯
│   │   ├── InsightCard.vue
│   │   ├── RiskBadge.vue
│   │   ├── ConfidenceBadge.vue
│   │   └── ScriptModal.vue
│   └── views/                       # 路由页面
│       ├── LoginView.vue
│       ├── HQDashboard.vue
│       ├── RegionDashboard.vue
│       ├── StoreDashboard.vue
│       ├── DashboardView.vue        # 角色路由
│       ├── DecisionsView.vue
│       ├── SentimentView.vue
│       ├── RegulationsView.vue
│       ├── ChatView.vue
│       ├── StoresView.vue
│       └── StrategyView.vue
└── node_modules/
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd MediPoint
npm install
```

> **Node 20+** (Vite 7 要求), `npm` 或 `pnpm` 均可

### 2. 配置环境变量

编辑 `.env` (或 `.env.production`):

```bash
# 是否使用 mock 数据 (false = 走真实后端, true = 离线演示)
VITE_USE_MOCK=false

# 后端 API 地址 (开发环境 = localhost:3000, 生产 = 反代后域名)
VITE_API_BASE=http://localhost:3000

# 后端 HTTP Basic 鉴权 (与 MediPoint_backend/.env 的 DOCS_USERNAME/PASSWORD 一致)
VITE_API_USER=admin
VITE_API_PASS=admin123
```

> **Vite 代理** (`vite.config.js`): 开发环境所有 `/api/*` 请求自动转发到 `http://localhost:3000`, 浏览器无需 CORS 配置。

### 3. 启动开发服务器

```bash
npm run dev
# 默认 http://localhost:5173
# 也可访问 http://localhost:5174 (Vite 自动找下一个可用端口)
```

### 4. 构建生产产物

```bash
npm run build
# 产物在 dist/
npm run preview
# 本地预览生产产物
```

---

## 👥 演示账号 (5 个, 一键登录无密码)

| 姓名 | 邮箱 | 角色 | 可见门店 | 范围 |
|------|------|------|---------|------|
| 张三 | `zhang.hq@medipoint.cn` | HQ Manager | S001+S002+S003 | 全国 / 福建 / 福州 / 厦门 / 泉州 |
| 李四 | `li.region.xm@medipoint.cn` | 区域督导 | S002 | 厦门 |
| 王五 | `wang.region.fz@medipoint.cn` | 区域督导 | S001 | 福州 |
| 陈药师 | `chen.pharma.fz@medipoint.cn` | 门店药师 | S001 | 福州 |
| 林药师 | `lin.pharma.xm@medipoint.cn` | 门店药师 | S002 | 厦门 |
| 黄药师 | `huang.pharma.qz@medipoint.cn` | 门店药师 | S003 | 泉州 |

**Session 持久化:** localStorage `mediPointSession` (key = `email`), 关页面后保持登录。

---

## 🎨 角色差异化 UI

| 视图 | 总部管理者 | 区域督导 | 门店药师 |
|------|-----------|---------|---------|
| `/` 战情室 | 跨区域汇总 + 紧急建议 Top 5 | 区域内对比 + 待审核 | 今日速报 + 行销话术 |
| `/decisions` | 采购决策 (全功能) | 采购决策 (按门店) | 采购决策 (仅本店) |
| `SuggestionCard` 底部 | 📦 基于舆情的采购补货建议 (蓝色) | 同左 | 💡 药师行销话术 (绿色) |
| `ScriptModal` 详情 | 采购补货决策详情 (含 SKU 表 + 公告) | 同左 | 药师 AI 卫教助手 (含问诊检查点) |

实现: `<SuggestionCard :role="currentRole">` 决定底部面板颜色与文案, `<ScriptModal :role="currentRole">` 决定弹窗内容。

---

## 🌐 API 调用约定

所有 API 调用走 `src/composables/useStoreData.js`, 关键函数：

```js
import { fetchDashboard, fetchSentiment, fetchDecisions, fetchRegulations, sendChat, streamChat, fetchDecisionScript } from '@/composables/useStoreData'

// 30s 内存缓存 + in-flight 合并, 失败 fallback mock
const data = await fetchDashboard(account)

// SSE 流式 (chat 专用)
await streamChat(message, history, onDelta, onDone, signal, onReferences)

// 异步 LLM 脚本 (Decisions 卡片按需拉取, 30min 内存缓存)
const script = await fetchDecisionScript('S001|2026-06-03|Restock|感冒/退烧')
```

> **生产部署:** 把 `VITE_API_BASE` 设为后端公网域名, CORS allowlist 已在后端配置 (`app.py:114-122`)。

---

## 🧱 状态管理

- **登录态:** `useAuth.js` 暴露 `currentAccount` / `currentRole` (computed, 全局 reactive)
- **数据范围:** `useStoreScope.js` 根据 `currentRole` 算出可见门店列表 (`stores` / `scopeName`)
- **加载器:** `useScopedLoader(fetcher, assign, { watchSource })` — 防过期请求, 监听响应式源变化自动重载

---

## 🧪 排错

**1. 页面打开后空白, 控制台报 401**
检查 `.env` 中 `VITE_API_USER` / `VITE_API_PASS` 与后端 `DOCS_USERNAME` / `DOCS_PASSWORD` 一致。

**2. 战情室说「AI 正在分析...」一直不消失**
后端没起, 或 MongoDB 没数据。访问 `http://localhost:3000/health` 看状态。

**3. 决策卡片没显示话术**
后端 `/api/decisions/script` 慢, 等 3-5 秒, 或检查 DeepSeek key 是否有效。

**4. 重新启动后角色被踢回登录页**
`localStorage` 被清空, 重新点击账号卡片登录即可。

**5. 浮窗 AI 助手点发送没反应**
旧版本 bug (`_scrollRaf` 未声明) — 已修复, 升级到最新代码即可。

---

## 📜 许可

MIT
