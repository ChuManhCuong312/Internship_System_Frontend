import React from 'react';
import { MdSchool, MdTrendingUp, MdLocationOn, MdCalendarToday, MdPerson } from 'react-icons/md';
import InfoCard from './InfoCard';
import FileUploadCard from './FileUploadCard';

const ProfileGrid = ({ internData, onCvFileChange, onPermissionFileChange, onUniversityConfirmChange }) => (
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
            onFileChange={onCvFileChange}
        />

        <FileUploadCard
            label="Giấy xin phép thực tập"
            fileUrl={internData?.permissionFile}
            downloadText="Tải xuống giấy xin phép thực tập"
            onFileChange={onPermissionFileChange}
        />

        <FileUploadCard
            label="Giấy xác nhận của trường"
            fileUrl={internData?.universityConfirm}
            downloadText="Tải xuống giấy xác nhận của trường"
            onFileChange={onUniversityConfirmChange}
        />
    </div>
);

export default ProfileGrid;
