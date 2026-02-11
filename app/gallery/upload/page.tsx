'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

interface PhotoMetadata {
  date?: string;
  location?: string;
  camera?: string;
  description?: string;
}

interface UploadedFile {
  file: File;
  preview: string;
  metadata: PhotoMetadata;
}

export default function GalleryUploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      metadata: {
        date: new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\. /g, '.').replace('.', '')
      }
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const updateMetadata = (index: number, field: keyof PhotoMetadata, value: string) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = {
        ...newFiles[index],
        metadata: {
          ...newFiles[index].metadata,
          [field]: value
        }
      };
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();

      files.forEach((uploadedFile, index) => {
        formData.append(`file-${index}`, uploadedFile.file);
        formData.append(`metadata-${index}`, JSON.stringify(uploadedFile.metadata));
      });

      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setMessage({ type: 'success', text: '사진이 성공적으로 업로드되었습니다!' });
      setFiles([]);
    } catch {
      setMessage({ type: 'error', text: '업로드 중 오류가 발생했습니다.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      fontFamily: 'Pretendard'
    }}>
      {/* Header */}
      <header style={{
        padding: '24px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link
          href="/gallery"
          style={{
            color: '#ffffff',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
        >
          ← Back to Gallery
        </Link>
        <h1 style={{
          fontSize: '18px',
          fontWeight: 600
        }}>
          Upload Photos
        </h1>
        <div style={{ width: '120px' }} /> {/* Spacer for centering */}
      </header>

      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 24px'
      }}>
        {/* Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed rgba(255,255,255,0.3)',
            borderRadius: '16px',
            padding: '60px 40px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s, background-color 0.2s',
            marginBottom: '32px'
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = '#00FF00';
            e.currentTarget.style.backgroundColor = 'rgba(0,255,0,0.05)';
          }}
          onDragLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.backgroundColor = 'transparent';

            const droppedFiles = e.dataTransfer.files;
            const newFiles: UploadedFile[] = Array.from(droppedFiles)
              .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name))
              .map(file => ({
                file,
                preview: URL.createObjectURL(file),
                metadata: {
                  date: new Date().toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }).replace(/\. /g, '.').replace('.', '')
                }
              }));
            setFiles(prev => [...prev, ...newFiles]);
          }}
        >
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            📷
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: 500,
            marginBottom: '8px'
          }}>
            클릭하거나 파일을 드래그하세요
          </p>
          <p style={{
            fontSize: '14px',
            opacity: 0.6
          }}>
            JPG, PNG, WebP, GIF 지원
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* File List */}
        {files.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              업로드할 사진 ({files.length})
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {files.map((uploadedFile, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px'
                  }}
                >
                  {/* Preview */}
                  <div style={{
                    width: '120px',
                    height: '120px',
                    flexShrink: 0,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img
                      src={uploadedFile.preview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      onClick={() => removeFile(index)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        border: 'none',
                        color: '#ffffff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Metadata Form */}
                  <div style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px'
                  }}>
                    <input
                      type="text"
                      placeholder="촬영일 (예: 2024.12.25)"
                      value={uploadedFile.metadata.date || ''}
                      onChange={(e) => updateMetadata(index, 'date', e.target.value)}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="위치 (예: Seoul, Korea)"
                      value={uploadedFile.metadata.location || ''}
                      onChange={(e) => updateMetadata(index, 'location', e.target.value)}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="카메라 (예: iPhone 15 Pro)"
                      value={uploadedFile.metadata.camera || ''}
                      onChange={(e) => updateMetadata(index, 'camera', e.target.value)}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="설명"
                      value={uploadedFile.metadata.description || ''}
                      onChange={(e) => updateMetadata(index, 'description', e.target.value)}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            backgroundColor: message.type === 'success'
              ? 'rgba(0,255,0,0.1)'
              : 'rgba(255,0,0,0.1)',
            color: message.type === 'success' ? '#00FF00' : '#FF4444'
          }}>
            {message.text}
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: uploading ? 'rgba(255,255,255,0.1)' : '#00FF00',
              border: 'none',
              borderRadius: '12px',
              color: uploading ? '#ffffff' : '#000000',
              fontSize: '16px',
              fontWeight: 600,
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {uploading ? '업로드 중...' : `${files.length}개 사진 업로드`}
          </button>
        )}
      </main>
    </div>
  );
}
