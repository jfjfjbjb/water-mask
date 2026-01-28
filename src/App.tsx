import { useRef, useState, type ReactElement } from "react";
import {
  DeleteOutlined,
  InboxOutlined,
  DownloadOutlined,
  PictureOutlined,
  ZoomInOutlined,
} from "@ant-design/icons";
import { Col, Row, Upload, Image, Button, Empty, Slider } from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { snapdom } from "@zumer/snapdom";
import AsyncImage from "./components/AsyncImage/Index";
import ModifyItem from "./components/ModifyItem/Index";
import "./App.less";

const { Dragger } = Upload;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

interface ModifyItem {
  file: UploadFile;
  url: string;
}

function App() {
  const [modifyItem, setModifyItem] = useState<ModifyItem | undefined>(
    undefined,
  );
  const [scale, setScale] = useState<number>(1);
  const target = useRef<HTMLDivElement>(null);

  const handleChange: UploadProps["onChange"] = () => {};

  return (
    <div className="app-container">
      {/*
       * 左侧文件上传区域
       * 包含：
       * 1. 区域标题和描述
       * 2. 拖拽上传组件
       * 3. 已上传文件的列表显示
       */}
      <Row style={{ height: "100%" }} gutter={0}>
        <Col span={8} className="upload-column">
          {/* 头部标题区域，包含图标和文字说明 */}
          <div className="section-header">
            <div className="section-icon">
              <PictureOutlined />
            </div>
            <div>
              <h2 className="section-title">文件上传</h2>
              <p className="section-description">上传并管理您的图片文件</p>
            </div>
          </div>

          <div className="upload-scroll-wrapper">
            {/*
             * 图片预览组
             * 功能：支持多图片的预览和切换
             * onChange: 预览索引变化时的回调，用于跟踪当前查看的图片
             */}
            <Image.PreviewGroup
              preview={{
                onChange: (current, prev) =>
                  console.log(`current index: ${current}, prev index: ${prev}`),
              }}
            >
              {/*
               * 拖拽上传区域 (Dragger)
               * 属性说明：
               * - name="file": 上传文件的字段名
               * - multiple: 是否支持多文件上传
               * - accept="image/*": 限制只能上传图片类型
               * - beforeUpload={() => false}: 阻止自动上传，改为手动控制
               * - itemRender: 自定义列表项的渲染方式
               */}
              <Dragger
                name="file"
                multiple={true}
                accept="image/*"
                onChange={handleChange}
                beforeUpload={() => false}
                itemRender={(
                  originNode: ReactElement,
                  file: UploadFile,
                  fileList: object[],
                  actions: {
                    download: (
                      file?: File | Blob | string,
                      fileName?: string,
                    ) => void;
                    preview: (file?: File | Blob | string) => void;
                    remove: (file?: File | Blob | string) => void;
                  },
                ) => {
                  return (
                    <div
                      className={`custom-item ${file.uid === modifyItem?.file.uid && "active"}`}
                    >
                      {/* 异步加载图片预览组件 */}
                      <AsyncImage file={file} />
                      {/*
                       * 文件名按钮
                       * 点击时设置当前编辑的图片对象
                       * 同时创建图片的本地预览URL并重置缩放比例
                       */}
                      <Button
                        className="image-name"
                        style={{ flexGrow: 1, justifyContent: "flex-start" }}
                        color="default"
                        variant="link"
                        onClick={() => {
                          setModifyItem({
                            file,
                            url: URL.createObjectURL(
                              file.originFileObj as FileType,
                            ),
                          });
                          setScale(1);
                        }}
                      >
                        {file.name}
                      </Button>
                      {/*
                       * 删除按钮
                       * 调用actions.remove()从文件列表中移除当前文件
                       */}
                      <Button
                        type="text"
                        icon={<DeleteOutlined style={{ color: "#a8a8a8" }} />}
                        onClick={() => {
                          actions.remove();
                        }}
                      />
                    </div>
                  );
                }}
              >
                {/* 拖拽区域的提示图标和文字 */}
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  点击或拖动文件到此区域进行上传
                </p>
                <p className="ant-upload-hint">支持多个文件上传</p>
              </Dragger>
            </Image.PreviewGroup>
          </div>
        </Col>

        {/*
         * 右侧预览编辑区域
         * 包含：
         * 1. 预览编辑的标题和工具栏
         * 2. 图片预览和水印编辑区域
         * 3. 下载按钮和缩放滑块
         */}
        <Col span={16} className="preview-column">
          <div className="section-header preview-section-header">
            <div className="section-header-left">
              <div className="section-icon">
                <ZoomInOutlined />
              </div>
              <div>
                <h2 className="section-title">预览编辑</h2>
                <p className="section-description">
                  调整水印大小，点击修改文字
                </p>
              </div>
            </div>
            {/* 当有选中的图片时才显示工具栏 */}
            {modifyItem && (
              <div className="section-header-right">
                <div className="toolbar-inline">
                  {/*
                   * 缩放滑块
                   * 功能：调整水印的缩放比例
                   * 范围：0.2 到 2.5，步长 0.1
                   */}
                  <Slider
                    value={scale}
                    min={0.2}
                    max={2.5}
                    step={0.1}
                    onChange={(val) => {
                      setScale(val);
                    }}
                  />
                  {/*
                   * 下载按钮
                   * 功能：将带水印的图片下载为JPG格式
                   * 使用snapdom库进行DOM截图和下载
                   */}
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      snapdom.download(target.current as HTMLElement, {
                        // format 属性已被移除，snapdom.download 不再支持该选项
                        filename: `${modifyItem.file.name}_带水印.jpg`,
                      });
                    }}
                  >
                    下载
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="preview-content">
            {/*
             * 图片预览编辑区域
             * 条件渲染：
             * - 有选中图片时：显示图片和水印编辑区
             * - 无选中图片时：显示空状态提示
             */}
            {modifyItem ? (
              <ModifyItem
                url={modifyItem.url}
                scale={scale}
                ref={target}
              />
            ) : (
              <Empty
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                description="请选择左侧文件开始编辑"
              />
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default App;
