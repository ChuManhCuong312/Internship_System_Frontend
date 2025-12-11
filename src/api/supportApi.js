import axiosClient from './axiosClient';

// Lấy tất cả support requests
export const getAllSupportRequests = async (token) => {
    try {
        const response = await axiosClient.get(
            `/support-requests`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Lấy chi tiết support request
export const getSupportRequestById = async (token, id) => {
    try {
        const response = await axiosClient.get(
            `/support-requests/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Lọc support requests
export const filterSupportRequests = async (token, filters) => {
    try {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.type) params.append('type', filters.type);
        if (filters.keyword) params.append('keyword', filters.keyword);
        if (filters.size) params.append('size', filters.size);
        if (filters.page) params.append('page', filters.page);

        console.log(params)
        const response = await axiosClient.get(
            `/support-requests/filter?${params.toString()}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Duyệt support request
export const approveSupportRequest = async (token, id, hrId, responseText) => {
    try {
        let url = `/support-requests/${id}/approve?hrId=${hrId}`;
        if (responseText) {
            url += `&response=${encodeURIComponent(responseText)}`;
        }
        const response = await axiosClient.put(
            url,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Từ chối support request
export const rejectSupportRequest = async (token, id, hrId, responseText) => {
    try {
        const response = await axiosClient.put(
            `/support-requests/${id}/reject?hrId=${hrId}&response=${encodeURIComponent(responseText)}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const handleRequestStatus = async (token, id, hrId, status) => {
    try {
        const response = await axiosClient.put(
            `/support-requests/${id}/update-status?hrId=${hrId}&status=${status}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Lấy lịch sử thay đổi status
export const getSupportRequestHistory = async (token, id) => {
    try {
        const response = await axiosClient.get(
            `/support-requests/${id}/history`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Tạo support request mới (cho intern)
export const createSupportRequest = async (token, internId, data) => {
    try {
        const response = await axiosClient.post(
            `/support-requests?internId=${internId}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Lấy support requests của intern
export const getMySupportRequests = async (token, internId) => {
    try {
        const response = await axiosClient.get(
            `/support-requests/my-requests?internId=${internId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
