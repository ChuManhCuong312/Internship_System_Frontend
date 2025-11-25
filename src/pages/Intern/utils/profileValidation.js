export const validateInternProfile = (formData) => {
    const errors = {};

    if (!formData.full_name?.trim()) {
        errors.full_name = "Họ tên bắt buộc";
    }

    if (!formData.gender) {
        errors.gender = "Giới tính bắt buộc";
    }

    if (!formData.dob) {
        errors.dob = "Ngày sinh bắt buộc";
    }

    if (!formData.major) {
        errors.major = "Ngành bắt buộc";
    }

    if (!formData.school) {
        errors.school = "Trường bắt buộc";
    }

    if (!formData.gpa || formData.gpa <= 0 || formData.gpa > 4) {
        errors.gpa = "GPA phải từ 0.01 đến 4";
    }

    if (!formData.phone) {
        errors.phone = "Số điện thoại bắt buộc";
    }

    if (!formData.address?.trim()) {
        errors.address = "Địa chỉ bắt buộc";
    }

    return errors;
};
