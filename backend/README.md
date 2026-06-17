# 精英销售成长社区 (Elite Sales Growth Community)

销售社区系统后端 API，基于 FastAPI 构建。

## 项目结构

```
EliteSalesGrowthCommunity/
├── src/
│   ├── main.py              # 应用入口
│   ├── config.py            # 配置
│   ├── database.py          # 数据库连接
│   ├── auth/                # 用户认证（注册/登录/JWT）
│   ├── discovery/           # 发现首页（聚合数据）
│   ├── experts/             # 销售智库（专家列表/详情）
│   ├── jobs/                # 人才集市（职位发布/筛选）
│   ├── posts/               # 同行交流（帖子/评论）
│   ├── content/             # 内容精选（资料/案例/更新）
│   ├── bookings/            # 咨询预约
│   ├── questions/           # 热门销售问题
│   ├── users/               # 个人中心（收藏/通知/看板）
│   └── shared/              # 共享工具
├── tests/
├── data/                    # 数据库存储（自动创建）
├── uploads/                 # 上传文件（自动创建）
├── pyproject.toml
├── .env
└── README.md
```

## 快速开始

```bash
# 1. 创建虚拟环境并安装依赖
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# 或 .venv\Scripts\activate  # Windows
pip install -r requirements.txt

# 2. 启动开发服务器
uvicorn src.main:app --reload

# 3. 打开 API 文档
# http://localhost:8000/docs
```

## API 概览

| 模块 | 前缀 | 说明 |
|------|------|------|
| 认证 | `/api/auth` | 注册、登录、JWT、短信验证、找回密码 |
| 发现首页 | `/api/discovery` | 热门问题、智库推荐、职位、内容、讨论 |
| 销售智库 | `/api/experts` | 专家列表/详情/筛选、案例、可预约时间 |
| 人才集市 | `/api/jobs` | 职位列表/筛选/发布 |
| 同行交流 | `/api/posts` | 帖子 CRUD、评论、点赞 |
| 内容精选 | `/api/content` | 内容列表/详情/点赞 |
| 咨询预约 | `/api/bookings` | 预约创建/状态流转 |
| 热门问题 | `/api/questions` | 问题 CRUD、回答 |
| 个人中心 | `/api/users` | 看板、收藏、通知 |

## 配置

环境变量（`.env`）：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./data/database.db` | 数据库连接 |
| `SECRET_KEY` | 开发密钥 | JWT 密钥 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 1440 | Token 过期时间(24h) |

## 模块说明

### 发现首页 (`/api/discovery`)
聚合 5 个板块数据：热门问题、销售智库、人才集市、内容精选、热门讨论

### 销售智库 (`/api/experts`)
专家按领域、价格、评分筛选和排序，支持案例管理和可预约时间配置

### 人才集市 (`/api/jobs`)
职位筛选（类型/行业/城市），支持急招和内推标签，薪资范围显示

### 同行交流 (`/api/posts`)
帖子按最新/热门/精华排序，分类（经验分享/求助提问/行业动态），匿名发布

### 咨询预约 (`/api/bookings`)
四步预约流程：选类型 → 自动生成话术 → 填写表单 → 展示联系方式

### 个人中心 (`/api/users`)
我的提问/回答/预约/收藏/通知，通知红点提示
