import { toast } from 'react-toastify';

let suppressErrorToast = false;

export const showToast = (message, type = 'error') => {
    if (type === 'error' && suppressErrorToast) {
        suppressErrorToast = false;
        console.log('Toast error suppressed:', message);
        return;
    }
    toast[type](message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};

export const suppressNextErrorToast = () => {
    suppressErrorToast = true;
};
