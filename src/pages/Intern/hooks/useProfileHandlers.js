import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
    uploadAvatar,
    uploadCV,
    uploadPermissionFile,
    uploadUniversityConfirmationFile,
    partialUpdateIntern,
    createIntern
} from '../../../api/internApi';
import hrApi from '../../../api/hrApi';
import { showToast } from '../utils/toastHelper';
import { extractUserId } from '../utils/profileUtils';
import { validateInternProfile } from '../utils/profileValidation';

const UPLOAD_DELAY_MS = 800;

export const useProfileHandlers = (internData, setInternData, formData, setFormData, token, user, isCreating, setIsCreating, isEditing, setIsEditing) => {
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [errors, setErrors] = useState({});

    // Avatar handlers
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

        showToast("Đang tải lên ảnh đại diện...", "info");

        try {
            const res = await uploadAvatar(token, file, internData.internId);
            const url = res?.url || res?.secure_url || res?.avatar || res?.data?.url || res?.data?.secure_url;

            if (!url) throw new Error("Không nhận được URL ảnh");

            setInternData(prev => ({ ...prev, avatar: url }));
            setAvatarPreview(url);
            showToast("Cập nhật ảnh đại diện thành công!", "success");
        } catch (err) {
            console.error("Upload avatar error:", err);
            showToast(`Tải lên ảnh đại diện thất bại: ${err.message || 'Lỗi không xác định'}`, "error");
        }
    };

    // File upload handlers
    const handleFileUpload = async (file, uploadFn, fieldName, successMessage) => {
        if (!file || !internData?.internId || !token) return;

        showToast("Đang tải lên file...", "info");

        try {
            const res = await uploadFn(token, file, internData.internId);
            const url = res?.url || res?.secure_url || res?.[fieldName] || res?.file || res?.data?.url;

            if (url) {
                setInternData(prev => ({ ...prev, [fieldName]: url }));
                setFormData(prev => ({ ...prev, [fieldName]: url }));
                showToast(successMessage || "Tải lên file thành công!", "success");
            } else {
                showToast("Không thể lấy URL file sau khi tải lên", "error");
            }
        } catch (err) {
            console.error(`Upload ${fieldName} failed:`, err);
            showToast(`Tải lên ${fieldName} thất bại: ${err.message || 'Lỗi không xác định'}`, "error");
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

    // Form handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!token) return;

        // Validate form data
        const newErrors = validateInternProfile(formData, isCreating);
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Object.values(newErrors).forEach(msg => showToast(msg, "error"));
            return;
        }

        setErrors({});

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
                    major: formData.major || "Công nghệ thông tin",
                    address: formData.address || "Hà Nội",
                    dob: formData.dob,
                    gender: formData.gender || "FEMALE",
                };
                
                if (formData.gpa && !isNaN(parseFloat(formData.gpa))) {
                    createData.gpa = parseFloat(formData.gpa);
                }

                await createIntern(token, createData);
                showToast("Tạo hồ sơ thành công! Đang tải lại trang...", "success");
                
                // Reload the page after a short delay to show the success message
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                
            } else if (internData?.internId) {
                const updateData = {
                    school: formData.school,
                    major: formData.major,
                    address: formData.address,
                    dob: formData.dob,
                    phone: formData.phone,
                    gpa: parseFloat(formData.gpa),
                    gender: formData.gender
                };

                await hrApi.updateInternProfile(token, internData.internId, updateData);
                showToast("Cập nhật hồ sơ thành công! Đang tải lại trang...", "success");
                
                // Reload the page after a short delay to show the success message
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (err) {
            console.error("Error saving profile:", err);
            if (err.response?.status === 400) {
                let msg = err.response.data;
                if (typeof msg === "string") {
                    const match = msg.match(/interpolatedMessage='([^']+)'/);
                    if (match) msg = match[1];
                }
                showToast(msg || "Dữ liệu không hợp lệ", "error");
            } else if (err.response?.status === 500) {
                showToast(`Lỗi server: ${err.response.data || "Lỗi không xác định"}`, "error");
            } else {
                showToast(isCreating ? "Tạo hồ sơ thất bại" : "Cập nhật hồ sơ thất bại", "error");
            }
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (avatarPreview && avatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    return {
        avatarPreview,
        setAvatarPreview,
        handleAvatarClick,
        handleCvFileChange,
        handlePermissionFileChange,
        handleUniversityConfirmChange,
        handleChange,
        handleSave,
        errors,
        setErrors
    };
};
