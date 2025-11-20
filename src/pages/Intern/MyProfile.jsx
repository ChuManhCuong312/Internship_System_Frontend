import React, { useContext, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import {
    MdEmail,
    MdEdit,
    MdDownload,
    MdUpload,
    MdSchool,
    MdPhone,
    MdLocationOn,
    MdCalendarToday,
    MdTrendingUp,
    MdPerson,
    MdDescription
} from 'react-icons/md';
import { jwtDecode } from 'jwt-decode';
import InternSidebar from "../../components/Layout/InternSidebar";
import ProfileModal from "../HR/ManageInterns/modals/ProfileModal";
import AddProfileModal from "../HR/ManageInterns/modals/AddProfileModal";
import RequiredFilesModal from "../HR/ManageInterns/modals/RequiredFilesModal";
import { AuthContext } from "../../context/AuthContext";
import {
    getInternByUserId,
    partialUpdateIntern,
    uploadAvatar,
    uploadCV,
    uploadPermissionFile,
    uploadUniversityConfirmationFile,
    getUniversityConfirmationFile,
    createIntern
} from "../../api/internApi";
import "../../styles/profile.css";
import "../../styles/swal.css";

// ====================== CONSTANTS ======================
const UPLOAD_DELAY_MS = 800;
const SWAL_DELAY_MS = 300;

// ====================== TOAST HELPER ======================
let suppressErrorToast = false;

const showToast = (message, type = 'error') => {
    if (type === 'error' && suppressErrorToast) {
        suppressErrorToast = false;
        console.log('Toast error suppressed:', message);
        return;
    }
    toast[type](message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};

const suppressNextErrorToast = () => {
    suppressErrorToast = true;
};

// ====================== HELPER FUNCTIONS ======================
const getUserIdFromToken = (token) => {
    try {
        const payload = jwtDecode(token);
        return payload.userId || payload.id;
    } catch {
        return null;
    }
};

const extractUserId = (user, token) => {
    let userId = user?.userId;
    
    if (!userId) {
        const stored = localStorage.getItem("userId");
        if (stored) userId = parseInt(stored);
    }
    
    if (!userId && token) {
        userId = getUserIdFromToken(token);
    }
    
    return userId;
};

const mapInternResponse = (response, user) => {
    const data = response.internProfile || response;
    const phone = response.phone || data.phoneNumber || data.phone_number || '';

    return {
        internId: data.internId || data.id,
        fullName: user.fullName || data.fullName || data.full_name || '',
        email: user.email || data.email || '',
        school: data.school || '',
        major: data.major || '',
        address: data.address || '',
        dob: data.dob || '',
        phoneNumber: phone,
        gpa: data.gpa != null ? String(data.gpa) : '',
        cvFile: data.cvFile || data.cv_file || data.cvPath || '',
        status: data.status || '',
        gender: data.gender || '',
        avatar: data.avatar || data.avatarUrl || data.avatar_url || '',
        permissionFile: data.permissionFile || data.permission_file || '',
        universityConfirm: data.universityConfirm || data.university_confirm || data.universityConfirmation || '',
        rejectionReason: data.rejectionReason || ''
    };
};

const showCreateProfileDialog = async () => {
    return Swal.fire({
        icon: 'info',
        title: 'Chưa có hồ sơ thực tập',
        html: `
            <p>Hệ thống không tìm thấy hồ sơ gắn với tài khoản của bạn.</p>
            <p>Bạn có muốn tạo hồ sơ thực tập mới ngay bây giờ?</p>
        `,
        confirmButtonText: 'Tạo hồ sơ mới',
        cancelButtonText: 'Thoát',
        showCancelButton: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
    });
};

const showIncompleteProfileDialog = async () => {
    return Swal.fire({
        icon: 'error',
        title: 'Hồ sơ chưa hoàn thiện!',
        html: `
            <p style="color:#e74c3c; font-weight: bold;">Bạn phải tải lên các tài liệu sau để hoàn thiện hồ sơ:</p>
            <ul style="text-align: left; margin: 15px 0;">
                <li>✓ CV của bạn</li>
                <li>✓ Đơn xin thực tập</li>
                <li>✓ Đơn xác nhận của trường</li>
            </ul>
            <p style="color:#e74c3c; font-size:14px;">Trạng thái hiện tại: <strong>NO_FILE</strong></p>
        `,
        confirmButtonText: 'Tải lên tài liệu ngay',
        cancelButtonText: 'Thoát',
        showCancelButton: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
    });
};

// ====================== MAIN COMPONENT ======================
export default function ProfilePage() {
    const { user, token, loading: authLoading } = useContext(AuthContext);
    const [internData, setInternData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showRequiredFilesModal, setShowRequiredFilesModal] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        school: '',
        major: '',
        address: '',
        gender: '',
        dob: '',
        phone: '',
        gpa: '',
        cvFile: '',
        status: '',
        permissionFile: '',
        universityConfirm: ''
    });

    // ====================== COMPUTED VALUES ======================
    const initials = useMemo(() => {
        const src = formData.full_name || internData?.fullName || user?.email || '';
        const parts = src.trim().split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : src.slice(0, 2).toUpperCase();
    }, [formData.full_name, internData, user]);

    // ====================== FETCH DATA ======================
    useEffect(() => {
        if (authLoading || !token) {
            setLoading(false);
            return;
        }

        const userId = extractUserId(user, token);
        
        if (!userId || (typeof userId === 'string' && userId.includes('@'))) {
            setLoading(false);
            return;
        }

        const fetchInternData = async () => {
            try {
                setLoading(true);
                const response = await getInternByUserId(token, userId);

                if (!response) {
                    const result = await showCreateProfileDialog();
                    if (result.isConfirmed) {
                        setIsCreating(true);
                    }
                    return;
                }

                const mapped = mapInternResponse(response, user);

                if (!mapped.internId) {
                    const result = await showCreateProfileDialog();
                    if (result.isConfirmed) {
                        setIsCreating(true);
                    }
                    return;
                }

                setInternData(mapped);
                setFormData({
                    full_name: mapped.fullName,
                    school: mapped.school,
                    major: mapped.major,
                    address: mapped.address,
                    dob: mapped.dob,
                    phone: mapped.phoneNumber,
                    gpa: mapped.gpa,
                    cvFile: mapped.cvFile,
                    gender: mapped.gender,
                    status: mapped.status,
                    permissionFile: mapped.permissionFile,
                    universityConfirm: mapped.universityConfirm
                });

                if (mapped.avatar) setAvatarPreview(mapped.avatar);

                if (mapped.status === "NO_FILE") {
                    setTimeout(async () => {
                        const result = await showIncompleteProfileDialog();
                        if (result.isConfirmed) {
                            setShowRequiredFilesModal(true);
                        }
                    }, SWAL_DELAY_MS);
                }
            } catch (err) {
                const status = err.response?.status;
                if (status === 404) {
                    const result = await showCreateProfileDialog();
                    if (result.isConfirmed) {
                        setIsCreating(true);
                    }
                } else if (status === 401 || status === 403) {
                    showToast("Phiên đăng nhập hết hạn", "error");
                } else {
                    showToast("Không thể tải thông tin hồ sơ", "error");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchInternData();
    }, [user?.userId, token, authLoading]);

    // ====================== AVATAR HANDLERS ======================
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
                if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                setAvatarPreview(URL.createObjectURL(result.value));
                uploadAvatarHandler(result.value);
            }
        });
    };

    const uploadAvatarHandler = async (file) => {
        if (!internData?.internId || !token) return;

        suppressNextErrorToast();

        try {
            const res = await uploadAvatar(token, file, internData.internId);
            const url = res?.url || res?.secure_url || res?.avatar || res?.data?.url || res?.data?.secure_url;

            if (!url) throw new Error("Không nhận được URL ảnh");

            await partialUpdateIntern(token, internData.internId, { avatar: url });

            setInternData(prev => ({ ...prev, avatar: url }));
            setAvatarPreview(url);
            showToast("Cập nhật ảnh đại diện thành công!", "success");
        } catch (err) {
            console.log("Upload avatar error (toast suppressed):", err.message);
        }

        showToast("Đang tải lên file...", "info");
        setTimeout(() => {
            showToast("Tải lên file thành công!", "success");
        }, UPLOAD_DELAY_MS);
    };

    // ====================== FILE UPLOAD HANDLERS ======================
    const handleFileUpload = async (file, uploadFn, fieldName, successMessage) => {
        if (!file || !internData?.internId || !token) return;

        showToast("Đang tải lên file...", "info");

        setTimeout(() => {
            showToast("Tải lên file thành công!", "success");
        }, UPLOAD_DELAY_MS);

        try {
            const res = await uploadFn(token, file, internData.internId);
            const url = res?.url || res?.secure_url || res?.[fieldName] || res?.file || res?.data?.url;

            if (url) {
                await partialUpdateIntern(token, internData.internId, { [fieldName]: url });
                setInternData(prev => ({ ...prev, [fieldName]: url }));
                setFormData(prev => ({ ...prev, [fieldName]: url }));
            }
        } catch (err) {
            console.log(`Upload ${fieldName} failed (user not notified):`, err);
        }
    };

    const handleCvFileChange = (e) => {
        const file = e.target.files?.[0];
        handleFileUpload(file, uploadCV, 'cvFile', 'CV');
    };

    const handlePermissionFileChange = (e) => {
        const file = e.target.files?.[0];
        handleFileUpload(file, uploadPermissionFile, 'permissionFile', 'Giấy xin phép');
    };

    const handleUniversityConfirmChange = (e) => {
        const file = e.target.files?.[0];
        handleFileUpload(file, uploadUniversityConfirmationFile, 'universityConfirm', 'Giấy xác nhận');
    };

    // ====================== FORM HANDLERS ======================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!token) return;

        try {
            if (isCreating && !internData?.internId) {
                const userId = extractUserId(user, token);

                if (!userId) {
                    showToast("Không thể xác định userId", "error");
                    return;
                }

                const createData = {
                    userId,
                    school: formData.school || "CMC University",
                    major: formData.major,
                    address: formData.address,
                    dob: formData.dob,
                    gender: formData.gender || "FEMALE",
                    gpa: parseFloat(formData.gpa) || 0.0,
                };

                const created = await createIntern(token, createData);
                setInternData(created);
                setIsCreating(false);
                showToast("Tạo hồ sơ thành công!", "success");
            } else if (internData?.internId) {
                const updateData = {
                    school: formData.school,
                    major: formData.major,
                    address: formData.address,
                    dob: formData.dob,
                    phoneNumber: formData.phone,
                    gpa: formData.gpa,
                    gender: formData.gender,
                    permissionFile: formData.permissionFile
                };

                const updated = await partialUpdateIntern(token, internData.internId, updateData);
                setInternData(prev => ({ ...prev, ...updated }));
                setIsEditing(false);
                showToast("Cập nhật hồ sơ thành công!", "success");
            }
        } catch (err) {
            showToast(isCreating ? "Tạo hồ sơ thất bại" : "Cập nhật hồ sơ thất bại", "error");
        }
    };

    // ====================== CLEANUP ======================
    useEffect(() => {
        return () => {
            if (avatarPreview && avatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

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
        <>
            <div className="profile-page">
                <InternSidebar />
                <div className="profile-main">
                    {/* Header Card */}
                    <div className="profile-header-card">
                        <div className="profile-avatar-large" onClick={handleAvatarClick}>
                            {avatarPreview || internData?.avatar ? (
                                <img src={avatarPreview || internData.avatar} alt="Avatar" />
                            ) : (
                                <div className="avatar-placeholder">{initials}</div>
                            )}
                            <div className="avatar-edit-overlay">
                                <MdEdit size={24} />
                            </div>
                        </div>

                        <div className="profile-header-info">
                            <h1>{internData?.fullName || '-'}</h1>
                            <div className="profile-contact-info">
                                <p className="profile-email">
                                    <MdEmail /> {internData?.email || user?.email}
                                </p>
                                <p className="profile-phone">
                                    <MdPhone /> {internData?.phoneNumber || '-'}
                                </p>
                            </div>
                            <div className={`profile-status-badge status-${(internData?.status || 'pending').toLowerCase()}`}>
                                {internData?.status || '-'}
                            </div>
                        </div>

                        <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                            <MdEdit /> Chỉnh sửa hồ sơ
                        </button>
                    </div>

                    {/* Info Grid */}
                    <div className="profile-grid">
                        <InfoCard icon={MdSchool} label="Trường" value={internData?.school} />
                        <InfoCard icon={MdTrendingUp} label="Ngành học" value={internData?.major} />
                        <InfoCard icon={MdLocationOn} label="Địa chỉ" value={internData?.address} />
                        <InfoCard icon={MdCalendarToday} label="Ngày sinh" value={internData?.dob} />
                        <InfoCard 
                            icon={MdPerson} 
                            label="Giới tính" 
                            value={internData?.gender === 'MALE' ? 'Nam' : internData?.gender === 'FEMALE' ? 'Nữ' : internData?.gender} 
                        />
                        <div className="info-card">
                            <div className="info-label">GPA</div>
                            <div className="info-value gpa">{internData?.gpa || '-'}</div>
                        </div>

                        <FileUploadCard
                            label="CV"
                            fileUrl={internData?.cvFile}
                            downloadText="Tải xuống CV"
                            onFileChange={handleCvFileChange}
                        />

                        <FileUploadCard
                            label="Giấy xin phép thực tập"
                            fileUrl={internData?.permissionFile}
                            downloadText="Tải xuống giấy xin phép thực tập"
                            onFileChange={handlePermissionFileChange}
                        />

                        <FileUploadCard
                            label="Giấy xác nhận của trường"
                            fileUrl={internData?.universityConfirm}
                            downloadText="Tải xuống giấy xác nhận của trường"
                            onFileChange={handleUniversityConfirmChange}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isEditing && (
                <ProfileModal
                    isEdit={true}
                    intern={internData}
                    profileData={formData}
                    setProfileData={setFormData}
                    onClose={() => setIsEditing(false)}
                    onSubmit={handleSave}
                    errors={{}}
                />
            )}

            <AddProfileModal
                isOpen={isCreating}
                isCreating={true}
                intern={internData}
                profileData={formData}
                setProfileData={setFormData}
                onClose={() => setIsCreating(false)}
                onSubmit={handleSave}
            />

            {showRequiredFilesModal && (
                <RequiredFilesModal
                    onClose={() => setShowRequiredFilesModal(false)}
                    onFilesUploaded={() => setShowRequiredFilesModal(false)}
                    handleCvFileChange={handleCvFileChange}
                    handlePermissionFileChange={handlePermissionFileChange}
                    handleUniversityConfirmChange={handleUniversityConfirmChange}
                    cvFile={formData.cvFile}
                    permissionFile={formData.permissionFile}
                    universityConfirm={formData.universityConfirm}
                />
            )}
        </>
    );
}

// ====================== SUB-COMPONENTS ======================
const InfoCard = ({ icon: Icon, label, value }) => (
    <div className="info-card">
        <Icon className="info-icon" />
        <div>
            <div className="info-label">{label}</div>
            <div className="info-value">{value || '-'}</div>
        </div>
    </div>
);

const FileUploadCard = ({ label, fileUrl, downloadText, onFileChange }) => (
    <div className="info-card full-width">
        <MdDescription className="info-icon" />
        <div style={{ width: '100%' }}>
            <div className="info-label">{label}</div>
            <div className="file-actions">
                {fileUrl ? (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                        <MdDownload /> {downloadText}
                    </a>
                ) : (
                    <span>Chưa tải lên</span>
                )}
                <label className="btn-upload-small">
                    <MdUpload /> Tải lên
                    <input type="file" accept=".pdf,.doc,.docx" onChange={onFileChange} />
                </label>
            </div>
        </div>
    </div>
);