import type { UploadFile } from "antd";

const BATCH_SIZE = 5;

export function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}

export function processFilesInBatches(
  files: UploadFile[],
  getObjectUrlCache: () => Record<string, string>,
  onCacheUpdate: (cache: Record<string, string>) => void,
): void {
  let index = 0;

  const processBatch = (deadline: IdleDeadline) => {
    const objectUrlCache = getObjectUrlCache();
    let processed = 0;
    while (
      index < files.length &&
      processed < BATCH_SIZE &&
      deadline.timeRemaining() > 0
    ) {
      const file = files[index];
      const uid = file.uid;
      if (!objectUrlCache[uid] && file.originFileObj) {
        const url = createObjectURL(file.originFileObj as File);
        onCacheUpdate((prev) => ({ ...prev, [uid]: url }));
      }
      index++;
      processed++;
    }

    if (index < files.length) {
      requestIdleCallback(processBatch, { timeout: 100 });
    }
  };

  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(processBatch, { timeout: 100 });
  } else {
    const objectUrlCache = getObjectUrlCache();
    files.forEach((file) => {
      const uid = file.uid;
      if (!objectUrlCache[uid] && file.originFileObj) {
        const url = createObjectURL(file.originFileObj as File);
        onCacheUpdate((prev) => ({ ...prev, [uid]: url }));
      }
    });
  }
}

export function createUploadFile(file: File): UploadFile {
  return {
    uid: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    originFileObj: file,
    name: file.name,
    size: file.size,
    status: "done",
  };
}