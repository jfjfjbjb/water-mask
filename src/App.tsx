import { useRef, useState } from "react";
import {
  DeleteOutlined,
  InboxOutlined,
  DownloadOutlined,
  PictureOutlined,
  ZoomInOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { Upload, Empty, Image } from "antd";
import type { UploadFile, UploadProps } from "antd";
import { snapdom } from "@zumer/snapdom";
import AsyncImage from "./components/AsyncImage/Index";
import ModifyItem from "./components/ModifyItem/Index";
import "./App.less";

const { Dragger } = Upload;

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
  const [watermarkCache, setWatermarkCache] = useState<Record<string, WatermarkData>>({});
  const [currentWatermark, setCurrentWatermark] = useState<WatermarkData>(defaultWatermark);
  const target = useRef<HTMLDivElement>(null);

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    // 第一次上传文件时，自动选中第一项
    if (newFileList.length > 0 && !modifyItem) {
      const firstFile = newFileList[0];
      const uid = firstFile.uid;
      setModifyItem({
        file: firstFile,
        url: URL.createObjectURL(firstFile.originFileObj as File),
      });
      // 初始化缓存
      if (!watermarkCache[uid]) {
        setWatermarkCache((prev) => ({ ...prev, [uid]: { ...currentWatermark } }));
      }
    }
  };

  const handleWatermarkChange = (newWatermark: WatermarkData) => {
    if (!modifyItem) return;
    const uid = modifyItem.file.uid;
    setWatermarkCache((prev) => ({ ...prev, [uid]: newWatermark }));
    setCurrentWatermark(newWatermark); // 更新当前值，后续新建图片使用此值
  };

  const handleSelectFile = (file: UploadFile) => {
    const uid = file.uid;
    setModifyItem({
      file,
      url: URL.createObjectURL(file.originFileObj as File),
    });
    setScale(1);
    // 如果缓存中有用缓存，没有则用当前值
    if (!watermarkCache[uid]) {
      setWatermarkCache((prev) => ({ ...prev, [uid]: { ...currentWatermark } }));
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

          <Dragger
            name="file"
            multiple
            accept="image/*"
            fileList={fileList}
            onChange={handleChange}
            beforeUpload={() => false}
            showUploadList={false}
          >
            <div className="upload-zone">
              <div className="upload-zone-icon">
                <InboxOutlined />
              </div>
              <span className="upload-zone-text">点击或拖动文件到此区域</span>
              <span className="upload-zone-hint">支持多个文件上传</span>
            </div>
          </Dragger>

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
                    <AsyncImage file={file} />
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">{((file.size || 0) / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                    <button
                      className="file-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newList = fileList.filter(
                          (f) => f.uid !== file.uid,
                        );
                        setFileList(newList);
                        if (modifyItem?.file.uid === file.uid) {
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
                watermark={watermarkCache[modifyItem.file.uid] || defaultWatermark}
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
