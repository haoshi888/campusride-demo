# CampusRide｜校园同校拼车 Web Demo

CampusRide 是面向高校学生返校 / 离校场景的同校优先拼车撮合 Demo。平台不替代网约车，而是帮助学生先找到可信同行者：**能拼车降低成本，拼不到则自动切换单独出行，不耽误正常安排。**

## 产品定位

- 核心场景：机场 / 高铁站 ↔ 学校
- 核心价值：找到同校、同路、时间接近的可信同行者
- 匹配方式：学校、路线、时间、行李、余位综合的**规则匹配**
- 校园信任：手机号验证 + 校园邮箱认证
- 失败兜底：用户自行设置等待截止时间，未成团自动进入 `SOLO_MODE`
- 资金边界：全部为模拟费用承诺，不接支付平台、不产生真实扣款
- 出行边界：司机、车牌、叫车过程均为 Demo 模拟数据，不调用真实网约车 API

## 技术栈

- Next.js 15 App Router
- React 19 + TypeScript
- Tailwind CSS 3
- Prisma ORM + SQLite
- Lucide React 图标、Sonner Toast
- 服务端 Cookie Demo 会话

## 部署上线

完整的新手部署步骤见 [DEPLOYMENT.md](./DEPLOYMENT.md)。项目已经支持 Vercel + PostgreSQL 部署模式。

## 快速启动

推荐使用 Node.js 20+ 与 pnpm：

```bash
pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

访问 <http://localhost:3000>。

如果需要完整重置数据库：

```bash
pnpm db:reset
```

数据库文件默认位于 `prisma/dev.db`。`.env` 已提供 Demo 配置：

```env
DATABASE_URL="file:./dev.db"
DEMO_MODE="true"
```

## Demo 账号

Demo 不发送真实短信。输入任意预置手机号后，固定手机验证码为：

```text
123456
```

预置用户：

| 手机号 | 用户 | 学校 | 角色 / 说明 |
| --- | --- | --- | --- |
| 13800000001 | 王同学 | XX大学 | 管理员，适合演示后台 |
| 13800000002 | 李同学 | XX大学 | 发起人 |
| 13800000003 | 陈同学 | ZZ大学 | 跨校用户 |
| 13800000004 | 赵同学 | YY大学 | 同城高校 |
| 13800000005 | 孙同学 | XX大学 | 未完成校园认证 |
| 13800000006 | 周同学 | XX大学 | 干净账号，适合演示加入拼车 |

校园邮箱认证固定验证码：

```text
888888
```

支持域名：`@xx.edu.cn`、`@yy.edu.cn`、`@zz.edu.cn`。

登录页也提供“以王同学身份进入”的快捷入口。

## Demo 时间控制器

Demo 初始时间固定为：

```text
2026-09-20 17:00
```

页面右下角可执行：

- `+10 分钟`
- `+30 分钟`
- `+60 分钟`
- 恢复初始时间

时间变化后会调用 `resolveTripStatus(trip, now)` 重新计算：

```text
FORMING → CONFIRMED
CONFIRMED → DEPARTURE_PENDING
FORMING/PUBLISHED → SOLO_MODE
DEPARTURE_PENDING → EXPIRED（超出出发时间 2 小时后）
```

## 核心功能

### 认证与权限

- 手机号登录 / 注册
- 学校选择
- 校园邮箱认证
- 未认证用户只允许浏览，服务层禁止发布和加入
- 手机号默认脱敏展示

### 结构化 Trip

- 出发地、目的地、日期、时间
- ±0 / 15 / 30 / 60 分钟时间弹性
- 当前人数、最低成团人数、最大人数
- 行李数量、尺寸、超大件标记
- 同校 / 同城 / 所有高校匹配范围
- 出发前 30 / 60 / 90 / 120 分钟停止等待

### 规则匹配

总分 100 分：

| 维度 | 分值 | 规则 |
| --- | ---: | --- |
| 学校 | 45 | 同校 45，同城高校 29，跨校 12 |
| 路线 | 30 | 同出发地同目的地 30，目的地接近 23，出发地接近 19 |
| 时间 | 20 | 0–15 分钟 20，15–30 分钟 17，30–60 分钟 14，60–120 分钟 10 |
| 行李 | 5 | 无超大件且总行李在容量内得 5 |
| 余位 | 5 | 未满员得 5 |

排序等级：

```text
Level 1：同校 + 同出发地 + 同目的地
Level 2：同校 + 同出发地 + 目的地相近
Level 3：同校 + 目的地相同 + 出发地不同
Level 4：同城高校
Level 5：所有高校
```

同等级内按匹配分和时间差排序。前端展示每一项分数拆解，不使用 AI 黑盒。

### Trip 状态机

支持：

```text
DRAFT
PUBLISHED
FORMING
CONFIRMED
FULL
DEPARTURE_PENDING
TRAVELING
COMPLETED
SOLO_MODE
CANCELLED
EXPIRED
```

规则集中在 `src/lib/status.ts` 的 `resolveTripStatus()`。

### 成团与成员变化

- `currentMembers >= minMembers`：进入 `CONFIRMED`
- `currentMembers === maxMembers`：进入 `FULL`
- 普通成员退出后重新计算状态
- 人数从成团回落到最低人数以下时恢复 `FORMING`
- 发起人取消后向全部成员发送站内通知

### 聊天与安全

- 成团后群聊
- 匹配前可联系发起人
- 敏感词基础检测
- 举报类型完整保存
- 拉黑后不再进入匹配结果，并阻止新的加入

### 模拟费用与出行

- 加入后生成 `PaymentCommitment`
- 确认费用只更新数据库状态
- 明确显示“本 Demo 为模拟支付，不产生真实扣款”
- 模拟寻找司机、司机信息、车牌核对
- “确认已到达”后进入 `COMPLETED`
- 完成后进入评价流程

### 管理员后台

路由：`/admin`

- 注册用户
- 认证用户
- 活跃 Trip
- 成功拼车人数
- 待处理举报
- 用户禁用 / 恢复
- 违规 Trip 下架
- 举报处理 / 驳回

## 预置数据

Seed 包含：

- 3 所学校：XX大学、YY大学、ZZ大学
- XX大学与 YY大学同城
- 6 位 Demo 用户
- 14 条 Trip
- 覆盖同校、同城、跨校、未成团、满员、已成团、待出发、行程中、已完成、Solo、Cancelled 等状态
- 群聊、私聊消息、通知、费用承诺、评价和举报样本

## Demo 演示流程

### 路径 A：成功拼车

1. `/login` 使用 `13800000006 / 123456` 登录周同学。
2. 进入 `/search`，搜索“浦东国际机场 → XX大学，9月20日 18:00”。
3. 打开“李同学”的 18:20 行程。
4. 点击“申请加入”，确认行李信息。
5. 加入后人数达到 `minMembers`，状态从 `FORMING` 变为 `CONFIRMED`。
6. 点击“确认费用承诺”，完成模拟费用。
7. 进入群聊发送消息。
8. 在行程详情点击“开始打车”，查看模拟司机。
9. 点击“开始行程”，再点击“确认已到达”。
10. 进入“评价你的车友”，提交评分和标签。

### 路径 B：未拼成车

1. 使用已认证账号进入 `/trips/create`。
2. 设置一个未来时间，并将截止时间设为出发前 60 分钟。
3. 发布后保持 `1 / 3`，不邀请其他成员。
4. 使用右下角 Demo 时间控制器快进。
5. 到达截止时间后，状态自动变为 `SOLO_MODE`。
6. 页面提示“拼车未成功 / 已切换为单独出行模式”，并引导用户自行叫车。

## 测试命令

```bash
pnpm typecheck
pnpm lint
pnpm test:logic
pnpm build
```

规则测试位于 `scripts/test-logic.ts`。

## 项目结构

```text
src/
  app/                  页面与 API Route Handlers
  components/           移动优先 UI 与业务组件
  lib/                  状态机、匹配算法、认证、Prisma、工具函数
  services/             auth / trip / matching / chat / payment / review / report / notification
prisma/
  schema.prisma         SQLite 数据模型
  seed.ts               Demo Seed Data
scripts/
  test-logic.ts         匹配算法与状态机测试
```

## 已知限制

- 所有认证、支付、叫车和司机信息均为 Demo 模拟。
- 不接地图、定位、GPS、真实短信或校园 SSO。
- 群聊使用轮询刷新，不是 WebSocket。
- 移动端与桌面端均支持，但未做原生 App。
- 管理员权限仅通过 Seed 用户的 `isAdmin` 字段模拟。

<!-- deployment trigger: 2026-09-12 -->
