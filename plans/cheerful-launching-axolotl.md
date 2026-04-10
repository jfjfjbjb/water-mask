# 批量文件上传卡顿优化方案

## 问题分析

当一次选择大量文件（如 50+ 张）时，即使单个 `createObjectURL` 很快，但同步执行多个仍会造成主线程阻塞：

```
用户选择 50 张图片
    ↓
handleChange 触发
    ↓
setFileList(50个文件)
    ↓
React 批量渲染 50 个 AsyncImage
    ↓
每个 useEffect 同步调用 URL.createObjectURL
    ↓
主线程被阻塞，出现卡顿
```

## 解决方案：分批异步处理

使用 `requestIdleCallback` 或 `requestAnimationFrame` 将大量 `createObjectURL` 调用分摊到多帧中执行，避免一次性阻塞主线程。

---

## 方案 A：使用 `requestIdleCallback`（推荐）

**原理**：利用浏览器空闲时间分批处理，每次处理少量文件

**改动位置**：`src/App.tsx`

```typescript
// 批量创建 objectURL，使用 requestIdleCallback 分帧处理
const batchCreateObjectUrls = (files: UploadFile[], onProgress: (file: UploadFile, url: string) => void) => {
  const BATCH_SIZE = 5; // 每批处理数量
  let index = 0;

  const processBatch = (deadline: IdleDeadline) => {
    while (index < files.length && deadline.timeRemaining() > 0) {
      const file = files[index];
      const url = URL.createObjectURL(file.originFileObj as File);
      onProgress(file, url);
      index++;

      // 每处理一个就更新状态，避免最后一次性刷新
      setFileList((prev) =>
        prev.map((f) => (f.uid === file.uid ? { ...f, objectUrl: url } : f))
      );
    }

    if (index < files.length) {
      requestIdleCallback(processBatch, { timeout: 100 });
    }
  };

  requestIdleCallback(processBatch, { timeout: 100 });
};
```

**优点**：
- 利用浏览器空闲时间，不影响用户交互
- 每处理一个就更新一次状态，列表逐步呈现
- 有超时保护，不会无限等待

**缺点**：
- `requestIdleCallback` 在某些浏览器（如 Safari < 13）不支持，需要 polyfill

---

## 方案 B：使用 `requestAnimationFrame` 分批

**原理**：将大量操作分散到多帧，每帧处理少量文件

**改动位置**：`src/App.tsx`

```typescript
const BATCH_SIZE = 3;
let pendingFiles: UploadFile[] = [];
let rafId: number | null = null;

const processNextBatch = () => {
  const batch = pendingFiles.splice(0, BATCH_SIZE);
  batch.forEach((file) => {
    const url = URL.createObjectURL(file.originFileObj as File);
    setFileList((prev) =>
      prev.map((f) => (f.uid === file.uid ? { ...f, objectUrl: url } : f))
    );
  });

  if (pendingFiles.length > 0) {
    rafId = requestAnimationFrame(processNextBatch);
  }
};

const queueFilesForProcessing = (files: UploadFile[]) => {
  pendingFiles = [...pendingFiles, ...files];
  if (!rafId) {
    rafId = requestAnimationFrame(processNextBatch);
  }
};
```

**优点**：
- 兼容性更好，所有现代浏览器都支持
- 分帧清晰，每帧处理固定数量

**缺点**：
- `requestAnimationFrame` 在后台标签页会暂停，需要注意

---

## 方案 C：使用 Web Worker 处理（最彻底）

**原理**：将 objectURL 创建移到 Worker 线程，不阻塞主线程

**改动位置**：
- 新建 `src/workers/objectUrlWorker.ts`
- 修改 `src/App.tsx`

```typescript
// objectUrlWorker.ts
self.onmessage = (e: MessageEvent) => {
  const { file, uid } = e.data;
  const url = URL.createObjectURL(file);
  self.postMessage({ uid, url });
};

// App.tsx
const worker = new Worker(new URL('./workers/objectUrlWorker.ts', import.meta.url), { type: 'module' });

worker.onmessage = (e) => {
  const { uid, url } = e.data;
  setFileList((prev) =>
    prev.map((f) => (f.uid === uid ? { ...f, objectUrl: url } : f))
  );
};

const processFile = (file: UploadFile) => {
  worker.postMessage({ file: file.originFileObj, uid: file.uid });
};
```

**优点**：完全不影响主线程
**缺点**：实现复杂，Worker 中无法访问 `URL.createObjectURL`（实际上 Worker 支持创建 blob URL）

---

## 推荐方案

**推荐方案 A（requestIdleCallback）**，原因：
1. 用户体验最好 - 列表逐步呈现，有加载感但不会卡顿
2. 实现相对简单
3. 不影响用户后续操作

**备选方案 B（requestAnimationFrame）**：
- 如果需要更好的浏览器兼容性
- 或者配合 loading 状态让用户知道正在处理

---

## 改动文件清单

| 文件 | 改动说明 |
|------|----------|
| `src/App.tsx` | 添加批量处理逻辑，修改 `handleChange` |
| `src/components/AsyncImage/Index.tsx` | 从 `file.objectUrl` 读取 URL（如果已有） |

---

## 验证方法

1. 打开 Chrome DevTools Performance 面板
2. 选择 50+ 张大图（每张 5MB+）
3. 录制上传操作
4. 观察 Main Thread：
   - 优化前：会有长任务（> 300ms）阻塞
   - 优化后：多个短任务（< 50ms）分散执行，列表逐步渲染
