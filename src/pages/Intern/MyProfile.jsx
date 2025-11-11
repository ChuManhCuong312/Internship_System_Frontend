import React, { useContext, useEffect, useMemo, useState } from 'react';
import { MdEmail } from 'react-icons/md';
import InternSidebar from "../../components/Layout/InternSidebar";
import Modal from "../../components/Layout/Modal";
import { AuthContext } from "../../context/AuthContext";
import { InternsContext } from "../../context/InternsContext";
import "../../styles/profile.css";

export default function ProfilePage() {
    const useMock = true;

    const { user } = useContext(AuthContext);
    const { interns, loading, fetchInterns, editIntern } = useContext(InternsContext);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        school: '',
        major: '',
        address: '',
        dob: '',
        phoneNumber: '',
        gpa: '',
        cvLink: '',
        cvFile: ''
    });
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (useMock) return;
        if (!loading && interns.length === 0) {
            fetchInterns?.();
        }
    }, [useMock, loading, interns, fetchInterns]);

    const mockMe = useMemo(() => ({
        internId: 9999,
        fullName: 'Jane Doe',
        email: 'jane.doe@example.com',
        school: 'University of Technology',
        major: 'Software Engineering',
        status: 'ACTIVE',
        mentor: 'Mr. Mentor',
        createdAt: '2025-01-10',
        address: '123 Main St, City, Country',
        dob: '2002-05-12',
        phoneNumber: '+1 555 234 5678',
        gpa: '3.75',
        cvLink: 'https://example.com/jane-doe-cv',
        cvFile: '/files/jane-doe-cv.pdf'
    }), []);

    const me = useMemo(() => {
        if (useMock) return mockMe;
        if (!user?.email) return null;
        return interns.find(i => i.email === user.email) || null;
    }, [useMock, mockMe, interns, user]);

    useEffect(() => {
        if (me) {
            setFormData({
                fullName: me.fullName || '',
                school: me.school || '',
                major: me.major || '',
                address: me.address || '',
                dob: me.dob || '',
                phoneNumber: me.phoneNumber || '',
                gpa: me.gpa || '',
                cvLink: me.cvLink || '',
                cvFile: me.cvFile || ''
            });
        }
    }, [me]);

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
            } catch {}
        }
        const url = URL.createObjectURL(file);
        setAvatarPreview(url);
    };

    useEffect(() => {
        return () => {
            if (avatarPreview) {
                try {
                    URL.revokeObjectURL(avatarPreview);
                } catch {}
            }
        };
    }, [avatarPreview]);
    const handleSave = async () => {
        if (!me?.internId) return;
        await editIntern(me.internId, {
            ...me,
            fullName: formData.fullName,
            school: formData.school,
            major: formData.major,
            address: formData.address,
            dob: formData.dob,
            phoneNumber: formData.phoneNumber,
            gpa: formData.gpa,
            cvLink: formData.cvLink,
            cvFile: formData.cvFile
        });
        setIsEditing(false);
    };

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
                                    <span>{me?.major || 'Major'}</span>
                                    <span>•</span>
                                    <span>{me?.school || 'School'}</span>
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
                                <div className="label">Mentor</div>
                                <div className="value">{me?.mentor || '-'}</div>
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
                                <div className="label">CV (link)</div>
                                <div className="value">
                                    {me?.cvLink ? (
                                        <a href={me.cvLink} target="_blank" rel="noopener noreferrer">View CV</a>
                                    ) : '-'}
                                </div>
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
                            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>CV link (view)</label>
                            <input
                                type="url"
                                name="cvLink"
                                value={formData.cvLink}
                                onChange={handleChange}
                                placeholder="https://..."
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