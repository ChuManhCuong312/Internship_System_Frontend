import React from 'react';
import { MdEmail, MdEdit, MdPhone } from 'react-icons/md';

const ProfileHeader = ({ internData, user, initials, avatarPreview, onAvatarClick, onEditClick }) => (
    <div className="profile-header-card">
        <div className="profile-avatar-large" onClick={onAvatarClick}>
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

        <button className="btn-edit-profile" onClick={onEditClick}>
            <MdEdit /> Chỉnh sửa hồ sơ
        </button>
    </div>
);

export default ProfileHeader;
