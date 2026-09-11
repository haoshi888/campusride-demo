# CampusRide 上线部署指南

这份指南按“完全新手”的方式编写。推荐路线：

```text
本地 ZIP
  ↓
GitHub 公开仓库
  ↓
Neon PostgreSQL 免费数据库
  ↓
Vercel 导入并部署
```

> 重要：Vercel 不能持久化 SQLite 文件。项目已经增加了 PostgreSQL 部署模式：
>
> - 本地默认使用 `prisma/schema.prisma`（SQLite）
> - Vercel 使用 `prisma/schema.postgresql.prisma`（PostgreSQL）
> - `vercel-build` 会自动生成 PostgreSQL Client、建表，并仅在空数据库时写入 Demo Seed

## 0. 已为你生成的文件

部署源码压缩包：

```text
D:\codex\carpool\CampusRide-deploy.zip
```

请不要把 `node_modules`、`.next`、`.env` 或 `prisma/dev.db` 上传到 GitHub。

## 1. 解压部署包

1. 打开文件资源管理器。
2. 进入 `D:\codex\carpool`。
3. 找到 `CampusRide-deploy.zip`。
4. 右键选择“全部解压缩”。
5. 解压到一个容易找到的目录，例如：

```text
D:\CampusRide-deploy
```

解压后应该能看到：

```text
src
prisma
scripts
package.json
pnpm-lock.yaml
vercel.json
README.md
```

## 2. 在 GitHub 创建公开仓库

已经为你打开了 GitHub 新建仓库页面。按下面填写：

1. **Owner**：选择你的 GitHub 账号。
2. **Repository name**：填写 `campusride-demo`。
3. **Description**：可以填写：

```text
校园同校拼车产品 Demo，Next.js + Prisma + PostgreSQL
```

4. 选择 **Public**。
5. 不要勾选 “Add a README file”。
6. 不要勾选 “Add .gitignore”。
7. 不要选择 License。
8. 点击 **Create repository**。

这会创建一个空仓库，方便直接上传代码。

## 3. 把代码上传到 GitHub

创建仓库后，GitHub 会显示一个空仓库页面。

1. 点击 **uploading an existing file**。
2. 打开刚才解压后的目录 `D:\CampusRide-deploy`。
3. 全选里面的文件和文件夹：

```text
src
prisma
scripts
.env.example
.gitignore
README.md
QA_CHECKLIST.md
DEPLOYMENT.md
eslint.config.mjs
next-env.d.ts
next.config.ts
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
postcss.config.mjs
tailwind.config.ts
tsconfig.json
vercel.json
```

4. 将这些内容拖入 GitHub 上传区域。
5. Commit message 填写：

```text
Initial CampusRide demo
```

6. 点击 **Commit changes**。
7. 等待 GitHub 完成上传。
8. 确认仓库首页能看到 `src`、`prisma`、`package.json` 等文件。

如果 GitHub 网页上传不稳定，可以使用 Git 命令：

```powershell
cd D:\CampusRide-deploy
git init
git add .
git commit -m "Initial CampusRide demo"
git branch -M main
git remote add origin https://github.com/你的用户名/campusride-demo.git
git push -u origin main
```

## 4. 创建 PostgreSQL 数据库

Vercel 需要一个云数据库。推荐使用 Neon，免费额度足够 Demo。

1. 打开 <https://neon.com> 并注册 / 登录。
2. 点击 **Create project**。
3. Project name 填写 `campusride`。
4. Region 优先选择离你或 Vercel 部署区域较近的区域。
5. 创建项目。
6. 在项目 Dashboard 找到 **Connect** 或 **Connection string**。
7. 复制 **Direct connection** / **Non-pooling connection string**。
8. 连接串通常长这样：

```text
postgresql://用户名:密码@ep-xxxx.region.aws.neon.tech/campusride?sslmode=require
```

请优先使用不带 `-pooler` 的 Direct URL 作为 `DATABASE_URL`，因为部署时会执行 `prisma db push`。

## 5. 在 Vercel 导入 GitHub 仓库

已经为你打开了 Vercel 导入页面。

1. 登录 <https://vercel.com>。
2. 如果首次使用，选择 **Hobby** 免费计划。
3. 在 Vercel 中连接你的 GitHub 账号。
4. 回到 **Add New → Project**。
5. 在列表中找到 `campusride-demo`。
6. 点击 **Import**。
7. Framework Preset 应自动识别为 **Next.js**。
8. Root Directory 保持默认。
9. Build Command 保持项目中的 `vercel.json` 自动配置：

```text
pnpm vercel-build
```

## 6. 配置 Vercel 环境变量

在点击 Deploy 之前，展开 **Environment Variables**，添加：

| Name | Value |
| --- | --- |
| `DATABASE_URL` | 第 4 步复制的 Neon Direct Connection String |
| `DEMO_MODE` | `true` |

确认环境变量应用到：

```text
Production
Preview
Development
```

然后点击 **Deploy**。

## 7. 查看构建日志

Vercel 会依次执行：

```text
pnpm install
pnpm vercel-build
  ├─ prisma generate --schema prisma/schema.postgresql.prisma
  ├─ prisma db push --schema prisma/schema.postgresql.prisma
  ├─ tsx scripts/seed-if-empty.ts
  └─ next build
```

- 如果数据库为空，会自动写入 3 所学校、6 位用户、14 条 Trip。
- 如果数据库已经有数据，会跳过 Seed，不会覆盖线上数据。
- 构建成功后，Vercel 会给出类似 `https://campusride-demo.vercel.app` 的公开地址。

## 8. 验证部署

打开：

```text
https://你的项目地址/api/health
```

正常结果应类似：

```json
{
  "ok": true,
  "demo": true,
  "schools": 3,
  "trips": 14,
  "users": 6
}
```

然后打开首页，测试：

1. 登录：`13800000001`
2. 手机验证码：`123456`
3. 搜索：浦东国际机场 → XX大学
4. 加入行程
5. 模拟费用承诺
6. 群聊
7. Demo 时间快进
8. 管理员后台

## 9. 以后如何更新线上版本

修改代码后：

```powershell
git add .
git commit -m "Update CampusRide"
git push
```

Vercel 会自动拉取 GitHub 最新代码并重新部署。

## 常见错误

### `DATABASE_URL must start with postgresql://`

Vercel 中的 `DATABASE_URL` 还是 SQLite 地址，或者没有配置。请改成 Neon PostgreSQL Direct URL。

### `P1001: Can't reach database server`

检查：

- Neon 项目是否正在运行。
- 复制的是完整连接串。
- 使用 Direct / Non-pooling URL。
- 不要漏掉 `?sslmode=require`。

### Vercel 构建成功但页面没有 Demo 数据

查看 `vercel-build` 日志中 `seed-if-empty.ts` 的结果。如果数据库不是空的，Seed 会主动跳过。可以手动清空 Neon 表后重新部署，或本地执行：

```powershell
$env:DATABASE_URL="你的 Neon Direct URL"
pnpm db:seed:deploy
```

### GitHub 上传后仓库没有 `.env.example`

Windows 文件选择器可能默认隐藏以点开头的文件。可以单独打开仓库页面，使用 **Add file → Create new file** 创建：

```text
.env.example
```

内容：

```env
DATABASE_URL="file:./dev.db"
DEMO_MODE="true"
```

## 安全提示

- 不要把 `.env` 上传到 GitHub。
- 不要把 Neon 数据库密码写进 README 或公开 Issue。
- Vercel / Neon 的环境变量属于敏感信息。
- 本 Demo 的验证码、支付和司机都是模拟数据。
