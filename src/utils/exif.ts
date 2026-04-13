import exifr from "exifr";
import type { WatermarkData } from "../types/watermark";

const AMAP_KEY = "c5dbc6be97b745d66860f88834cd58c4";

const weekDays = [
  "星期日",
  "星期一",
  "星期二",
  "星期三",
  "星期四",
  "星期五",
  "星期六",
];

export async function extractExifData(
  file: File,
): Promise<Partial<WatermarkData>> {
  try {
    const exif = await exifr.parse(file, {
      pick: [
        "DateTimeOriginal",
        "DateTimeDigitized",
        "DateTime",
        "GPSLatitude",
        "GPSLongitude",
      ],
    });

    if (!exif) {
      return {};
    }

    const result: Partial<WatermarkData> = {};

    const dateTime =
      exif.DateTimeOriginal || exif.DateTimeDigitized || exif.DateTime;
    if (dateTime) {
      const d = new Date(dateTime);
      if (!isNaN(d.getTime())) {
        result.time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        result.date = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${weekDays[d.getDay()]}`;
      }
    }

    if (exif.longitude && exif.latitude && AMAP_KEY) {
      const address = await getAddressFromGPS(exif.longitude, exif.latitude);
      if (address) {
        result.location = address;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export async function getAddressFromGPS(
  longitude: number,
  latitude: number,
): Promise<string | null> {
  if (!AMAP_KEY) return null;

  try {
    const url = `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_KEY}&location=${longitude},${latitude}&extensions=base`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "1" && data.regeocode) {
      const { province, city, district, township } =
        data.regeocode.addressComponent;
      return `${province}${city}${district}${township}`;
    }
    return null;
  } catch (e) {
    console.warn("逆地理编码失败:", e);
    return null;
  }
}
