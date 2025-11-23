import hrApi from "../../api/hrApi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export const handleSaveAllowance = async (
  editingAllowance,
  formData,
  token,
  onSuccess
) => {
  try {
    if (editingAllowance) {
      // Update existing
      await Swal.fire({
        title: "Xác nhận cập nhật",
        text: "Bạn có chắc chắn muốn cập nhật trợ cấp này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Cập nhật",
        cancelButtonText: "Hủy",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await hrApi.updateAllowance(token, editingAllowance.allowanceId, formData);
          toast.success("Cập nhật trợ cấp thành công");
          onSuccess();

          // Show success alert
          await Swal.fire({
            title: "Thành công!",
            text: "Trợ cấp đã được cập nhật.",
            icon: "success",
            confirmButtonColor: "#3085d6",
          });
        }
      });
    } else {
      // Create new
      await Swal.fire({
        title: "Xác nhận thêm mới",
        text: "Bạn có chắc chắn muốn thêm trợ cấp này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Thêm mới",
        cancelButtonText: "Hủy",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await hrApi.createAllowance(token, formData);
          toast.success("Thêm trợ cấp thành công");
          onSuccess();

          // Show success alert
          await Swal.fire({
            title: "Thành công!",
            text: "Trợ cấp đã được thêm mới.",
            icon: "success",
            confirmButtonColor: "#3085d6",
          });
        }
      });
    }
  } catch (err) {
    console.error("Error saving allowance:", err);
    toast.error(err.response?.data?.message || "Lỗi khi lưu trợ cấp");
  }
};

export const handleDeleteAllowance = async (id, token, onSuccess) => {
  try {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa trợ cấp này? Hành động này không thể hoàn tác.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      await hrApi.deleteAllowance(token, id);
      toast.success("Xóa trợ cấp thành công");
      onSuccess();

      // Show success alert
      await Swal.fire({
        title: "Đã xóa!",
        text: "Trợ cấp đã được xóa.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    }
  } catch (err) {
    console.error("Error deleting allowance:", err);
    toast.error("Lỗi khi xóa trợ cấp");
  }
};
