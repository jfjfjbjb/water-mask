import type { UploadFile } from "antd";

export interface WatermarkData {
  time: string;
  date: string;
  location: string;
  brand: string;
}

export interface ModifyItemData {
  file: UploadFile;
  url: string;
}

export const defaultWatermark: WatermarkData = {
  time: "16:43",
  date: "2024.6.3 星期一",
  location: "贵阳市南明区万象城",
  brand: "水印相机",
};