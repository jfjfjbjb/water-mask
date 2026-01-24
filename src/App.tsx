import { useRef, useState } from "react";
import { DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import { Col, Row, Upload, Image, Button, Empty } from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { snapdom } from "@zumer/snapdom";
import posUrl from "./assets/pos.svg";
import "./App.css";

const { Dragger } = Upload;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

function App() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [modifyItem, setModifyItem] = useState();
  const target = useRef(null);

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(
      [...newFileList].map((file) => {
        return {
          ...file,
          url: URL.createObjectURL(file.originFileObj as FileType),
        };
      }),
    );
    console.log(newFileList);
  };

  return (
    <>
      <Row style={{ height: "100%", padding: "10px" }} gutter={16}>
        <Col span={8} style={{ overflow: "auto" }}>
          <Image.PreviewGroup
            preview={{
              onChange: (current, prev) =>
                console.log(`current index: ${current}, prev index: ${prev}`),
            }}
          >
            <Dragger
              name="file"
              multiple={true}
              // listType="picture"
              fileList={fileList}
              onChange={handleChange}
              beforeUpload={() => false}
              itemRender={(
                originNode: ReactElement,
                file: UploadFile,
                fileList: object[],
                actions: {
                  download: function;
                  preview: function;
                  remove: function;
                },
              ) => {
                return (
                  <div className="custom-item">
                    <Image
                      width={48}
                      height={48}
                      styles={{ image: { borderRadius: "4px" } }}
                      src={file.url}
                      // 关键：控制图片自身适应方式
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain", // 或 'cover'，见下方解释
                        display: "block", // 避免flex容器内的间隙问题
                      }}
                    ></Image>
                    <Button
                      className="image-name"
                      style={{ flexGrow: 1, justifyContent: "flex-start" }}
                      color="default"
                      variant="link"
                      onClick={() => setModifyItem({ file })}
                    >
                      {file.name}
                    </Button>
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
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖动文件到此区域进行上传</p>
              <p className="ant-upload-hint">支持多个文件上传</p>
            </Dragger>
          </Image.PreviewGroup>
        </Col>
        <Col span={16}>
          <>
            {modifyItem ? (
              <div className="modify-wrapper">
                <div className="modify-img-wrapper" ref={target}>
                  <img
                    style={{
                      maxWidth: "100%",
                      maxHeight: "calc(100vh - 64px)",
                    }}
                    src={modifyItem.file.url}
                  ></img>
                  <div className="water-mask" contentEditable>
                    <div
                      style={{
                        textAlign: "center",
                        position: "absolute",
                        bottom: "5em",
                      }}
                    >
                      <div style={{ fontSize: 80, fontWeight: 300 }}>16:43</div>
                      <div style={{ fontSize: 20, color: "#eaeaea" }}>
                        <span>2024.6.3 星期一</span>
                        <span style={{ marginLeft: 16 }}>
                          <img
                            width={24}
                            src={posUrl}
                            style={{ position: "relative", top: 6 }}
                          />
                          贵阳市南明区万象城
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 16,
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
                <div className="toolbar">
                  <Button
                    type="primary"
                    onClick={() => {
                      snapdom.download(target.current, {
                        format: "jpg",
                        filename: "my-capture.jpg",
                      });
                    }}
                  >
                    下载
                  </Button>
                </div>
              </div>
            ) : (
              <Empty
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                description="未选中"
              />
            )}
          </>
        </Col>
      </Row>
    </>
  );
}

export default App;
