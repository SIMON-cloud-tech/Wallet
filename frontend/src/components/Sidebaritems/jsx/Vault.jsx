// src/components/DataManage.jsx
import { useState } from 'react';
import '../css/DataManage.css';

const Vault = () => {
  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', // 'softDelete' | 'restore' | 'emptyTrash' | 'report'
    title: '',
    message: '',
    confirmText: '',
    confirmClass: '',
    onConfirm: null,
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // --- Open specific modal ---
  const openModal = (type) => {
    const modals = {
      softDelete: {
        title: '🗑️ Soft Delete Data',
        message:
          'This will backup ALL your transactions and allocation rules to a JSON file, then DELETE them from the database.\n\nYour account credentials (email, password, avatar) will remain untouched.\n\nAre you sure?',
        confirmText: 'Yes, Soft Delete',
        confirmClass: 'btn-soft-delete',
        onConfirm: handleSoftDelete,
      },
      restore: {
        title: '♻️ Restore Data',
        message:
          'This will RESTORE your financial data from the backup file back into the database.\n\nThe backup file will be deleted after a successful restore.\n\nContinue?',
        confirmText: 'Yes, Restore',
        confirmClass: 'btn-restore',
        onConfirm: handleRestore,
      },
      emptyTrash: {
        title: '💀 Empty Trash (Permanent)',
        message:
          'DANGER: This will PERMANENTLY delete the backup file WITHOUT restoring your data.\n\nYour financial data will be gone forever. This cannot be undone.\n\nAre you absolutely sure?',
        confirmText: 'Yes, Delete Forever',
        confirmClass: 'btn-empty-trash',
        onConfirm: handleEmptyTrash,
      },
      report: {
        title: '📊 Generate Report',
        message:
          'A printable report will be generated from your currently dumped (soft-deleted) data.\n\nThe report will open in a new tab and automatically trigger the Print dialog.\n\nYou can save as PDF or print to paper.\n\nProceed?',
        confirmText: 'Yes, Generate',
        confirmClass: 'btn-report',
        onConfirm: handleGenerateReport,
      },
    };

    setModal({ isOpen: true, type, ...modals[type] });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: '',
      title: '',
      message: '',
      confirmText: '',
      confirmClass: '',
      onConfirm: null,
    });
  };

  // --- API Handlers ---
  const handleSoftDelete = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setFeedback({ message: '', type: '' });
    try {
      const res = await fetch('/api/data/soft-delete', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFeedback({ message: data.message, type: res.ok ? 'success' : 'error' });
      if (res.ok) closeModal();
    } catch {
      setFeedback({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setFeedback({ message: '', type: '' });
    try {
      const res = await fetch('/api/data/restore', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFeedback({ message: data.message, type: res.ok ? 'success' : 'error' });
      if (res.ok) closeModal();
    } catch {
      setFeedback({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEmptyTrash = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setFeedback({ message: '', type: '' });
    try {
      const res = await fetch('/api/data/empty-trash', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFeedback({ message: data.message, type: res.ok ? 'success' : 'error' });
      if (res.ok) closeModal();
    } catch {
      setFeedback({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setFeedback({ message: '', type: '' });

    try {
      const res = await fetch('/api/data/generate-report', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        setFeedback({ message: data.message || 'Failed to generate report.', type: 'error' });
        setLoading(false);
        return;
      }

      const html = await res.text();
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        closeModal();
        setFeedback({ message: 'Report generated successfully!', type: 'success' });
      } else {
        setFeedback({ message: 'Pop-up blocked. Please allow pop-ups for this site.', type: 'error' });
      }
    } catch {
      setFeedback({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-manage-container">
      {/* Logo */}
      <div className="data-manage-logo">
        <img src="/logo.png" alt="Company Logo" onError={(e) => e.target.src = 'https://via.placeholder.com/200x80?text=Your+Logo'} />
      </div>

      {/* Description */}
      <p className="data-manage-description">
        <strong>Manage your financial data safely.</strong> Your account credentials (email, password, avatar) will never be touched. Only your transactions and allocation rules are managed below.
      </p>

      {/* Ordered List of Steps */}
      <div className="data-manage-steps">
        <ol>
          <li><strong>Soft Delete</strong> – Backs up your data to a JSON file, then clears your dashboard.</li>
          <li><strong>Restore</strong> – Recovers your data from the backup file and deletes the backup.</li>
          <li><strong>Empty Trash</strong> – Permanently deletes the backup file (data gone forever).</li>
          <li><strong>Print Report</strong> – Generates a printable statement from the backup data (if any).</li>
        </ol>
      </div>

      {/* 4 Buttons – touching each other */}
      <div className="data-btn-group">
        <button className="data-btn soft-delete" onClick={() => openModal('softDelete')} disabled={loading}>
          <span className="btn-icon">🗑️</span>
          <span className="btn-text">Soft Delete</span>
        </button>
        <button className="data-btn restore" onClick={() => openModal('restore')} disabled={loading}>
          <span className="btn-icon">♻️</span>
          <span className="btn-text">Restore</span>
        </button>
        <button className="data-btn empty-trash" onClick={() => openModal('emptyTrash')} disabled={loading}>
          <span className="btn-icon">💀</span>
          <span className="btn-text">Empty Trash</span>
        </button>
        <button className="data-btn report" onClick={() => openModal('report')} disabled={loading}>
          <span className="btn-icon">📊</span>
          <span className="btn-text">Print Report</span>
        </button>
      </div>

      {/* Feedback message */}
      {feedback.message && (
        <div className={`data-feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {/* --- MODAL --- */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>{modal.title}</h2>
            <p className="modal-message">
              {modal.message.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={closeModal} disabled={loading}>
                Cancel
              </button>
              <button
                className={`modal-btn confirm ${modal.confirmClass}`}
                onClick={modal.onConfirm}
                disabled={loading}
              >
                {loading ? '⏳ Processing...' : modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vault;