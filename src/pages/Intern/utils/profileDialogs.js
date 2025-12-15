import Swal from 'sweetalert2';

export const showCreateProfileDialog = async () => {
    return Swal.fire({
        icon: 'info',
        title: 'Chưa có hồ sơ thực tập',
        html: `
            <p>Hệ thống không tìm thấy hồ sơ gắn với tài khoản của bạn.</p>
            <p>Bạn có muốn tạo hồ sơ thực tập mới ngay bây giờ?</p>
        `,
        confirmButtonText: 'Tạo hồ sơ mới',
        cancelButtonText: 'Thoát',
        showCancelButton: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
    });
};

export const showIncompleteProfileDialog = async () => {
    return Swal.fire({
        icon: 'info',
        title: 'Hoàn thiện hồ sơ',
        html: `
            <p>Vui lòng tải lên các tài liệu sau để hoàn thiện hồ sơ:</p>
            <ul style="text-align: left; margin: 15px 0;">
                <li>✓ CV của bạn</li>
                <li>✓ Đơn xin thực tập</li>
                <li>✓ Đơn xác nhận của trường</li>
            </ul>
        `,
        confirmButtonText: 'Tải lên tài liệu',
        cancelButtonText: 'Để sau',
        showCancelButton: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
    });
};
