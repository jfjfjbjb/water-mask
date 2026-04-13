import { forwardRef, useState } from "react";
import posUrl from "../../assets/pos.svg";

interface WatermarkData {
  time: string;
  date: string;
  location: string;
  brand: string;
}

interface ModifyItemProps {
  url: string;
  scale: number;
  watermark: WatermarkData;
  onWatermarkChange: (watermark: WatermarkData) => void;
}

const ModifyItem = forwardRef<HTMLDivElement, ModifyItemProps>(
  ({ url, scale, watermark, onWatermarkChange }, ref) => {
    const [isComposing, setIsComposing] = useState(false);

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      // 防止 IME 输入未完成时触发 blur
      if (isComposing) return;

      const overlay = e.currentTarget;
      const timeEl = overlay.querySelector(".watermark-time");
      const dateEl = overlay?.querySelector(".watermark-date");
      const locationEl = overlay?.querySelector(".watermark-location span");
      const brandEl = overlay.querySelector(".watermark-brand");

      const newWatermark: WatermarkData = {
        time: timeEl?.textContent || "",
        date: dateEl?.textContent || "",
        location: locationEl?.textContent || "",
        brand: brandEl?.textContent || "",
      };

      onWatermarkChange(newWatermark);
    };

    const handleCompositionStart = () => setIsComposing(true);
    const handleCompositionEnd = () => {
      setIsComposing(false);
    };

    return (
      <div className="preview-area">
        <div className="image-container" ref={ref}>
          <img className="preview-image" src={url} alt="" />
          <div
            className="watermark-overlay"
            contentEditable
            onBlur={handleBlur}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
          >
            <div className="watermark-content">
              <div
                className="watermark-time"
                style={{ fontSize: Math.ceil(52 * scale) }}
              >
                {watermark.time}
              </div>
              <div
                className="watermark-info"
                style={{ fontSize: Math.ceil(14 * scale) }}
              >
                <span className="watermark-date">{watermark.date}</span>
                <span className="watermark-location">
                  <img width={Math.ceil(14 * scale)} src={posUrl} alt="" />
                  <span>{watermark.location}</span>
                </span>
              </div>
            </div>
            <div
              className="watermark-brand"
              style={{ fontSize: Math.ceil(11 * scale) }}
            >
              {watermark.brand}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default ModifyItem;
