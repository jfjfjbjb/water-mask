import { forwardRef, useRef } from "react";
import { DownloadOutlined, ZoomInOutlined } from "@ant-design/icons";
import { Empty } from "antd";
import type { UploadFile } from "antd";
import { snapdom } from "@zumer/snapdom";
import ModifyItem from "../ModifyItem/Index";
import type { WatermarkData } from "../../types/watermark";
import "./Index.less";

interface PreviewColumnProps {
  modifyItem?: {
    file: UploadFile;
    url: string;
  };
  scale: number;
  watermark: WatermarkData;
  onScaleChange: (scale: number) => void;
  onWatermarkChange: (watermark: WatermarkData) => void;
}

const PreviewColumn = forwardRef<HTMLDivElement, PreviewColumnProps>(
  ({ modifyItem, scale, watermark, onScaleChange, onWatermarkChange }) => {
    const target = useRef<HTMLDivElement>(null);

    return (
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
                onChange={(e) => onScaleChange(parseFloat(e.target.value))}
              />
              <span className="slider-value">{scale.toFixed(1)}x</span>
            </div>
            <button
              className="download-btn"
              onClick={() => {
                const ext =
                  modifyItem.file.name.match(/\.[^.]+$/)?.[0] || ".jpg";
                snapdom.download(target.current as unknown as HTMLElement, {
                  filename: `${modifyItem.file.name.replace(/\.[^.]+$/, "")}_带水印${ext}`,
                  scale: 2,
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
              watermark={watermark}
              onWatermarkChange={onWatermarkChange}
              ref={target}
            />
          ) : (
            <div className="preview-empty">
              <Empty
                styles={{ image: { height: 60 } }}
                description={false}
              ></Empty>
            </div>
          )}
        </div>
      </div>
    );
  },
);

PreviewColumn.displayName = "PreviewColumn";

export default PreviewColumn;
