import React, { useContext, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { MdEmail, MdEdit, MdDownload, MdUpload, MdSchool, MdPhone, MdLocationOn, MdCalendarToday, MdTrendingUp, MdPerson, MdDescription } from 'react-icons/md';
import { jwtDecode } from 'jwt-decode';
import InternSidebar from "../../components/Layout/InternSidebar";
import Modal from "../../components/Layout/Modal";
import { AuthContext } from "../../context/AuthContext";
import { getInternByUserId, partialUpdateIntern, uploadAvatar, uploadCV, uploadPermissionFile } from "../../api/internApi";
import "../../styles/profile.css";

// Toast Component - Đã được nâng cấp
const Toast = ({ message, type = 'error', onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-icon">{icons[type]}</div>
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
    const [formData, setFormData] = useState({ fullName: '', school: '', major: '', address: '', gender: '', dob: '', phoneNumber: '', gpa: '', cvFile: '', status: '', permissionFile: '' });
    const [avatarPreview, setAvatarPreview] = useState(null);

    const showToast = (message, type = 'error') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    useEffect(() => {
        console.log("MyProfile useEffect triggered", { 
            authLoading, 
            hasUser: !!user, 
            userId: user?.userId, 
            hasToken: !!token 
        });

        // Wait for auth context to finish loading
        if (authLoading) {
            console.log("Waiting for auth to finish loading...");
            return;
        }

        // If no token, stop loading
        if (!token) {
            console.warn("Missing token, cannot fetch intern data");
            setLoading(false);
            return;
        }

        // Get userId from user object, localStorage, or extract from token
        let userId = user?.userId;
        
        // Fallback 1: Check localStorage directly (in case AuthContext hasn't restored it yet)
        if (!userId) {
            const storedUserId = localStorage.getItem("userId");
            if (storedUserId) {
                userId = parseInt(storedUserId);
                console.log("Found userId in localStorage:", userId);
                // Update the user context with the found userId
                if (user && !user.userId) {
                    setUser(prev => ({ ...prev, userId: userId }));
                }
            }
        }
        
        // Fallback 2: Try to extract from token (though it likely won't be there)
        if (!userId && token) {
            try {
                const payload = jwtDecode(token);
                // Only use userId or id from token, NOT sub (which is email)
                userId = payload.userId || payload.id;
                console.log("Extracted userId from token:", userId, "Token payload:", payload);
            } catch (err) {
                console.error("Failed to decode token:", err);
            }
        }

        // Validate userId - it should be numeric, not an email
        if (!userId || (typeof userId === 'string' && userId.includes('@'))) {
            console.warn("Cannot determine valid userId, cannot fetch intern data", {
                hasUser: !!user,
                userId: user?.userId,
                storedUserId: localStorage.getItem("userId"),
                extractedUserId: userId,
                hasToken: !!token,
                userEmail: user?.email
            });
            showToast("Không thể xác định thông tin người dùng. Vui lòng đăng xuất và đăng nhập lại để cập nhật thông tin.", "error");
            setLoading(false);
            return;
        }

        const fetchInternData = async () => {
            console.log("Fetching intern data for userId:", userId);
            
            try {
                setLoading(true);
                
                // Always fetch fresh data on mount/refresh
                const data = await getInternByUserId(token, userId);
                
                console.log("API Response Data:", data);
                console.log("User data from context:", user);
                
                // Handle case where data might be null or undefined
                if (!data) {
                    console.warn("API returned null or undefined data");
                    showToast("Không tìm thấy thông tin hồ sơ", "error");
                    setLoading(false);
                    return;
                }
                
                // Map API response fields to component format
                // Handle both direct data and nested data structures
                const mappedData = {
                    internId: data.internId || data.id || null,
                    userId: data.userId || user.userId,
                    fullName: user.fullName || data.fullName || data.full_name || '',
                    email: user.email || data.email || '',
                    school: data.school || '',
                    major: data.major || '',
                    address: data.address || '',
                    dob: data.dob || '',
                    phoneNumber: data.phoneNumber || data.phone_number || '',
                    gpa: data.gpa !== undefined && data.gpa !== null ? String(data.gpa) : '',
                    cvFile: data.cvFile || data.cv_file || data.cvPath || '',
                    status: data.status || '',
                    gender: data.gender || '',
                    avatar: data.avatar || data.avatarUrl || data.avatar_url || '',
                    permissionFile: data.permissionFile || data.permission_file || ''
                };
                
                console.log("Mapped Data:", mappedData);
                console.log("Successfully fetched and mapped intern data");
                
                setInternData(mappedData);
                
                // Initialize form data
                setFormData({
                    fullName: mappedData.fullName,
                    school: mappedData.school,
                    major: mappedData.major,
                    address: mappedData.address,
                    dob: mappedData.dob,
                    phoneNumber: mappedData.phoneNumber,
                    gpa: mappedData.gpa,
                    cvFile: mappedData.cvFile,
                    gender: mappedData.gender,
                    status: mappedData.status,
                    permissionFile: mappedData.permissionFile
                });
            } catch (err) {
                console.error("Error fetching intern data:", err);
                console.error("Error details:", {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    userId: userId
                });
                
                // Provide more specific error messages
                if (err.response?.status === 500) {
                    showToast("Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.", "error");
                } else if (err.response?.status === 404) {
                    showToast("Không tìm thấy thông tin hồ sơ. Vui lòng kiểm tra lại thông tin đăng nhập.", "error");
                } else if (err.response?.status === 401 || err.response?.status === 403) {
                    showToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "error");
                } else {
                    showToast("Không thể tải thông tin hồ sơ. Vui lòng thử lại.", "error");
                }
            } finally {
                setLoading(false);
            }
        };

        // Always fetch when component mounts or dependencies change
        fetchInternData();
    }, [user?.userId, token, authLoading]);

    const me = internData;

    const initials = useMemo(() => {
        const source = formData.fullName || me?.fullName || user?.email || '';
        const parts = source.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return source.slice(0, 2).toUpperCase();
    }, [formData.fullName, me, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

   

    const handleAvatarClick = () => {
  Swal.fire({
    title: 'Bạn có muốn thay đổi ảnh đại diện không?',
    showCancelButton: true,
    confirmButtonText: 'Có',
    cancelButtonText: 'Không',
  }).then((result) => {
    if (result.isConfirmed) {
      document.getElementById("avatarUpload").click();
    }
  });
};


    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Show preview immediately
        if (avatarPreview) {
            try {
                URL.revokeObjectURL(avatarPreview);
            } catch { }
        }
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
        
        // Upload to Cloudinary if internId exists
        if (internData?.internId && token) {
            try {
                console.log("Uploading avatar to Cloudinary...", { internId: internData.internId, fileName: file.name });
                const uploadResult = await uploadAvatar(token, file, internData.internId);
                console.log("Cloudinary upload result:", uploadResult);
                
                // Try multiple possible response formats
                const avatarUrl = uploadResult?.url || 
                                 uploadResult?.secure_url || 
                                 uploadResult?.avatar || 
                                 uploadResult?.data?.url ||
                                 uploadResult?.data?.secure_url;
                
                if (!avatarUrl) {
                    console.warn("No avatar URL in upload result:", uploadResult);
                    showToast("Tải lên thành công nhưng không nhận được URL ảnh. Vui lòng thử lại.", "warning");
                    return;
                }
                
                console.log("Updating intern profile with avatar URL:", avatarUrl);
                // Try different field names that backend might expect
                try {
                    await partialUpdateIntern(token, internData.internId, { avatar: avatarUrl });
                } catch (updateError) {
                    // Try alternative field names
                    console.log("Trying alternative field names...");
                    try {
                        await partialUpdateIntern(token, internData.internId, { avatarUrl: avatarUrl });
                    } catch (updateError2) {
                        // Try with both field names
                        await partialUpdateIntern(token, internData.internId, { 
                            avatar: avatarUrl,
                            avatarUrl: avatarUrl 
                        });
                    }
                }
                
                setInternData(prev => ({ ...prev, avatar: avatarUrl }));
                
                // Update preview with the actual URL from Cloudinary
                if (avatarUrl) {
                    try {
                        URL.revokeObjectURL(previewUrl);
                    } catch { }
                    setAvatarPreview(avatarUrl);
                }
                
                console.log("Avatar updated successfully");
                showToast("Cập nhật ảnh đại diện thành công!", "success");
            } catch (err) {
                console.error("Error uploading avatar:", err);
                console.error("Error details:", {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    file: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                    stack: err.stack
                });
                
                const errorMessage = err.response?.data?.message || 
                                   err.response?.data?.error || 
                                   err.message || 
                                   "Có lỗi xảy ra khi tải lên ảnh đại diện";
                showToast(errorMessage, "error");
                // Keep the preview even if upload fails
            }
        }
    };

    const handleCvFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Upload to Cloudinary if internId exists
        if (internData?.internId && token) {
            try {
                const uploadResult = await uploadCV(token, file, internData.internId);
                const cvUrl = uploadResult.url || uploadResult.secure_url || uploadResult.cvFile;
                
                // Update intern data with the new CV URL
                await partialUpdateIntern(token, internData.internId, { cvFile: cvUrl });
                setInternData(prev => ({ ...prev, cvFile: cvUrl }));
                setFormData(prev => ({ ...prev, cvFile: cvUrl }));
                showToast("Tải lên CV thành công!", "success");
            } catch (err) {
                console.error("Error uploading CV file:", err);
                showToast("Có lỗi xảy ra khi tải lên CV", "error");
            }
        } else {
            showToast("Không thể tải lên CV. Vui lòng thử lại sau.", "error");
        }
    };

    const handlePermissionFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Upload to Cloudinary if internId exists
        if (internData?.internId && token) {
            try {
                const uploadResult = await uploadPermissionFile(token, file, internData.internId);
                const permissionUrl = uploadResult.url || uploadResult.secure_url || uploadResult.file;
                
                // Update intern data with the new permission file URL
                await partialUpdateIntern(token, internData.internId, { permissionFile: permissionUrl });
                setInternData(prev => ({ ...prev, permissionFile: permissionUrl }));
                setFormData(prev => ({ ...prev, permissionFile: permissionUrl }));
                showToast("Tải lên Permission File thành công!", "success");
            } catch (err) {
                console.error("Error uploading permission file:", err);
                showToast("Có lỗi xảy ra khi tải lên permission file", "error");
            }
        } else {
            showToast("Không thể tải lên permission file. Vui lòng thử lại sau.", "error");
        }
    };

    useEffect(() => {
        return () => {
            if (avatarPreview) {
                try {
                    URL.revokeObjectURL(avatarPreview);
                } catch { }
            }
        };
    }, [avatarPreview]);

    const handleSave = async () => {
        if (!me?.internId || !token) return;
        
        try {
            // Map form data back to API format
            const updateData = {
                school: formData.school,
                major: formData.major,
                address: formData.address,
                dob: formData.dob,
                phoneNumber: formData.phoneNumber,
                gpa: formData.gpa,
                cvFile: formData.cvFile,
                gender: formData.gender,
                status: formData.status,
                permissionFile: formData.permissionFile
            };
            
            const updated = await partialUpdateIntern(token, me.internId, updateData);
            
            // Update local state with response
            setInternData(prev => ({
                ...prev,
                ...updated,
                cvFile: updated.cvFile || prev.cvFile
            }));
            
            setIsEditing(false);
            showToast("Cập nhật hồ sơ thành công!", "success");
        } catch (err) {
            console.error("Error updating profile:", err);
            showToast("Có lỗi xảy ra khi cập nhật hồ sơ", "error");
        }
    };

    if (authLoading || loading) {
        return (
            <div className="profile-page">
                <InternSidebar />
                <div className="profile-container">
                    <div className="profile-content">
                        <div className="profile-card">
                            <p>Đang tải thông tin...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <InternSidebar />

            <div className="profile-main">
                {/* Header Card */}
                <div className="profile-header-card">
                    <div className="profile-avatar-large" onClick={handleAvatarClick}>
                        {avatarPreview || me?.avatar ? (
                            <img src={avatarPreview || me.avatar} alt="Avatar" />
                        ) : (
                            <div className="avatar-placeholder">{initials}</div>
                        )}
                        <div className="avatar-edit-overlay">
                            <MdEdit size={24} />
                        </div>
                        <input id="avatarUpload" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                    </div>

                    <div className="profile-header-info">
                        <h1>{me?.fullName || 'Sinh viên thực tập'}</h1>
                        <p className="profile-email"><MdEmail /> {me?.email || user?.email}</p>
                        <div className="profile-status-badge status-{me?.status?.toLowerCase() || 'pending'}">
                            {me?.status || 'Chưa xác định'}
                        </div>
                    </div>

                    <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                        <MdEdit /> Chỉnh sửa hồ sơ
                    </button>
                </div>

                {/* Info Grid */}
                <div className="profile-grid">
                    <div className="info-card">
                        <MdSchool className="info-icon" />
                        <div>
                            <div className="info-label">Trường</div>
                            <div className="info-value">{me?.school || '-'}</div>
                        </div>
                    </div>

                    <div className="info-card">
                        <MdTrendingUp className="info-icon" />
                        <div>
                            <div className="info-label">Ngành học</div>
                            <div className="info-value">{me?.major || '-'}</div>
                        </div>
                    </div>

                    <div className="info-card">
                        <MdPhone className="info-icon" />
                        <div>
                            <div className="info-label">Số điện thoại</div>
                            <div className="info-value">{me?.phoneNumber || '-'}</div>
                        </div>
                    </div>

                    <div className="info-card">
                        <MdLocationOn className="info-icon" />
                        <div>
                            <div className="info-label">Địa chỉ</div>
                            <div className="info-value">{me?.address || '-'}</div>
                        </div>
                    </div>

                    <div className="info-card">
                        <MdCalendarToday className="info-icon" />
                        <div>
                            <div className="info-label">Ngày sinh</div>
                            <div className="info-value">{me?.dob || '-'}</div>
                        </div>
                    </div>

                    <div className="info-card">
                        <MdPerson className="info-icon" />
                        <div>
                            <div className="info-label">Giới tính</div>
                            <div className="info-value">{me?.gender === 'MALE' ? 'Nam' : me?.gender === 'FEMALE' ? 'Nữ' : me?.gender || '-'}</div>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-label">GPA</div>
                        <div className="info-value gpa">{me?.gpa || '-'}</div>
                    </div>

                    <div className="info-card full-width">
                        <MdDescription className="info-icon" />
                        <div style={{ width: '100%' }}>
                            <div className="info-label">CV</div>
                            <div className="file-actions">
                                {me?.cvFile ? (
                                    <a href={me.cvFile} target="_blank" rel="noopener noreferrer" className="file-link">
                                        <MdDownload /> Tải xuống CV
                                    </a>
                                ) : <span>Chưa tải lên</span>}
                                <label className="btn-upload-small">
                                    <MdUpload /> Tải lên
                                    <input id="cvUpload" type="file" accept=".pdf,.doc,.docx" onChange={handleCvFileChange} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="info-card full-width">
                        <MdDescription className="info-icon" />
                        <div style={{ width: '100%' }}>
                            <div className="info-label">Giấy xin phép thực tập</div>
                            <div className="file-actions">
                                {me?.permissionFile ? (
                                    <a href={me.permissionFile} target="_blank" rel="noopener noreferrer" className="file-link">
                                        <MdDownload /> Tải xuống
                                    </a>
                                ) : <span>Chưa tải lên</span>}
                                <label className="btn-upload-small">
                                    <MdUpload /> Tải lên
                                    <input id="permissionUpload" type="file" accept=".pdf,.doc,.docx" onChange={handlePermissionFileChange} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
                ))}
            </div>

            {/* Edit Modal - Đẹp hơn, 2 cột trên desktop */}
            {isEditing && (
                <Modal title="Chỉnh sửa hồ sơ" onClose={() => setIsEditing(false)}>
                    <div className="edit-form-grid">
                        <div className="form-group">
                            <label>Họ và tên</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Trường</label>
                            <input type="text" name="school" value={formData.school} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Ngành học</label>
                            <input type="text" name="major" value={formData.major} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Ngày sinh</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>GPA</label>
                            <input type="text" name="gpa" value={formData.gpa} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Giới tính</label>
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="">Chọn giới tính</option>
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
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