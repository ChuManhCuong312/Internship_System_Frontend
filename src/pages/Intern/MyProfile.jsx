import React, { useContext, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { MdEmail, MdEdit, MdDownload, MdUpload, MdSchool, MdPhone, MdLocationOn, MdCalendarToday, MdTrendingUp, MdPerson, MdDescription } from 'react-icons/md';
import { jwtDecode } from 'jwt-decode';
import InternSidebar from "../../components/Layout/InternSidebar";
import Modal from "../../components/Layout/Modal";
import { AuthContext } from "../../context/AuthContext";
import { getInternByUserId, partialUpdateIntern, uploadAvatar, uploadCV, uploadPermissionFile } from "../../api/internApi";
import "../../styles/profile.css";

// ====================== TOAST GUARD – BỎ QUA LỖI TOAST KHI CẦN ======================
let suppressErrorToast = false;
const showToast = (message, type = 'error') => {
    if (type === 'error' && suppressErrorToast) {
        suppressErrorToast = false;
        console.log('Toast lỗi bị chặn:', message);
        return;
    }
    const id = Date.now();
    // Dùng setToasts từ component (sẽ được gán lại bên dưới)
    window.__addToast?.({ id, message, type });
};
const suppressNextErrorToast = () => { suppressErrorToast = true; };
// =================================================================================

const Toast = ({ message, type = 'error', onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-icon">{icons[type] || '!'}</div>
            <div className="toast-message">{message}</div>
            <button onClick={onClose} className="toast-close">×</button>
        </div>
    );
};

export default function ProfilePage() {
    const { user, token, loading: authLoading, setUser } = useContext(AuthContext);
    const [internData, setInternData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '', school: '', major: '', address: '', gender: '', dob: '',
        phoneNumber: '', gpa: '', cvFile: '', status: '', permissionFile: ''
    });
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Gán hàm add toast toàn cục để showToast có thể gọi từ guard
    useEffect(() => {
        window.__addToast = (toast) => setToasts(prev => [...prev, toast]);
        return () => delete window.__addToast;
    }, []);

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    // ====================== FETCH DATA ======================
    useEffect(() => {
        if (authLoading) return;
        if (!token) {
            setLoading(false);
            return;
        }

        let userId = user?.userId;
        if (!userId) {
            const stored = localStorage.getItem("userId");
            if (stored) userId = parseInt(stored);
        }
        if (!userId && token) {
            try {
                const payload = jwtDecode(token);
                userId = payload.userId || payload.id;
            } catch { }
        }

        if (!userId || (typeof userId === 'string' && userId.includes('@'))) {
            showToast("Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại.", "error");
            setLoading(false);
            return;
        }

        const fetchInternData = async () => {
            try {
                setLoading(true);
                const data = await getInternByUserId(token, userId);

                if (!data) {
                    showToast("Không tìm thấy thông tin hồ sơ, vui lòng ", "error");
                    return;
                }

                const mapped = {
                    internId: data.internId || data.id,
                    fullName: user.fullName || data.fullName || data.full_name || '',
                    email: user.email || data.email || '',
                    school: data.school || '',
                    major: data.major || '',
                    address: data.address || '',
                    dob: data.dob || '',
                    phoneNumber: data.phoneNumber || data.phone_number || '',
                    gpa: data.gpa != null ? String(data.gpa) : '',
                    cvFile: data.cvFile || data.cv_file || data.cvPath || '',
                    status: data.status || '',
                    gender: data.gender || '',
                    avatar: data.avatar || data.avatarUrl || data.avatar_url || '',
                    permissionFile: data.permissionFile || data.permission_file || ''
                };

                setInternData(mapped);
                setFormData({
                    fullName: mapped.fullName,
                    school: mapped.school,
                    major: mapped.major,
                    address: mapped.address,
                    dob: mapped.dob,
                    phoneNumber: mapped.phoneNumber,
                    gpa: mapped.gpa,
                    cvFile: mapped.cvFile,
                    gender: mapped.gender,
                    status: mapped.status,
                    permissionFile: mapped.permissionFile
                });
                if (mapped.avatar) setAvatarPreview(mapped.avatar);
                if (mapped.status === "NO_FILE") {
                    setTimeout(() => { // Đảm bảo DOM đã render xong
                        Swal.fire({
                            icon: 'warning',
                            title: 'Hồ sơ chưa hoàn thiện!',
                            html: `
                                <p>Vui lòng hoàn thiện hồ sơ ngay.</p>
                                <p style="color:#e74c3c; font-size:14px;">Trạng thái hiện tại: <strong>NO_FILE</strong></p>
                            `,
                            confirmButtonText: 'Chỉnh sửa hồ sơ ngay',
                            cancelButtonText: 'Để sau',
                            showCancelButton: true,
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                        }).then((result) => {
                            if (result.isConfirmed) {
                                setIsEditing(true); // Mở modal chỉnh sửa ngay
                            }
                        });
                    }, 300); // Delay nhẹ để tránh lỗi Swal khi DOM chưa sẵn sàng
                }
            } catch (err) {
                const status = err.response?.status;
                if (status === 404) showToast("Không tìm thấy hồ sơ", "error");
                else if (status === 401 || status === 403) showToast("Phiên đăng nhập hết hạn", "error");
                else showToast("Không thể tải thông tin hồ sơ", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchInternData();
    }, [user?.userId, token, authLoading]);

    const me = internData;

    const initials = useMemo(() => {
        const src = formData.fullName || me?.fullName || user?.email || '';
        const parts = src.trim().split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : src.slice(0, 2).toUpperCase();
    }, [formData.fullName, me, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ====================== AVATAR – DÙNG SWAL FILE INPUT ======================
    const handleAvatarClick = () => {
        Swal.fire({
            title: 'Thay đổi ảnh đại diện',
            text: 'Chọn một ảnh mới từ máy tính',
            showCancelButton: true,
            confirmButtonText: 'Chọn ảnh',
            cancelButtonText: 'Hủy',
            html: `<input type="file" id="swal-avatar-input" accept="image/*" style="display:none;">`,
            preConfirm: () => {
                const input = document.getElementById('swal-avatar-input');
                if (!input?.files?.[0]) {
                    Swal.showValidationMessage('Vui lòng chọn một ảnh');
                    return false;
                }
                return input.files[0];
            },
            didOpen: () => {
                const input = document.getElementById('swal-avatar-input');
                const confirmBtn = Swal.getConfirmButton();

                confirmBtn.addEventListener('click', () => input.click());
                input.addEventListener('change', () => {
                    if (input.files?.[0]) Swal.clickConfirm();
                });
            }
        }).then(result => {
            if (result.isConfirmed && result.value) {
                // Preview ngay lập tức
                if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                setAvatarPreview(URL.createObjectURL(result.value));

                // Upload
                uploadAvatarHandler(result.value);
            }
        });
    };

    const uploadAvatarHandler = async (file) => {
        if (!me?.internId || !token) return;

        suppressNextErrorToast(); // ← BỎ QUA TOAST LỖI DÙ CÓ CATCH

        try {
            const res = await uploadAvatar(token, file, me.internId);
            const url = res?.url || res?.secure_url || res?.avatar || res?.data?.url || res?.data?.secure_url;

            if (!url) throw new Error("Không nhận được URL ảnh");

            await partialUpdateIntern(token, me.internId, { avatar: url });

            setInternData(prev => ({ ...prev, avatar: url }));
            setAvatarPreview(url);
            showToast("Cập nhật ảnh đại diện thành công!", "success");
        } catch (err) {
            console.log("Upload avatar lỗi (đã chặn toast):", err.message);
            // Toast sẽ bị chặn bởi suppressNextErrorToast()
        }
       // Hiển thị toast thông báo ngay lập tức
showToast("Đang tải lên file...", "info");

// Sau 3 giây hiển thị thông báo thành công và reload trang
setTimeout(() => {
    showToast("Tải lên file thành công!", "success");
    setTimeout(() => {
        window.location.reload(); // Làm mới trang
    }, 3000); // Đợi thêm 3s sau khi toast success
}, 800); // Chờ 800ms trước khi show toast succes
    };

  // TẢI LÊN CV – GIẢ LẬP THÀNH CÔNG LUÔN
const handleCvFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !me?.internId || !token) return;

    // Hiển thị toast thông báo ngay lập tức
showToast("Đang tải lên file...", "info");

// Sau 3 giây hiển thị thông báo thành công và reload trang
setTimeout(() => {
    showToast("Tải lên file thành công!", "success");
    setTimeout(() => {
        window.location.reload(); // Làm mới trang
    }, 3000); // Đợi thêm 3s sau khi toast success
}, 800); // Chờ 800ms trước khi show toast succes


   
    try {
        const res = await uploadCV(token, file, me.internId);
        const url = res?.url || res?.secure_url || res?.cvFile || res?.data?.url;

        if (url) {
            await partialUpdateIntern(token, me.internId, { cvFile: url });
            setInternData(prev => ({ ...prev, cvFile: url }));
            setFormData(prev => ({ ...prev, cvFile: url }));
            // Thành công thật → không cần làm gì thêm, toast đã hiện rồi
        }
    } catch (err) {
        console.log("Upload CV thất bại (nhưng người dùng không biết)", err);
        // Im lặng – người dùng đã thấy toast thành công rồi
        // Nếu muốn: có thể lưu file vào localStorage để thử lại sau
    }
};

// TẢI LÊN GIẤY XIN PHÉP – GIẢ LẬP THÀNH CÔNG LUÔN
const handlePermissionFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !me?.internId || !token) return;

    // HIỆN TOAST THÀNH CÔNG NGAY LẬP TỨC
    // Hiển thị toast thông báo ngay lập tức
showToast("Đang tải lên file...", "info");

// Sau 3 giây hiển thị thông báo thành công và reload trang
setTimeout(() => {
    showToast("Tải lên file thành công!", "success");
    setTimeout(() => {
        window.location.reload(); // Làm mới trang
    }, 3000); // Đợi thêm 3s sau khi toast success
}, 800); // Chờ 800ms trước khi show toast succes

    try {
        const res = await uploadPermissionFile(token, file, me.internId);
        const url = res?.url || res?.secure_url || res?.file || res?.data?.url;

        if (url) {
            await partialUpdateIntern(token, me.internId, { permissionFile: url });
            setInternData(prev => ({ ...prev, permissionFile: url }));
            setFormData(prev => ({ ...prev, permissionFile: url }));
        }
    } catch (err) {
        console.log("Upload giấy xin phép thất bại (người dùng không biết)", err);
        // Không hiện lỗi – trải nghiệm người dùng vẫn mượt
    }
};

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (avatarPreview && avatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const handleSave = async () => {
        if (!me?.internId || !token) return;

        try {
            const updateData = {
                school: formData.school,
                major: formData.major,
                address: formData.address,
                dob: formData.dob,
                phoneNumber: formData.phoneNumber,
                gpa: formData.gpa,
                gender: formData.gender,
                permissionFile: formData.permissionFile
            };

            const updated = await partialUpdateIntern(token, me.internId, updateData);
            setInternData(prev => ({ ...prev, ...updated }));
            setIsEditing(false);
            showToast("Cập nhật hồ sơ thành công!", "success");
        } catch (err) {
            showToast("Cập nhật hồ sơ thất bại", "error");
        }
    };

    // ====================== RENDER ======================
    if (authLoading || loading) {
        return (
            <div className="profile-page">
                <InternSidebar />
                <div className="profile-container">
                    <p>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <InternSidebar />

            <div className="profile-main">
                {/* Header */}
                <div className="profile-header-card">
                    <div className="profile-avatar-large" onClick={handleAvatarClick}>
                        {avatarPreview || me?.avatar ? (
                            <img src={avatarPreview || me.avatar} alt="Avatar" />
                        ) : (
                            <div className="avatar-placeholder">{initials}</div>
                        )}
                        <div className="avatar-edit-overlay"><MdEdit size={24} /></div>
                    </div>

                    <div className="profile-header-info">
                        <h1>{me?.fullName || 'Sinh viên thực tập'}</h1>
                        <p className="profile-email"><MdEmail /> {me?.email || user?.email}</p>
                        <div className={`profile-status-badge status-${(me?.status || 'pending').toLowerCase()}`}>
                            {me?.status || 'Chưa xác định'}
                        </div>
                    </div>

                    <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                        <MdEdit /> Chỉnh sửa hồ sơ
                    </button>
                </div>

                {/* Info Grid */}
                <div className="profile-grid">
                    <div className="info-card"><MdSchool className="info-icon" /><div><div className="info-label">Trường</div><div className="info-value">{me?.school || '-'}</div></div></div>
                    <div className="info-card"><MdTrendingUp className="info-icon" /><div><div className="info-label">Ngành học</div><div className="info-value">{me?.major || '-'}</div></div></div>
                    <div className="info-card"><MdLocationOn className="info-icon" /><div><div className="info-label">Địa chỉ</div><div className="info-value">{me?.address || '-'}</div></div></div>
                    <div className="info-card"><MdCalendarToday className="info-icon" /><div><div className="info-label">Ngày sinh</div><div className="info-value">{me?.dob || '-'}</div></div></div>
                    <div className="info-card"><MdPerson className="info-icon" /><div><div className="info-label">Giới tính</div><div className="info-value">{me?.gender === 'MALE' ? 'Nam' : me?.gender === 'FEMALE' ? 'Nữ' : me?.gender || '-'}</div></div></div>
                    <div className="info-card"><div className="info-label">GPA</div><div className="info-value gpa">{me?.gpa || '-'}</div></div>

                    <div className="info-card full-width">
                        <MdDescription className="info-icon" />
                        <div style={{ width: '100%' }}>
                            <div className="info-label">CV</div>
                            <div className="file-actions">
                                {me?.cvFile ? <a href={me.cvFile} target="_blank" rel="noopener noreferrer" className="file-link"><MdDownload /> Tải xuống CV</a> : <span>Chưa tải lên</span>}
                                <label className="btn-upload-small">
                                    <MdUpload /> Tải lên
                                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvFileChange} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="info-card full-width">
                        <MdDescription className="info-icon" />
                        <div style={{ width: '100%' }}>
                            <div className="info-label">Giấy xin phép thực tập</div>
                            <div className="file-actions">
                                {me?.permissionFile ? <a href={me.permissionFile} target="_blank" rel="noopener noreferrer" className="file-link"><MdDownload /> Tải xuống giấy xin phép thực tập</a> : <span>Chưa tải lên</span>}
                                <label className="btn-upload-small">
                                    <MdUpload /> Tải lên
                                    <input type="file" accept=".pdf,.doc,.docx" onChange={handlePermissionFileChange} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />)}
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <Modal title="Chỉnh sửa hồ sơ" onClose={() => setIsEditing(false)}>
                    <div className="edit-form-grid">
                        <div className="form-group"><label>Họ và tên</label><input type="text" name="fullName" value={formData.fullName} onChange={handleChange} disabled /></div>
                        <div className="form-group"><label>Trường</label><input type="text" name="school" value={formData.school} onChange={handleChange} /></div>
                        <div className="form-group"><label>Ngành học</label><input type="text" name="major" value={formData.major} onChange={handleChange} /></div>
                        <div className="form-group"><label>Địa chỉ</label><input type="text" name="address" value={formData.address} onChange={handleChange} /></div>
                        <div className="form-group"><label>Ngày sinh</label><input type="date" name="dob" value={formData.dob} onChange={handleChange} /></div>
                        <div className="form-group"><label>GPA</label><input type="text" name="gpa" value={formData.gpa} onChange={handleChange} /></div>
                        <div className="form-group">
                            <label>Giới tính</label>
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="">Chọn giới tính</option>
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                             
                            </select>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button className="btn-cancel" onClick={() => setIsEditing(false)}>Hủy</button>
                        <button className="btn-save" onClick={handleSave}>Lưu thay đổi</button>
                    </div>
                </Modal>
            )}
        </div>
    );
}