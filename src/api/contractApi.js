// src/api/contractApi.js

import axios from "axios";

// Đổi BASE_URL cho phù hợp với môi trường backend của bạn
const API_BASE_URL = "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Hàm lấy hợp đồng của Intern theo Intern ID
 * Backend endpoint: GET /api/contracts/intern/{internId}
 * Lưu ý: Backend hiện đang trả về MỘT ContractDocument. 
 * Tôi sẽ giả lập rằng endpoint này trả về một mảng chứa một hợp đồng duy nhất, 
 * hoặc bạn có thể cần điều chỉnh logic backend để trả về danh sách nếu cần.
 */
export const getInternContracts = async (token, internId) => {
  try {
    const response = await axios.get(`/api/contracts/intern/${internId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        
      },
    });
    console.log("DT: ",response.data);
    // Giả định trả về một mảng chứa hợp đồng (để tương thích với ContractList)
    if (response.data) {
        // Nếu backend trả về 200 OK nhưng nội dung rỗng/null, trả về mảng rỗng
        return Array.isArray(response.data) ? response.data : [response.data];
    }
    return [];

  } catch (error) {
    console.error("Error fetching intern contract:", error);
    return []; // Trả về mảng rỗng khi có lỗi
  }
};

/**
 * Hàm xác nhận hợp đồng (Chuyển trạng thái xác nhận sang APPROVED)
 * Backend endpoint: PATCH /api/contracts/{id}/confirm-status
 */
export const confirmContractApi = async (token, contractId) => {
  try {
    const response = await axiosInstance.patch(
      `/contracts/${contractId}/confirm-status?status=APPROVED`,
      {}, // Body rỗng
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Backend trả về message và contract đã cập nhật
    return response.data;
  } catch (error) {
    console.error("Error confirming contract:", error);
    throw error;
  }
};