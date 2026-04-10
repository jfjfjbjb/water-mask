# 图片初始化性能优化方案

## Context

用户选择 20 张 3MB 图片时白屏 3 秒。根本原因是：所有图片同时渲染和解码，Ant Design Image 组件即使显示 48x48 缩略图也会解码完整 3MB 图片。

## 性能瓶颈分析

| 问题 | 严重性 | 影响 |
|------|--------|------|
| 无虚拟列表，20图片同时挂载 | **关键** | 3秒+冻结 |
| requestIdleCallback 批大小仅5 | 高 | 初始化慢 |
| 首个文件被处理两次 | 中 | 浪费计算 |
| Image 组件解码全分辨率用于缩略图 | 高 | 60MB总解码量 |
| 无懒加载 | 高 | 立即加载全部 |

## 优化方案

### 1. 实现缩略图 + 懒加载（推荐）

**修改文件**: `src/components/AsyncImage/Index.tsx`

创建缩略图后用 `IntersectionObserver` 懒加载：

```tsx
// 核心思路：
// 1. 先创建小缩略图显示（降低分辨率到 200px 左右）
// 2. 缩略图加载成功后，再在后台加载完整图片
// 3. 使用 IntersectionObserver 只在可见时加载
```

**工具函数** `src/utils/thumbnail.ts`:
- 使用 `createImageBitmap` 快速缩放
- 返回 base64 小图

### 2. 修复批处理逻辑

**修改文件**: `src/App.tsx`

```tsx
// 修复点 1: 移除重复处理首个文件
// handleChange 中已创建首个文件的 objectURL，无需在 processFilesInBatches 中再处理一次

// 修复点 2: 增大批处理量
const BATCH_SIZE = 10; // 改为 10

// 修复点 3: timeRemaining 为 0 时至少处理 3-5 个文件
```

### 3. 虚拟列表（可选，更复杂）

如果缩略图方案不够，再考虑 `react-window`。需要较大改动。

## 关键文件

- `src/components/AsyncImage/Index.tsx` - 改用缩略图 + 懒加载
- `src/App.tsx` - 修复批处理逻辑，避免重复处理

## 验证方式

1. `npm run dev` 启动
2. 一次选择 20 张 3MB 图片
3. 观察：
   - 白屏时间应 < 500ms
   - 缩略图逐个出现（而非等待全部）
   - 选中图片后完整图片逐渐清晰