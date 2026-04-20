import React, { useState } from 'react';
import { Icons } from './Icons';
import { exportAsZip, formatFileSize, getEstimatedSize } from '../utils/exportProject';
import { showToast } from './Toast';

function ExportModal({ project, onClose }) {
  const [exportType, setExportType] = useState('separate'); // 'separate' or 'single'
  const [minified, setMinified] = useState(false);
  const [exporting, setExporting] = useState(false);

  const estimatedSize = getEstimatedSize(project.content, project.css);
  const formattedSize = formatFileSize(estimatedSize);

  const handleExport = async () => {
    setExporting(true);

    try {
      const result = await exportAsZip(project, {
        separateFiles: exportType === 'separate',
        minified,
        filename: project.name.replace(/\s+/g, '-').toLowerCase()
      });

      showToast.success(`Project exported successfully! (${formatFileSize(result.size)})`);
      onClose();
    } catch (error) {
      showToast.error('Failed to export project');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div>
            <h2>Export Project</h2>
            <p className="modal-subtitle">Download your website as HTML/CSS files</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label style={{ fontWeight: 600, marginBottom: '12px', display: 'block' }}>
              Export Format
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                border: exportType === 'separate' ? '2px solid #2C5F8D' : '2px solid #e2e8f0',
                borderRadius: '10px',
                cursor: 'pointer',
                background: exportType === 'separate' ? '#eff6ff' : 'white',
                transition: 'all 0.2s'
              }}>
                <input
                  type="radio"
                  name="exportType"
                  checked={exportType === 'separate'}
                  onChange={() => setExportType('separate')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#1E293B', marginBottom: '4px' }}>
                    Separate Files (Recommended)
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    index.html + style.css - easier to edit
                  </div>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                border: exportType === 'single' ? '2px solid #2C5F8D' : '2px solid #e2e8f0',
                borderRadius: '10px',
                cursor: 'pointer',
                background: exportType === 'single' ? '#eff6ff' : 'white',
                transition: 'all 0.2s'
              }}>
                <input
                  type="radio"
                  name="exportType"
                  checked={exportType === 'single'}
                  onChange={() => setExportType('single')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#1E293B', marginBottom: '4px' }}>
                    Single File
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    index.html with inline CSS - portable
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={minified}
                onChange={(e) => setMinified(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '14px' }}>
                  Minify code
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Reduce file size by removing whitespace
                </div>
              </div>
            </label>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#fffbeb',
            borderRadius: '10px',
            border: '1px solid #fde68a'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Icons.FileCode style={{ width: 20, height: 20, color: '#92400e' }} />
              <span style={{ fontWeight: 600, color: '#92400e', fontSize: '14px' }}>
                Export Details
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#78350f', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Estimated size:</span>
                <span style={{ fontWeight: 600 }}>{formattedSize}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Files:</span>
                <span style={{ fontWeight: 600 }}>
                  {exportType === 'separate' ? '2 files (HTML + CSS)' : '1 file (HTML)'}
                </span>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#eff6ff',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#1e40af',
            lineHeight: 1.5
          }}>
            <strong>Note:</strong> After downloading, open index.html in any web browser to view your website.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={exporting}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleExport}
            disabled={exporting}
            style={{ minWidth: '140px' }}
          >
            {exporting ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                  marginRight: '8px'
                }} />
                Exporting...
              </>
            ) : (
              <>
                <Icons.Download />
                Download ZIP
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ExportModal;
