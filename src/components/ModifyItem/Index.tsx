import { forwardRef } from "react";
import posUrl from "../../assets/pos.svg";

interface ModifyItemProps {
  url: string;
  scale: number;
}

const ModifyItem = forwardRef<HTMLDivElement, ModifyItemProps>(({ url, scale }, ref) => {
  return (
    <div className="modify-wrapper">
      <div className="modify-img-wrapper" ref={ref}>
        <img
          style={{
            maxWidth: "100%",
            maxHeight: "calc(100vh - 200px)",
          }}
          src={url}
        ></img>
        <div className="water-mask" contentEditable>
          <div
            style={{
              textAlign: "center",
              position: "absolute",
              bottom: "5em",
            }}
          >
            <div
              style={{
                fontSize: Math.ceil(80 * scale),
                fontWeight: 300,
              }}
            >
              16:43
            </div>
            <div
              style={{
                fontSize: Math.ceil(20 * scale),
                color: "#eaeaea",
              }}
            >
              <span>2024.6.3 星期一</span>
              <span style={{ marginLeft: 16 }}>
                <img
                  width={Math.ceil(24 * scale)}
                  src={posUrl}
                  style={{ position: "relative", top: 6 }}
                />
                贵阳市南明区万象城
              </span>
            </div>
          </div>
          <div
            style={{
              fontSize: Math.ceil(16 * scale),
              opacity: 0.65,
              position: "absolute",
              bottom: 12,
              right: 12,
            }}
          >
            水印相机
          </div>
        </div>
      </div>
    </div>
  );
});

export default ModifyItem;
