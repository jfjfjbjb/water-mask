import { useState } from "react";
// import { CameraOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { isEmpty } from "lodash";
import UploadColumn from "./components/UploadColumn/Index";
import PreviewColumn from "./components/PreviewColumn/Index";
import {
  createObjectURL,
  processFilesInBatches,
  revokeObjectURL,
} from "./utils/file";
import { extractExifData } from "./utils/exif";
// import { Tips } from "./tips";
import {
  type WatermarkData,
  type ModifyItemData,
  defaultWatermark,
} from "./types/watermark";
import "./App.less";
import logo from "/camera.svg";

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

  const handleFileAdd = (newFiles: UploadFile[]) => {
    setFileList((prev) => [...prev, ...newFiles]);

    if (newFiles.length > 0) {
      processFilesInBatches(
        newFiles,
        () => objectUrlCache,
        setObjectUrlCache,
      );
    }

    const firstFile = newFiles[0];
    const uid = firstFile.uid;
    if (firstFile.originFileObj) {
      const url = createObjectURL(firstFile.originFileObj);
      setModifyItem({ file: firstFile, url });
      setObjectUrlCache((prev) => ({ ...prev, [uid]: url }));

      if (!watermarkCache[uid]) {
        extractExifData(firstFile.originFileObj).then((exifData) => {
          const watermarkFromExif: WatermarkData = {
            time: exifData.time ?? currentWatermark.time,
            date: exifData.date ?? currentWatermark.date,
            location: exifData.location ?? currentWatermark.location,
            brand: currentWatermark.brand,
          };
          if (!isEmpty(exifData)) {
            setWatermarkCache((prev) => ({
              ...prev,
              [uid]: watermarkFromExif,
            }));
          }
          setCurrentWatermark(watermarkFromExif);
        });
      }
    }
  };

  const handleFileDelete = (uid: string) => {
    const newList = fileList.filter((f) => f.uid !== uid);
    setFileList(newList);

    if (objectUrlCache[uid]) {
      revokeObjectURL(objectUrlCache[uid]);
      setObjectUrlCache((prev) => {
        const next = { ...prev };
        delete next[uid];
        return next;
      });
    }

    if (modifyItem?.file.uid === uid) {
      if (modifyItem.url) {
        revokeObjectURL(modifyItem.url);
      }
      setModifyItem(undefined);
    }
  };

  const handleFileSelect = (file: UploadFile) => {
    const uid = file.uid;
    let url = objectUrlCache[uid];
    if (!url && file.originFileObj) {
      url = createObjectURL(file.originFileObj as File);
      setObjectUrlCache((prev) => ({ ...prev, [uid]: url! }));
    }
    setModifyItem({ file, url: url || "" });
    setScale(1);

    if (!watermarkCache[uid]) {
      if (file.originFileObj) {
        extractExifData(file.originFileObj).then((exifData) => {
          const watermarkFromExif: WatermarkData = {
            time: exifData.time ?? currentWatermark.time,
            date: exifData.date ?? currentWatermark.date,
            location: exifData.location ?? currentWatermark.location,
            brand: currentWatermark.brand,
          };
          if (!isEmpty(exifData)) {
            setWatermarkCache((prev) => ({
              ...prev,
              [uid]: watermarkFromExif,
            }));
          }
        });
      } else {
        setWatermarkCache((prev) => ({
          ...prev,
          [uid]: { ...currentWatermark },
        }));
      }
    }
  };

  const handleWatermarkChange = (newWatermark: WatermarkData) => {
    if (!modifyItem) return;
    const uid = modifyItem.file.uid;
    setWatermarkCache((prev) => ({ ...prev, [uid]: newWatermark }));
    setCurrentWatermark(newWatermark);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">
            {/* <CameraOutlined /> */}
            <img src={logo} alt="logo" />
          </div>
          <span className="header-title">水印magic</span>
        </div>
      </header>

      <div className="main-row">
        <UploadColumn
          fileList={fileList}
          objectUrlCache={objectUrlCache}
          modifyItemFileUid={modifyItem?.file.uid}
          onFileSelect={handleFileSelect}
          onFileDelete={handleFileDelete}
          onFileAdd={handleFileAdd}
        />

        <PreviewColumn
          modifyItem={modifyItem}
          scale={scale}
          watermark={modifyItem ? (watermarkCache[modifyItem.file.uid] || currentWatermark) : currentWatermark}
          onScaleChange={setScale}
          onWatermarkChange={handleWatermarkChange}
        />
      </div>
    </div>
  );
};

export default App;