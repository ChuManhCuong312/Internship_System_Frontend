import React, { useContext, useEffect, useMemo, useState } from 'react';
import InternSidebar from "../../components/Layout/InternSidebar";
import ProfileModal from "../HR/ManageInterns/modals/ProfileModal";
import AddProfileModal from "../HR/ManageInterns/modals/AddProfileModal";
import RequiredFilesModal from "../HR/ManageInterns/modals/RequiredFilesModal";
import { AuthContext } from "../../context/AuthContext";
import { useProfileData } from './hooks/useProfileData';
import { useProfileHandlers } from './hooks/useProfileHandlers';
import ProfileHeader from './components/ProfileHeader';
import ProfileGrid from './components/ProfileGrid';
import { showToast } from './utils/toastHelper';
import { showCreateProfileDialog, showIncompleteProfileDialog } from './utils/profileDialogs';
import { mapInternResponse, extractUserId } from './utils/profileUtils';
import { getInternByUserId } from '../../api/internApi';
import "../../styles/profile.css";
import "../../styles/swal.css";

const SWAL_DELAY_MS = 300;

// ====================== MAIN COMPONENT ======================
export default function ProfilePage() {
    const { user, token, loading: authLoading } = useContext(AuthContext);
    const userStatus = user?.userStatus || null;
    const internStatus = user?.internStatus || null;
    const internConfirmStatus = user?.internConfirmStatus || null;

    const isProfileLocked =
      userStatus === "REJECTED" &&
      internStatus === "APPROVED" &&
      internConfirmStatus === "Approved";

    const [internData, setInternData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showRequiredFilesModal, setShowRequiredFilesModal] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        school: 'CMC University',
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

    // ====================== HANDLERS ======================
    const {
        avatarPreview,
        handleAvatarClick,
        handleCvFileChange,
        handlePermissionFileChange,
        handleUniversityConfirmChange,
        handleChange,
        handleSave,
        errors
    } = useProfileHandlers(
        internData,
        setInternData,
        formData,
        setFormData,
        token,
        user,
        isCreating,
        setIsCreating,
        isEditing,
        setIsEditing
    );

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
                    <ProfileHeader
                      internData={internData}
                      user={user}
                      initials={initials}
                      avatarPreview={avatarPreview}
                      onAvatarClick={handleAvatarClick}
                      onEditClick={() => setIsEditing(true)}
                      isProfileLocked={isProfileLocked}
                    />

                    <ProfileGrid
                      internData={internData}
                      onCvFileChange={handleCvFileChange}
                      onPermissionFileChange={handlePermissionFileChange}
                      onUniversityConfirmChange={handleUniversityConfirmChange}
                      isProfileLocked={isProfileLocked}
                    />
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
                    errors={errors}
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