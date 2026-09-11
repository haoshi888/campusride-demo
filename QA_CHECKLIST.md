# QA Checklist

验收日期：2026-09-11  
验收方式：TypeScript、ESLint、规则单测、Next.js 生产构建、浏览器端完整流程自测。

## Auth

- [x] 手机号登录 / 注册
- [x] Demo 手机验证码
- [x] 学校选择
- [x] 校园邮箱发送验证码
- [x] 校园邮箱认证
- [x] 未认证用户只能浏览
- [x] 服务层阻止未认证用户发布 / 加入

## Trip

- [x] 创建 Trip
- [x] 未来 3 天限制
- [x] 时间弹性
- [x] 人数规则
- [x] 行李数量与尺寸
- [x] 超大件标记
- [x] 匹配范围
- [x] 搜索 Trip
- [x] 查看 Trip 详情
- [x] 加入 Trip
- [x] 退出 Trip
- [x] 发起人取消 Trip
- [x] 已满 / 已取消 / Solo 状态禁止加入

## Matching

- [x] 同校优先
- [x] 同城高校扩展
- [x] 所有高校扩展
- [x] 时间排序
- [x] 路线与学校等级排序
- [x] 匹配分拆解展示
- [x] 不使用 AI 黑盒

## Group

- [x] 达到最低人数自动成团
- [x] 达到最大人数变为 FULL
- [x] 成员退出后重新计算人数
- [x] 成员列表
- [x] 成团群聊
- [x] 敏感词提示

## Payment

- [x] 费用范围展示
- [x] 模拟费用承诺
- [x] PaymentCommitment 状态更新
- [x] 明确标注不产生真实扣款

## Departure

- [x] 出发提醒
- [x] 模拟叫车
- [x] 模拟司机、车型、车牌
- [x] 确认到达
- [x] 行程完成
- [x] 评价引导

## Solo

- [x] 用户自行设置截止时间
- [x] 截止时间至少为出发前 15 分钟
- [x] 到截止时间且未成团自动进入 SOLO_MODE
- [x] 状态重算不依赖前端假数据

## Review

- [x] 五星评分
- [x] 正 / 负面标签
- [x] 评价保存
- [x] 用户评分更新
- [x] 准时率异常标签处理

## Safety

- [x] 校园认证
- [x] 手机号认证
- [x] 举报提交
- [x] 举报保存
- [x] 拉黑
- [x] 拉黑后匹配过滤

## Admin

- [x] Dashboard 统计
- [x] 用户列表
- [x] 用户禁用 / 恢复
- [x] Trip 列表
- [x] 违规 Trip 下架
- [x] 举报列表
- [x] 举报标记处理 / 驳回

## UX / Responsive

- [x] Mobile-first
- [x] 手机端底部导航
- [x] 平板和桌面端响应式布局
- [x] Skeleton / Loading
- [x] Toast / Error
- [x] Empty States
- [x] 所有模拟能力有明确标识
- [x] 无 Lorem ipsum
- [x] 无 TODO 占位核心流程

## Automated Verification

- [x] `tsc --noEmit`
- [x] `eslint .`
- [x] `node scripts/test-logic.ts`
- [x] `next build`
- [x] Demo Seed 可在干净数据库中重建

## 已知限制

- [ ] 真实短信、校园 SSO、真实支付、地图、GPS、网约车 API 均不在 Demo 范围内。
- [ ] 聊天采用 4 秒轮询，不具备生产级实时性和消息投递保障。
- [ ] Demo 时间使用 Cookie 保存偏移，适合演示，不替代生产调度系统。
- [ ] 管理员删除 Trip 采用软删除 / 取消，不物理删除审计数据。
