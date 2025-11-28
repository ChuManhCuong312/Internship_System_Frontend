import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Lấy tất cả support requests
export const getAllSupportRequests = async (token) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/support-requests`,
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
        const response = await axios.get(
            `${API_BASE_URL}/api/support-requests/${id}`,
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
        if (filters.internId) params.append('internId', filters.internId);

        const response = await axios.get(
            `${API_BASE_URL}/api/support-requests/filter?${params.toString()}`,
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
        let url = `${API_BASE_URL}/api/support-requests/${id}/approve?hrId=${hrId}`;
        if (responseText) {
            url += `&response=${encodeURIComponent(responseText)}`;
        }
        const response = await axios.put(
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
        const response = await axios.put(
            `${API_BASE_URL}/api/support-requests/${id}/reject?hrId=${hrId}&response=${encodeURIComponent(responseText)}`,
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
        const response = await axios.get(
            `${API_BASE_URL}/api/support-requests/${id}/history`,
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
        const response = await axios.post(
            `${API_BASE_URL}/api/support-requests?internId=${internId}`,
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
        const response = await axios.get(
            `${API_BASE_URL}/api/support-requests/my-requests?internId=${internId}`,
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
