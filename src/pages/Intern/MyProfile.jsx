import React, { useContext, useEffect, useMemo, useState } from 'react';
import { MdEmail } from 'react-icons/md';
import { jwtDecode } from 'jwt-decode';
import InternSidebar from "../../components/Layout/InternSidebar";
import Modal from "../../components/Layout/Modal";
import { AuthContext } from "../../context/AuthContext";
import { getInternByUserId, partialUpdateIntern, uploadAvatar, uploadCV, uploadPermissionFile } from "../../api/internApi";
import "../../styles/profile.css";

export default function ProfilePage() {
    const { user, token, loading: authLoading, setUser } = useContext(AuthContext);
    const [internData, setInternData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        school: '',
        major: '',
        address: '',
        gender: '',
        dob: '',
        phoneNumber: '',
        gpa: '',
        cvFile: '',
        status: '',
        permissionFile: '',
    });
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Fetch intern data using userId - runs on every refresh/mount
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
            setError("Không thể xác định thông tin người dùng. Vui lòng đăng xuất và đăng nhập lại để cập nhật thông tin.");
            setLoading(false);
            return;
        }

        const fetchInternData = async () => {
            console.log("Fetching intern data for userId:", userId);
            
            try {
                setLoading(true);
                setError(null);
                
                // Always fetch fresh data on mount/refresh
                const data = await getInternByUserId(token, userId);
                
                console.log("API Response Data:", data);
                console.log("User data from context:", user);
                
                // Handle case where data might be null or undefined
                if (!data) {
                    console.warn("API returned null or undefined data");
                    setError("Không tìm thấy thông tin hồ sơ");
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
                    setError("Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.");
                } else if (err.response?.status === 404) {
                    setError("Không tìm thấy thông tin hồ sơ. Vui lòng kiểm tra lại thông tin đăng nhập.");
                } else if (err.response?.status === 401 || err.response?.status === 403) {
                    setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                } else {
                    setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại.");
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
        if (window.confirm("Bạn có muốn thay đổi ảnh đại diện không?")) {
            document.getElementById("avatarUpload").click();
        }
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
                    alert("Tải lên thành công nhưng không nhận được URL ảnh. Vui lòng thử lại.");
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
                alert(`Lỗi: ${errorMessage}`);
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
            } catch (err) {
                console.error("Error uploading CV file:", err);
                alert("Có lỗi xảy ra khi tải lên CV");
            }
        } else {
            alert("Không thể tải lên CV. Vui lòng thử lại sau.");
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
            } catch (err) {
                console.error("Error uploading permission file:", err);
                alert("Có lỗi xảy ra khi tải lên permission file");
            }
        } else {
            alert("Không thể tải lên permission file. Vui lòng thử lại sau.");
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
        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Có lỗi xảy ra khi cập nhật hồ sơ");
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

    if (error) {
        return (
            <div className="profile-page">
                <InternSidebar />
                <div className="profile-container">
                    <div className="profile-content">
                        <div className="profile-card">
                            <p style={{ color: 'red' }}>{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <InternSidebar />
            <div className="profile-container">
                <div className="profile-content">
                    <div className="profile-card">
                        <div className="profile-row">
                            <div className="avatar-wrap">
                                <div className="avatar status-dot" style={{ cursor: 'pointer' }} onClick={handleAvatarClick}>
                                    <div className="avatar-inner">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="avatar preview" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : me?.avatar ? (
                                            <img src={me.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            initials
                                        )}
                                    </div>
                                </div>
                                <input id="avatarUpload" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                            </div>

                            <div>
                                <div className="profile-name">{me?.fullName || 'Your Name'}</div>
                                <div className="profile-meta">

                                </div>
                                <div className="profile-email">
                                    <MdEmail size={16} />
                                    <span>{me?.email || user?.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="info-grid">
                            <div className="info-item">
                                <div className="label">Status</div>
                                <div className="value">{me?.status || 'N/A'}</div>
                            </div>
                            <div className="info-item">
                                <div className="label">Major</div>
                                <div className="value">{me?.major || '-'}</div>
                            </div>
                            <div className="info-item">
                                <div className="label">School</div>
                                <div className="value">{me?.school || '-'}</div>
                            </div>
                            <div className="info-item">
                                <div className="label">Phone</div>
                                <div className="value">{me?.phoneNumber || '-'}</div>
                            </div>
                            <div className="info-item">
                                <div className="label">Address</div>
                                <div className="value">{me?.address || '-'}</div>
                            </div>
                            <div className="info-item">
                                <div className="label">Date of Birth</div>
                                <div className="value">{me?.dob || '-'}</div>
                            </div>
                            <div className="info-item">
                                <div className="label">GPA</div>
                                <div className="value">{me?.gpa || '-'}</div>
                            </div>

                            <div className="info-item">
                                <div className="label">CV (file)</div>
                                <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {me?.cvFile ? (
                                        <a href={me.cvFile} download>Download CV</a>
                                    ) : '-'}
                                    <label htmlFor="cvUpload" className="btn btn-outline" style={{ margin: 0, padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>
                                        Upload
                                        <input id="cvUpload" type="file" accept=".pdf,.doc,.docx" onChange={handleCvFileChange} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="label">Gender</div>
                                <div className="value">{me?.gender || '-'}</div>
                            </div>
                            <div className="info-item">
                                <div className="label">Permission File</div>
                                <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {me?.permissionFile ? (
                                        <a href={me.permissionFile} download>Download Permission File</a>
                                    ) : '-'}
                                    <label htmlFor="permissionUpload" className="btn btn-outline" style={{ margin: 0, padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>
                                        Upload
                                        <input id="permissionUpload" type="file" accept=".pdf,.doc,.docx" onChange={handlePermissionFileChange} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isEditing && (
                <Modal title="Edit Profile" onClose={() => setIsEditing(false)}>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Full name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>School</label>
                            <input
                                type="text"
                                name="school"
                                value={formData.school}
                                onChange={handleChange}
                                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Major</label>
                            <input
                                type="text"
                                name="major"
                                value={formData.major}
                                onChange={handleChange}
                                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Phone number</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Date of birth</label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>GPA</label>
                            <input
                                type="text"
                                name="gpa"
                                value={formData.gpa}
                                onChange={handleChange}
                                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>CV file path (download URL)</label>
                            <input
                                type="text"
                                name="cvFile"
                                value={formData.cvFile}
                                onChange={handleChange}
                                placeholder="/files/your-cv.pdf"
                                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                            >
                                <option value="">Select gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                            >
                                <option value="">Select status</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Permission File path (download URL)</label>
                            <input
                                type="text"
                                name="permissionFile"
                                value={formData.permissionFile}
                                onChange={handleChange}
                                placeholder="/files/permission-file.pdf"
                                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                            <button onClick={() => setIsEditing(false)} className="btn btn-outline">Cancel</button>
                            <button onClick={handleSave} className="btn btn-primary">Save</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}