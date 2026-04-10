import { forwardRef } from "react";
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
    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      const overlay = e.currentTarget;
      const timeEl = overlay.querySelector(".watermark-time");
      const infoEl = overlay.querySelector(".watermark-info");
      const brandEl = overlay.querySelector(".watermark-brand");

      const newWatermark: WatermarkData = {
        time: timeEl?.textContent || "",
        date: infoEl?.firstChild?.textContent || "",
        location: infoEl?.querySelector(".watermark-location")?.textContent?.replace(/贵阳市南明区万象城/, "").trim() || "",
        brand: brandEl?.textContent || "",
      };

      onWatermarkChange(newWatermark);
    };

    return (
      <div className="preview-area">
        <div className="image-container" ref={ref}>
          <img className="preview-image" src={url} alt="" />
          <div className="watermark-overlay" contentEditable onBlur={handleBlur}>
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
                <span>{watermark.date}</span>
                <span className="watermark-location">
                  <img
                    width={Math.ceil(14 * scale)}
                    src={posUrl}
                    alt=""
                  />
                  {watermark.location}
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
