import React from "react";

// Mock components for demonstration
const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '12px'
      }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{title}</h2>
        <button onClick={onClose} style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          color: '#6b7280'
        }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const LoadingButton = ({ className, onClick, isLoading, disabled, children }) => (
  <button
    className={className}
    onClick={onClick}
    disabled={isLoading || disabled}
    style={{
      padding: '10px 20px',
      borderRadius: '6px',
      border: 'none',
      cursor: isLoading || disabled ? 'not-allowed' : 'pointer',
      opacity: isLoading || disabled ? 0.6 : 1,
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}
  >
    {isLoading && <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>}
    {children}
  </button>
);

// Enhanced ApproveModal Component
const ApproveModal = ({ intern, onClose, onConfirm, isLoading, appliedCriteria, isMatching }) => {
  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(intern.dob);

  return (
    <Modal title={`Xác nhận duyệt hồ sơ`} onClose={onClose}>
      <div style={{ marginBottom: '20px' }}>
        {/* Thông tin ứng viên */}
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
            Thông tin ứng viên
          </h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            <InfoRow label="Họ tên" value={intern.fullName} />
            <InfoRow label="Email" value={intern.email} />
            <InfoRow label="Số điện thoại" value={intern.phone} />
            <InfoRow label="Ngành" value={intern.major} />
            <InfoRow label="GPA" value={intern.gpa} highlight={true} />
            <InfoRow label="Trường" value={intern.school} />
            {age && <InfoRow label="Tuổi" value={`${age} tuổi`} />}
          </div>
        </div>

        {/* Đánh giá tiêu chí (nếu có) */}
        {appliedCriteria && (
          <div style={{
            backgroundColor: isMatching ? '#ecfdf5' : '#fef2f2',
            border: `2px solid ${isMatching ? '#10b981' : '#ef4444'}`,
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>{isMatching ? '✅' : '⚠️'}</span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                {isMatching ? 'Phù hợp tiêu chí' : 'Không phù hợp tiêu chí'}
              </h3>
            </div>

            <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
              {appliedCriteria.gpa?.enabled && (
                <CriteriaCheck
                  label="GPA tối thiểu"
                  required={appliedCriteria.gpa.value}
                  actual={intern.gpa}
                  passed={parseFloat(intern.gpa) >= parseFloat(appliedCriteria.gpa.value)}
                />
              )}
              {appliedCriteria.age?.enabled && age && (
                <CriteriaCheck
                  label="Độ tuổi"
                  required={`${appliedCriteria.age.min || '?'} - ${appliedCriteria.age.max || '?'} tuổi`}
                  actual={`${age} tuổi`}
                  passed={
                    (!appliedCriteria.age.min || age >= parseInt(appliedCriteria.age.min)) &&
                    (!appliedCriteria.age.max || age <= parseInt(appliedCriteria.age.max))
                  }
                />
              )}
            </div>

            {!isMatching && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#dc2626'
              }}>
                <strong>⚠️ Lưu ý:</strong> Ứng viên không đáp ứng đủ tiêu chí đã thiết lập. Vui lòng xem xét kỹ trước khi duyệt.
              </div>
            )}
          </div>
        )}

        {/* Tài liệu đã nộp */}
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
            Tài liệu đã nộp
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {intern.cvPath && (
              <DocumentLink href={intern.cvPath} label="📄 CV" />
            )}
            {intern.permissionFile && (
              <DocumentLink href={intern.permissionFile} label="📝 Đơn xin thực tập" />
            )}
            {intern.universityConfirm && (
              <DocumentLink href={intern.universityConfirm} label="✅ Xác nhận trường" />
            )}
            {!intern.cvPath && !intern.permissionFile && !intern.universityConfirm && (
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Chưa có tài liệu</span>
            )}
          </div>
        </div>

        {/* Xác nhận */}
        <div style={{
          padding: '16px',
          backgroundColor: '#fffbeb',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#92400e'
        }}>
          <strong>⚠️ Xác nhận duyệt hồ sơ:</strong>
          <p style={{ margin: '8px 0 0 0' }}>
            Sau khi duyệt, hồ sơ sẽ được chuyển sang trạng thái <strong>"Đã duyệt"</strong> và ứng viên có thể tiếp tục các bước tiếp theo trong quy trình thực tập.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '24px'
      }}>
        <button
          onClick={onClose}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            backgroundColor: 'white',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            color: '#374151'
          }}
        >
          Hủy
        </button>
        <LoadingButton
          className="btn-confirm-approve"
          onClick={onConfirm}
          isLoading={isLoading}
          style={{
            backgroundColor: '#10b981',
            color: 'white'
          }}
        >
          Xác nhận duyệt
        </LoadingButton>
      </div>
    </Modal>
  );
};

// Helper Components
const InfoRow = ({ label, value, highlight }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
    <span style={{ color: '#6b7280' }}>{label}:</span>
    <span style={{
      fontWeight: highlight ? '600' : '500',
      color: highlight ? '#10b981' : '#111827'
    }}>
      {value}
    </span>
  </div>
);

const CriteriaCheck = ({ label, required, actual, passed }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: 'white',
    borderRadius: '6px'
  }}>
    <span style={{ fontSize: '16px' }}>{passed ? '✅' : '❌'}</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: '500', color: '#111827' }}>{label}</div>
      <div style={{ fontSize: '13px', color: '#6b7280' }}>
        Yêu cầu: {required} | Thực tế: {actual}
      </div>
    </div>
  </div>
);

const DocumentLink = ({ href, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      padding: '8px 12px',
      backgroundColor: 'white',
      border: '1px solid #3b82f6',
      borderRadius: '6px',
      color: '#3b82f6',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = '#3b82f6';
      e.target.style.color = 'white';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = 'white';
      e.target.style.color = '#3b82f6';
    }}
  >
    {label}
  </a>
);

// Demo
export default function App() {
  const [showModal, setShowModal] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const mockIntern = {
    internId: 1,
    fullName: "Nguyễn Văn An",
    email: "nguyenvanan@email.com",
    phone: "0123456789",
    major: "Công nghệ thông tin",
    gpa: "3.5",
    school: "Đại học Bách Khoa Hà Nội",
    dob: "2002-05-15",
    cvPath: "#",
    permissionFile: "#",
    universityConfirm: "#"
  };

  const mockCriteria = {
    gpa: { enabled: true, value: "3.0" },
    age: { enabled: true, min: "20", max: "25" }
  };

  const handleConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      alert("Duyệt hồ sơ thành công!");
      setIsLoading(false);
      setShowModal(false);
    }, 1500);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {showModal && (
        <ApproveModal
          intern={mockIntern}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
          isLoading={isLoading}
          appliedCriteria={mockCriteria}
          isMatching={true}
        />
      )}
    </div>
  );
}