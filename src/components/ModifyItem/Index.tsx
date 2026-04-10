import { forwardRef } from "react";
import posUrl from "../../assets/pos.svg";

interface ModifyItemProps {
  url: string;
  scale: number;
}

const ModifyItem = forwardRef<HTMLDivElement, ModifyItemProps>(
  ({ url, scale }, ref) => {
    return (
      <div className="preview-area">
        <div className="image-container" ref={ref}>
          <img className="preview-image" src={url} alt="" />
          <div className="watermark-overlay" contentEditable>
            <div className="watermark-content">
              <div
                className="watermark-time"
                style={{ fontSize: Math.ceil(52 * scale) }}
              >
                16:43
              </div>
              <div
                className="watermark-info"
                style={{ fontSize: Math.ceil(14 * scale) }}
              >
                <span>2024.6.3 星期一</span>
                <span className="watermark-location">
                  <img
                    width={Math.ceil(14 * scale)}
                    src={posUrl}
                    alt=""
                  />
                  贵阳市南明区万象城
                </span>
              </div>
            </div>
            <div
              className="watermark-brand"
              style={{ fontSize: Math.ceil(11 * scale) }}
            >
              水印相机
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default ModifyItem;
