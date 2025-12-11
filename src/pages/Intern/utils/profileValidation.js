export const validateInternProfile = (formData, isCreating = false) => {
    const errors = {};

    if (!formData.dob) {
        errors.dob = "Ngày sinh bắt buộc";
    }

    if (!formData.major?.trim()) {
        errors.major = "Ngành bắt buộc";
    }

    if (!formData.school?.trim()) {
        errors.school = "Trường bắt buộc";
    }

    if (!formData.address?.trim()) {
        errors.address = "Địa chỉ bắt buộc";
    }

    if (!formData.gender) {
        errors.gender = "Giới tính bắt buộc";
    }

    // Only validate GPA if provided
    if (formData.gpa && (formData.gpa <= 0 || formData.gpa > 4)) {
        errors.gpa = "GPA phải từ 0.01 đến 4";
    }

    // Only validate phone and full_name when editing (not creating)
    if (!isCreating) {
        if (!formData.full_name?.trim()) {
            errors.full_name = "Họ tên bắt buộc";
        }

        if (!formData.phone?.trim()) {
            errors.phone = "Số điện thoại bắt buộc";
        }
    }

    return errors;
};
