import React from 'react';

const InfoCard = ({ icon: Icon, label, value }) => (
    <div className="info-card">
        <Icon className="info-icon" />
        <div>
            <div className="info-label">{label}</div>
            <div className="info-value">{value || '-'}</div>
        </div>
    </div>
);

export default InfoCard;
