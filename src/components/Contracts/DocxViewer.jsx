// src/components/Contracts/DocxViewer.jsx
import React from 'react';

const DocxViewer = ({ fileUrl }) => {
  if (!fileUrl) return null;

  // ==== BƯỚC QUAN TRỌNG NHẤT: Fix link Cloudinary ====
  let directUrl = fileUrl.trim();

  if (directUrl.includes('res.cloudinary.com')) {
    // Cách chắc chắn nhất 2025: dùng fl_attachment + raw
    directUrl = directUrl
      .replace('/upload/', '/raw/upload/fl_attachment/')
      .replace('/image/upload/', '/raw/upload/fl_attachment/');

    // Nếu chưa có version thì thêm cũng được (không bắt buộc)
    if (!directUrl.includes('/v1')) {
      const parts = directUrl.split('/upload/');
      if (parts.length > 1) {
        directUrl = parts[0] + '/upload/v1/' + parts[1];
      }
    }
  }

  // Microsoft Office Online Viewer – HOẠT ĐỘNG HOÀN HẢO
  const msViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(directUrl)}`;

  return (
    <div style={{ position: 'relative', background: '#f5f5f5', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Nút tải về nổi góc phải */}
      <a
        href={fileUrl}
        download
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: '#d32f2f',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '14px',
          textDecoration: 'none',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        Tải về
      </a>

      {/* Microsoft Viewer */}
      <iframe
        src={msViewerUrl}
        title="Hợp đồng DOCX"
        style={{
          width: '100%',
          height: '80vh',
          border: 'none',
        }}
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
};

export default DocxViewer;