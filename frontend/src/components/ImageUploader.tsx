import { useState } from 'react';
import { Upload, message, Image, Button } from 'antd';
import { DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface ImageUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  folder?: string;
  previewWidth?: number;
  previewHeight?: number;
}

export default function ImageUploader({
  value = '',
  onChange,
  folder = 'uploads',
  previewWidth = 200,
  previewHeight = 200,
}: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      
      if (result.success && result.data?.url) {
        onChange?.(result.data.url);
        message.success('上传成功');
      } else {
        message.error(result.message || '上传失败');
      }
    } catch (err) {
      message.error('上传失败：网络错误');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    onChange?.('');
    message.success('已删除');
  };

  const uploadProps: UploadProps = {
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: handleUpload,
    disabled: loading,
  };

  return (
    <div>
      {value ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Image
            src={value}
            alt="Preview"
            style={{
              width: previewWidth,
              height: previewHeight,
              objectFit: 'cover',
              borderRadius: 8,
              border: '1px solid #d9d9d9',
            }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          />
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              opacity: 0.9,
            }}
          />
        </div>
      ) : (
        <Upload.Dragger {...uploadProps} style={{ width: previewWidth, padding: '20px 0' }}>
          <PictureOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
          <p className="ant-upload-text">点击或拖拽图片到此上传</p>
          <p className="ant-upload-hint">支持 JPG, PNG, GIF, WebP 格式，最大 10MB</p>
        </Upload.Dragger>
      )}
    </div>
  );
}
