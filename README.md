# AInnoStar

产品全生命周期智能管理平台，覆盖「用户调研 → 需求管理 → 文档编写 → 原型预览」完整链路。

## 核心功能

**用户调研** — 调研项目管理、访谈记录、AI 自动转录与洞察标签提取

**需求池** — 看板/列表双视图、拖拽切换状态、多来源筛选（调研洞察 / 用户反馈 / 内部提案 / 竞品对标 / 客户需求）、P0-P2 优先级管理

**PRD 文档** — 结构化章节编辑器（背景 / 目标 / 用户画像 / 功能清单 / 业务流程 / 验收标准 / 非功能需求），标准 / 敏捷 / 详细三套模板，AI 自动生成初稿，版本历史管理

**技术文档** — 技术方案、API 文档、数据库设计、部署方案统一管理

**客户文档** — 收文（客户提供）/ 发文（我方提交）双向管理，支持关联项目

**AI 原型** — 三条生成路径：多 Agent 流水线、MCP/Skill 外接工具、挂载本地项目 iframe 预览。内置汇报工作台：Markdown 会议记录 + 实时语音转文字

**项目管理** — 项目维度串联需求、文档、原型，支持客户名称和项目编号

## 技术栈

| 层 | 技术 |
|----|------|
| 后端 | Python 3.12、FastAPI、SQLAlchemy、Alembic、MySQL |
| 前端 | React 18、TypeScript、Vite、TailwindCSS 4 |
| 认证 | JWT（python-jose + bcrypt） |
| 设计 | Glassmorphism、Lucide React 图标 |

## 快速启动

### 后端

```bash
cd backend
cp .env.example .env   # 编辑 .env 填入数据库连接等配置
pip install -r requirements.txt
python -m alembic upgrade head
uvicorn app.main:app --reload
```

访问 `http://localhost:8000/docs` 查看 API 文档。

### 前端

```bash
cd frontend
npm install
npm run dev
```

访问 `http://localhost:5173`。

## 项目结构

```
AInnoStar/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST API 路由
│   │   ├── models/          # SQLAlchemy 数据模型
│   │   ├── schemas/         # Pydantic 请求/响应
│   │   ├── services/        # 业务逻辑（AI 调用封装）
│   │   └── utils/           # JWT、密码哈希
│   └── migrations/          # Alembic 数据库迁移
├── frontend/
│   └── src/
│       ├── components/      # Layout、Sidebar
│       ├── pages/           # 各模块页面
│       ├── hooks/           # useAuth
│       └── lib/             # API 封装
└── UI-Design.md             # 视觉设计规范
```
