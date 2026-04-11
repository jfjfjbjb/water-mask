import { useRef } from "react";
import {
  DeleteOutlined,
  PictureOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Image } from "antd";
import type { UploadFile } from "antd";
import AsyncImage from "../AsyncImage/Index";
import "./Index.less";

interface UploadColumnProps {
  fileList: UploadFile[];
  objectUrlCache: Record<string, string>;
  modifyItemFileUid?: string;
  onFileSelect: (file: UploadFile) => void;
  onFileDelete: (uid: string) => void;
  onFileAdd: (files: UploadFile[]) => void;
}

function UploadColumn({
  fileList,
  objectUrlCache,
  modifyItemFileUid,
  onFileSelect,
  onFileDelete,
  onFileAdd,
}: UploadColumnProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
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
        onChange={(e) => {
          const files = e.target.files;
          if (!files || files.length === 0) return;

          const newFiles = Array.from(files).map((file) => ({
            uid: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            originFileObj: file,
            name: file.name,
            size: file.size,
            status: "done" as const,
          }));

          onFileAdd(newFiles as unknown as UploadFile[]);
          e.target.value = "";
        }}
      />
      <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
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
            const isActive = modifyItemFileUid === file.uid;
            return (
              <div
                key={file.uid}
                className={`file-item ${isActive ? "active" : ""}`}
                onClick={() => onFileSelect(file)}
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
                    onFileDelete(file.uid);
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
  );
}

export default UploadColumn;