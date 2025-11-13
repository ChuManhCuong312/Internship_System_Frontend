import React, { useContext, useEffect, useMemo, useState } from 'react';
import { MdEmail } from 'react-icons/md';
import InternSidebar from "../../components/Layout/InternSidebar";
import Modal from "../../components/Layout/Modal";
import { AuthContext } from "../../context/AuthContext";
import { getInternByUserId, updateIntern } from "../../api/internApi";
import "../../styles/profile.css";

export default function ProfilePage() {
    const { user, token } = useContext(AuthContext);
    const [internData, setInternData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        school: '',
        major: '',
        address: '',
        dob: '',
        phoneNumber: '',
        gpa: '',
        cvFile: ''
    });
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Fetch intern data using userId
    useEffect(() => {
        const fetchInternData = async () => {
            if (!user?.userId || !token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const data = await getInternByUserId(token, user.userId);
                
                // Map API response fields to component format
                const mappedData = {
                    internId: data.internId,
                    userId: data.userId,
                    fullName: user.fullName || data.fullName || '',
                    email: user.email,
                    school: data.school || '',
                    major: data.major || '',
                    address: data.address || '',
                    dob: data.dob || '',
                    phoneNumber: data.phoneNumber || '',
                    gpa: data.gpa || '',
                    cvFile: data.cvPath || '', // Map cvPath to cvFile
                    status: data.status || '',
                    gender: data.gender || '',
                    avatar: data.avatar || '',
                    permissionFile: data.permissionFile || ''
                };
                
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
                    cvFile: mappedData.cvFile
                });
            } catch (err) {
                console.error("Error fetching intern data:", err);
                setError("Không thể tải thông tin hồ sơ");
            } finally {
                setLoading(false);
            }
        };

        fetchInternData();
    }, [user?.userId, token]);

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

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (avatarPreview) {
            try {
                URL.revokeObjectURL(avatarPreview);
            } catch { }
        }
        const url = URL.createObjectURL(file);
        setAvatarPreview(url);
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
                cvPath: formData.cvFile // Map cvFile back to cvPath
            };
            
            const updated = await updateIntern(token, me.internId, updateData);
            
            // Update local state with response
            setInternData(prev => ({
                ...prev,
                ...updated,
                cvFile: updated.cvPath || prev.cvFile
            }));
            
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Có lỗi xảy ra khi cập nhật hồ sơ");
        }
    };

    if (loading) {
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
                                <div className="avatar status-dot">
                                    <div className="avatar-inner">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="avatar preview" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            initials
                                        )}
                                    </div>
                                </div>
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

                            <div className="profile-actions">
                                <label htmlFor="avatarUpload" className="btn btn-outline">
                                    Upload
                                    <input id="avatarUpload" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                                </label>
                                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit</button>
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
                                <div className="value">
                                    {me?.cvFile ? (
                                        <a href={me.cvFile} download>Download CV</a>
                                    ) : '-'}
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