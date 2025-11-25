import { jwtDecode } from 'jwt-decode';

export const getUserIdFromToken = (token) => {
    try {
        const payload = jwtDecode(token);
        return payload.userId || payload.id;
    } catch {
        return null;
    }
};

export const extractUserId = (user, token) => {
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

export const mapInternResponse = (response, user) => {
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
