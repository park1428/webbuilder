import React, { useState } from 'react';
import { Icons } from './Icons';
import { exportAsZip, formatFileSize, getEstimatedSize } from '../utils/exportProject';
import { showToast } from './Toast';

const GOALS = [
  {
    id: 'separate',
    icon: 'Layers',
    label: 'Multiple files',
    description: 'Downloads a folder with separate HTML and CSS files. The standard format for any real website — works with web hosts, code editors like VS Code, and developers.',
    badge: 'Recommended',
    steps: [
      'Click "Download My Website" below',
      'Open your Downloads folder and unzip the file',
      <>You will find two files: <strong>index.html</strong> and <strong>style.css</strong></>,
      <>Open <strong>index.html</strong> in your browser to preview, or drag the whole folder into VS Code to edit the code, or upload it to any web host to go live</>,
    ],
    tip: 'Free hosting services like Netlify, GitHub Pages, and Cloudflare Pages all accept this format.',
  },
  {
    id: 'single',
    icon: 'FileCode',
    label: 'Single file',
    description: 'Downloads one self-contained HTML file with everything built in. Easy to open, share, or edit — no folder structure to deal with.',
    badge: null,
    steps: [
      'Click "Download My Website" below',
      'Open your Downloads folder and unzip the file',
      <>Double-click <strong>index.html</strong> to open it in any browser, or open it in VS Code or any text editor to view and edit the code</>,
      'No setup needed. The file works anywhere on its own.',
    ],
    tip: null,
  },
];

function GoalCard({ goal, selected, onSelect }) {
  const Icon = Icons[goal.icon];
  return (
    <button
      onClick={() => onSelect(goal.id)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px',
        border: selected ? '2px solid #7c3aed' : '2px solid #e2e8f0',
        borderRadius: '12px',
        cursor: 'pointer',
        background: selected ? '#f3f0ff' : 'white',
        transition: 'border-color 0.15s, background 0.15s',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '10px',
        background: selected ? '#ede9fe' : '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.15s',
        color: selected ? '#7c3aed' : '#64748b',
      }}>
        <Icon style={{ width: '22px', height: '22px' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '14px' }}>
            {goal.label}
          </span>
          {goal.badge && (
            <span style={{
              fontSize: '10px',
              background: '#dcfce7',
              color: '#166534',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}>
              {goal.badge}
            </span>
          )}
        </div>
        <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
          {goal.description}
        </div>
      </div>
      <div style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        border: selected ? '5px solid #2C5F8D' : '2px solid #cbd5e1',
        flexShrink: 0,
        marginTop: '2px',
        transition: 'all 0.15s',
      }} />
    </button>
  );
}

function NextSteps({ goal }) {
  return (
    <div style={{
      background: '#f8fafc',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{
        fontWeight: 600,
        color: '#475569',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '14px',
      }}>
        What to do after downloading
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {goal.steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: '#e0e7ff',
              color: '#6d28d9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
              flexShrink: 0,
              marginTop: '1px',
            }}>
              {i + 1}
            </div>
            <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.55 }}>
              {step}
            </div>
          </div>
        ))}
      </div>
      {goal.tip && (
        <div style={{
          marginTop: '14px',
          padding: '10px 12px',
          background: '#f3f0ff',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#6d28d9',
          lineHeight: 1.5,
        }}>
          <strong>Tip:</strong> {goal.tip}
        </div>
      )}
    </div>
  );
}

function ExportModal({ project, onClose }) {
  const [goalId, setGoalId] = useState('separate');
  const [minified, setMinified] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exporting, setExporting] = useState(false);

  const selectedGoal = GOALS.find(g => g.id === goalId);
  const estimatedSize = getEstimatedSize(project.content, project.css);
  const formattedSize = formatFileSize(estimatedSize);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAsZip(project, {
        separateFiles: goalId === 'separate',
        minified,
        filename: project.name.replace(/\s+/g, '-').toLowerCase(),
      });
      showToast.success('Your website is downloading. Check your Downloads folder.');
      onClose();
    } catch {
      showToast.error('Download failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        <div className="modal-header">
          <div>
            <h2>Download Your Website</h2>
            <p className="modal-subtitle">Choose a format and follow the steps to get your files.</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{
              fontWeight: 600,
              color: '#1E293B',
              fontSize: '14px',
              marginBottom: '10px',
            }}>
              How do you want your files?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {GOALS.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  selected={goalId === goal.id}
                  onSelect={setGoalId}
                />
              ))}
            </div>
          </div>

          <NextSteps goal={selectedGoal} />

          <div>
            <button
              onClick={() => setShowAdvanced(v => !v)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                fontSize: '12px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span style={{
                display: 'inline-block',
                transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s',
                fontSize: '9px',
              }}>▶</span>
              Advanced options
            </button>

            {showAdvanced && (
              <div style={{
                marginTop: '10px',
                padding: '14px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={minified}
                    onChange={(e) => setMinified(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '2px', flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '13px' }}>
                      Compress code
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px', lineHeight: 1.5 }}>
                      Makes files slightly smaller by removing extra spacing. Useful if you are on a slow connection.
                      Your site is currently about <strong>{formattedSize}</strong>.
                    </div>
                  </div>
                </label>
              </div>
            )}
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
            style={{ minWidth: '190px' }}
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
                  marginRight: '8px',
                }} />
                Downloading...
              </>
            ) : (
              <>
                <Icons.Download />
                Download My Website
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
