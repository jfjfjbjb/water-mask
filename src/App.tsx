import { useRef, useState } from "react";
import {
  DeleteOutlined,
  DownloadOutlined,
  PictureOutlined,
  ZoomInOutlined,
  CameraOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Empty, Image } from "antd";
import type { UploadFile } from "antd";
import { snapdom } from "@zumer/snapdom";
import AsyncImage from "./components/AsyncImage/Index";
import ModifyItem from "./components/ModifyItem/Index";
import "./App.less";

interface WatermarkData {
  time: string;
  date: string;
  location: string;
  brand: string;
}

interface ModifyItemData {
  file: UploadFile;
  url: string;
}

const defaultWatermark: WatermarkData = {
  time: "16:43",
  date: "2024.6.3 星期一",
  location: "贵阳市南明区万象城",
  brand: "水印相机",
};

function App() {
  const [modifyItem, setModifyItem] = useState<ModifyItemData | undefined>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [scale, setScale] = useState<number>(1);
  const [watermarkCache, setWatermarkCache] = useState<
    Record<string, WatermarkData>
  >({});
  const [currentWatermark, setCurrentWatermark] =
    useState<WatermarkData>(defaultWatermark);
  const [objectUrlCache, setObjectUrlCache] = useState<Record<string, string>>(
    {},
  );
  const target = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 使用 requestIdleCallback 分批创建 objectURL，避免大量文件同时上传时阻塞主线程
  const processFilesInBatches = (files: UploadFile[]) => {
    const BATCH_SIZE = 5; // 每批处理 5 个文件
    let index = 0;

    const processBatch = (deadline: IdleDeadline) => {
      let processed = 0;
      while (
        index < files.length &&
        processed < BATCH_SIZE &&
        deadline.timeRemaining() > 0
      ) {
        const file = files[index];
        const uid = file.uid;
        // 如果缓存中没有，则创建 objectURL
        if (!objectUrlCache[uid] && file.originFileObj) {
          const url = URL.createObjectURL(file.originFileObj as File);
          setObjectUrlCache((prev) => ({ ...prev, [uid]: url }));
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
      // 降级：直接处理所有文件
      files.forEach((file) => {
        const uid = file.uid;
        if (!objectUrlCache[uid] && file.originFileObj) {
          const url = URL.createObjectURL(file.originFileObj as File);
          setObjectUrlCache((prev) => ({ ...prev, [uid]: url }));
        }
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map((file) => ({
      uid: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      originFileObj: file,
      name: file.name,
      size: file.size,
      status: "done" as const,
    }));

    setFileList(newFiles);

    // 分批处理 objectURL
    if (newFiles.length > 0) {
      processFilesInBatches(newFiles);
    }

    // 自动选中第一项
    if (!modifyItem && newFiles.length > 0) {
      const firstFile = newFiles[0];
      const uid = firstFile.uid;
      if (firstFile.originFileObj) {
        const url = URL.createObjectURL(firstFile.originFileObj);
        setModifyItem({
          file: firstFile,
          url,
        });
        setObjectUrlCache((prev) => ({ ...prev, [uid]: url }));
        if (!watermarkCache[uid]) {
          setWatermarkCache((prev) => ({
            ...prev,
            [uid]: { ...currentWatermark },
          }));
        }
      }
    }

    // 重置 input value 以允许再次选择相同文件
    e.target.value = "";
  };

  const handleWatermarkChange = (newWatermark: WatermarkData) => {
    if (!modifyItem) return;
    const uid = modifyItem.file.uid;
    setWatermarkCache((prev) => ({ ...prev, [uid]: newWatermark }));
    setCurrentWatermark(newWatermark); // 更新当前值，后续新建图片使用此值
  };

  const handleSelectFile = (file: UploadFile) => {
    const uid = file.uid;
    // 优先从缓存读取，否则立即创建一个
    let url = objectUrlCache[uid];
    if (!url && file.originFileObj) {
      url = URL.createObjectURL(file.originFileObj as File);
      setObjectUrlCache((prev) => ({ ...prev, [uid]: url! }));
    }
    setModifyItem({
      file,
      url: url || "",
    });
    setScale(1);
    // 如果缓存中有用缓存，没有则用当前值
    if (!watermarkCache[uid]) {
      setWatermarkCache((prev) => ({
        ...prev,
        [uid]: { ...currentWatermark },
      }));
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">
            <CameraOutlined />
          </div>
          <span className="header-title">水印magic</span>
        </div>
      </header>

      {/* Main */}
      <div className="main-row">
        {/* Upload Column */}
        <div className="upload-column">
          <div className="section-header">
            <div className="section-icon">
              <PictureOutlined />
            </div>
            <div className="section-text">
              <h2>图片上传</h2>
              <p>上传并管理您的图片文件</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <div
            className="upload-zone"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-zone-icon">
              <UploadOutlined />
            </div>
            <span className="upload-zone-text">点击或拖动文件到此区域</span>
            <span className="upload-zone-hint">支持多个文件上传</span>
          </div>

          <div className="file-list">
            <Image.PreviewGroup
              preview={{
                onChange: (current, prev) =>
                  console.log(`current index: ${current}, prev index: ${prev}`),
              }}
            >
              {fileList.map((file) => {
                const isActive = modifyItem?.file.uid === file.uid;
                return (
                  <div
                    key={file.uid}
                    className={`file-item ${isActive ? "active" : ""}`}
                    onClick={() => handleSelectFile(file)}
                  >
                    <AsyncImage
                      file={file}
                      objectUrl={objectUrlCache[file.uid]}
                    />
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">
                        {((file.size || 0) / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <button
                      className="file-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        const uid = file.uid;
                        const newList = fileList.filter((f) => f.uid !== uid);
                        setFileList(newList);
                        // 释放被删除文件的 objectURL 并清理缓存
                        if (objectUrlCache[uid]) {
                          URL.revokeObjectURL(objectUrlCache[uid]);
                          setObjectUrlCache((prev) => {
                            const next = { ...prev };
                            delete next[uid];
                            return next;
                          });
                        }
                        if (modifyItem?.file.uid === uid) {
                          if (modifyItem.url) {
                            URL.revokeObjectURL(modifyItem.url);
                          }
                          setModifyItem(undefined);
                        }
                      }}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                );
              })}
            </Image.PreviewGroup>
          </div>
        </div>

        {/* Preview Column */}
        <div className="preview-column">
          <div className="section-header">
            <div className="section-icon">
              <ZoomInOutlined />
            </div>
            <div className="section-text">
              <h2>预览编辑</h2>
              <p>调整水印大小，点击修改文字</p>
            </div>
          </div>

          {modifyItem && (
            <div className="preview-toolbar">
              <div className="slider-container">
                <span className="slider-label">缩放</span>
                <input
                  type="range"
                  className="slider"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                />
                <span className="slider-value">{scale.toFixed(1)}x</span>
              </div>
              <button
                className="download-btn"
                onClick={() => {
                  snapdom.download(target.current as HTMLElement, {
                    filename: `${modifyItem.file.name}_带水印.jpg`,
                  });
                }}
              >
                <DownloadOutlined />
                下载
              </button>
            </div>
          )}

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 0,
            }}
          >
            {modifyItem ? (
              <ModifyItem
                url={modifyItem.url}
                scale={scale}
                watermark={
                  watermarkCache[modifyItem.file.uid] || defaultWatermark
                }
                onWatermarkChange={handleWatermarkChange}
                ref={target}
              />
            ) : (
              <div className="preview-empty">
                <Empty
                  // image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                  styles={{ image: { height: 60 } }}
                  description={false}
                ></Empty>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
