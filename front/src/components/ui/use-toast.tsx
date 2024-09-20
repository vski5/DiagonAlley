import { toast as baseToast } from 'react-toastify';

export const toast = {
  info: (message: string) => baseToast.info(message),
  success: (message: string) => baseToast.success(message),
  warning: (message: string) => baseToast.warning(message),
  error: (message: string) => baseToast.error(message),
};