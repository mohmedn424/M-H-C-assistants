import React, { useState, useRef, useEffect } from 'react';
import { Button, message, Modal, Slider } from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  CameraOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import pb from '../../lib/pocketbase';
import { useNavigate } from '@tanstack/react-router';
import imageCompression from 'browser-image-compression';

const MAX_FILES = 10;
const MIN_ZOOM = 100;
const MAX_ZOOM = 300;
const ImagePreview = ({ file, onRemove, onPreview }) => (
  <div className="preview-item">
    {file.file.type.startsWith('image/') ? (
      <img
        src={file.preview}
        alt={`Preview`}
        onClick={() => onPreview(file)}
        style={{ cursor: 'pointer' }}
      />
    ) : (
      <div className="pdf-preview" onClick={() => onPreview(file)}>
        <FilePdfOutlined className="pdf-icon" />
        <p>{file.file.name}</p>
      </div>
    )}
    <Button
      danger
      icon={<DeleteOutlined />}
      onClick={onRemove}
      className="remove-button"
    />
    <Button
      icon={<ZoomInOutlined />}
      onClick={() => onPreview(file)}
      className="preview-button"
    />
  </div>
);
const ZoomControls = ({ zoomLevel, onZoom }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      marginTop: 15,
      zIndex: 1000,
    }}
  >
    <Button
      icon={<ZoomOutOutlined />}
      onClick={() => onZoom(Math.max(MIN_ZOOM, zoomLevel - 10))}
    />
    <Slider
      min={MIN_ZOOM}
      max={MAX_ZOOM}
      value={zoomLevel}
      onChange={onZoom}
      style={{ width: 200, margin: '0 10px' }}
    />
    <Button
      icon={<ZoomInOutlined />}
      onClick={() => onZoom(Math.min(MAX_ZOOM, zoomLevel + 10))}
    />
  </div>
);

function UploadItem({ itemData }) {
  const [previewFiles, setPreviewFiles] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const fileInputRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(MIN_ZOOM);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const [lastTap, setLastTap] = useState(0);

  const [initialPinchDistance, setInitialPinchDistance] =
    useState(null);
  const [initialZoom, setInitialZoom] = useState(MIN_ZOOM);

  const calculateBoundaries = (
    zoomLevel,
    imageWidth,
    imageHeight,
    containerWidth,
    containerHeight
  ) => {
    const scaledWidth = imageWidth * (zoomLevel / 100);
    const scaledHeight = imageHeight * (zoomLevel / 100);

    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

    return { maxX, maxY };
  };
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging.current && zoomLevel > MIN_ZOOM) {
        const containerRect =
          imageRef.current.parentElement.getBoundingClientRect();
        const imageRect = imageRef.current.getBoundingClientRect();
        const { maxX, maxY } = calculateBoundaries(
          zoomLevel,
          imageRect.width,
          imageRect.height,
          containerRect.width,
          containerRect.height
        );
        const newX = e.clientX - dragStart.current.x;
        const newY = e.clientY - dragStart.current.y;
        setPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY)),
        });
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (
        e.touches.length === 1 &&
        isDragging.current &&
        zoomLevel > MIN_ZOOM
      ) {
        const touch = e.touches[0];
        const containerRect =
          imageRef.current.parentElement.getBoundingClientRect();
        const imageRect = imageRef.current.getBoundingClientRect();
        const { maxX, maxY } = calculateBoundaries(
          zoomLevel,
          imageRect.width,
          imageRect.height,
          containerRect.width,
          containerRect.height
        );
        const newX = touch.clientX - dragStart.current.x;
        const newY = touch.clientY - dragStart.current.y;
        setPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY)),
        });
      } else if (
        e.touches.length === 2 &&
        initialPinchDistance !== null
      ) {
        const currentDistance = getDistanceBetweenTouches(e.touches);
        const scale = currentDistance / initialPinchDistance;
        const newZoom = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, initialZoom * scale)
        );
        setZoomLevel(newZoom);
      }
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
      setInitialPinchDistance(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoomLevel, initialPinchDistance, initialZoom]);

  const handleMouseDown = (e) => {
    if (zoomLevel > MIN_ZOOM) {
      isDragging.current = true;

      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap < 300) {
        handleDoubleTap(e);
      } else if (zoomLevel > MIN_ZOOM) {
        isDragging.current = true;
        const touch = e.touches[0];
        dragStart.current = {
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        };
      }
      setLastTap(now);
    } else if (e.touches.length === 2) {
      const distance = getDistanceBetweenTouches(e.touches);
      setInitialPinchDistance(distance);
      setInitialZoom(zoomLevel);
    }
  };

  const handleDoubleTap = (e) => {
    e.preventDefault();
    const newZoom = zoomLevel === MIN_ZOOM ? MAX_ZOOM : MIN_ZOOM;
    setZoomLevel(newZoom);
    if (newZoom === MIN_ZOOM) {
      resetPosition();
    }
  };

  const getDistanceBetweenTouches = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleZoom = (newZoom) => {
    setZoomLevel(newZoom);
    if (newZoom === MIN_ZOOM) {
      resetPosition();
    } else {
      const containerRect =
        imageRef.current.parentElement.getBoundingClientRect();
      const imageRect = imageRef.current.getBoundingClientRect();
      const { maxX, maxY } = calculateBoundaries(
        newZoom,
        imageRect.width,
        imageRect.height,
        containerRect.width,
        containerRect.height
      );
      setPosition({
        x: Math.max(-maxX, Math.min(maxX, position.x)),
        y: Math.max(-maxY, Math.min(maxY, position.y)),
      });
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);

    const acceptedFiles = files.filter(
      (file) =>
        file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'application/pdf'
    );

    if (acceptedFiles.length !== files.length) {
      message.error({
        content: 'يرجى تحميل ملفات بصيغة JPG أو PNG أو PDF فقط.',
        style: {
          direction: 'rtl',
        },
      });
    }

    if (acceptedFiles.length + previewFiles.length > MAX_FILES) {
      message.warning(`يمكنك فقط تحميل ${MAX_FILES} ملفات.`);
      return;
    }

    const newPreviewFiles = acceptedFiles
      .filter((file) => {
        return !previewFiles.some(
          (existingFile) => existingFile.file.name === file.name
        );
      })
      .map((file) => ({
        file,
        preview: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : null,
      }));

    if (newPreviewFiles.length < acceptedFiles.length) {
      message.info(
        'بعض الملفات تم تحميلها مسبقاً. فقط الملفات الجديدة سوف يتم تحميلها.'
      );
    }

    setPreviewFiles((prevFiles) => [
      ...prevFiles,
      ...newPreviewFiles,
    ]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openCamera = () => {
    const cameraInput = document.createElement('input');
    cameraInput.type = 'file';
    cameraInput.accept = 'image/*';
    cameraInput.capture = 'environment';
    cameraInput.onchange = handleFileSelect;
    cameraInput.click();
  };

  const removeFile = (index) => {
    setPreviewFiles((prevFiles) =>
      prevFiles.filter((_, i) => i !== index)
    );
  };
  const navigate = useNavigate();

  const [isUploading, setIsUploading] = useState(false);
  const [currentFileName, setCurrentFileName] = useState('');

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      for (const pf of previewFiles) {
        const formData = new FormData();

        let fileToUpload;
        if (pf.file.type.startsWith('image/')) {
          // Compress the image
          const options = {
            maxSizeMB: 0.15,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          fileToUpload = await imageCompression(pf.file, options);
        } else if (pf.file.type === 'application/pdf') {
          // Use the original PDF file without compression
          fileToUpload = pf.file;
        } else {
          // Handle other file types if necessary
          console.warn(`Unsupported file type: ${pf.file.type}`);
          continue;
        }

        formData.append('attachments', fileToUpload, pf.file.name);
        formData.append('fulfilled', 'true');

        const record = await pb
          .collection('attachments')
          .update(itemData?.id, formData);
        console.log('File uploaded successfully:', record);
      }
      message.success('تم رفع الملفات بنجاح');
      setPreviewFiles([]);
      navigate({
        to: '/',
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      message.error('فشل في رفع الملفات');
    } finally {
      setIsUploading(false);
    }
  };
  const handlePreview = (file) => {
    if (file.file.type === 'application/pdf') {
      window.open(URL.createObjectURL(file.file), '_blank');
    } else {
      setPreviewImage(file.preview);
      setCurrentFileName(file.file.name);
      setPreviewVisible(true);
      setZoomLevel(MIN_ZOOM);
      resetPosition();
    }
  };

  if (!itemData?.id) return null;

  return (
    <div className="upload-item-wrapper">
      <h3 className="upload-item-title">
        التحاليل والاشعات المطلوبة
      </h3>
      <div className="required-scans">
        {itemData.metadata.treatments_data.map((scan) => (
          <div className="required-scan" key={scan.key}>
            <p className="scan-label">{scan.label}</p>
          </div>
        ))}
      </div>
      <div className="upload-container">
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          multiple
          accept=".jpg,.jpeg,.png,.pdf"
        />

        <div className="upload-buttons-container">
          <Button icon={<CameraOutlined />} onClick={openCamera}>
            التقاط صورة
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current.click()}
          >
            اختيار صور
          </Button>

          <Button
            icon={<FilePdfOutlined />}
            onClick={() => {
              const pdfInput = document.createElement('input');
              pdfInput.type = 'file';
              pdfInput.accept = '.pdf,application/pdf';
              pdfInput.onchange = handleFileSelect;
              pdfInput.click();
            }}
          >
            اختيار ملف PDF
          </Button>
        </div>

        <div className="upload-preview">
          {previewFiles.map((file, index) => (
            <ImagePreview
              key={index}
              file={file}
              onRemove={() => removeFile(index)}
              onPreview={() => handlePreview(file)}
            />
          ))}
        </div>
        {previewFiles.length > 0 && (
          <Button
            type="primary"
            onClick={handleUpload}
            className="upload-selected-files-btn"
            loading={isUploading}
            disabled={isUploading}
          >
            {isUploading ? 'جاري الرفع...' : 'رفع الملفات'}
          </Button>
        )}
      </div>
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => {
          setPreviewVisible(false);
          setZoomLevel(MIN_ZOOM);
          resetPosition();
        }}
        title={currentFileName}
        width="100%"
        centered
        style={{ top: 20 }}
        bodyStyle={{
          height: '100%',
          maxHeight: 'calc(100vh - 200px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',

            overflow: 'hidden',
            cursor: zoomLevel > MIN_ZOOM ? 'move' : 'default',
            touchAction: 'none',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <img
            ref={imageRef}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transform: `scale(${zoomLevel / 100}) translate(${position.x / (zoomLevel / 100)}px, ${position.y / (zoomLevel / 100)}px)`,
              transition: isDragging.current
                ? 'none'
                : 'transform 0.3s',
            }}
            src={previewImage}
            draggable={false}
          />
        </div>
        <ZoomControls zoomLevel={zoomLevel} onZoom={handleZoom} />
      </Modal>
    </div>
  );
}
export default UploadItem;
