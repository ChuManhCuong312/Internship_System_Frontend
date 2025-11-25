import { useEffect, useState } from 'react';
import { getInternByUserId } from '../../../api/internApi';
import { extractUserId, mapInternResponse } from '../utils/profileUtils';
import { showCreateProfileDialog, showIncompleteProfileDialog } from '../utils/profileDialogs';
import { showToast } from '../utils/toastHelper';

const SWAL_DELAY_MS = 300;

export const useProfileData = (user, token, authLoading) => {
    const [internData, setInternData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
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
                            // Return flag to parent to show modal
                            return { showRequiredFilesModal: true };
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

    return {
        internData,
        setInternData,
        loading,
        isCreating,
        setIsCreating,
        formData,
        setFormData
    };
};
