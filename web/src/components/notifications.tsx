import { useSnackbar } from 'notistack';

export function useNotification() {
    const { enqueueSnackbar } = useSnackbar();

    const showNotification = (message: string, variant: 'default' | 'error' | 'success' | 'warning' | 'info' = 'default') => {
        enqueueSnackbar(message, { variant });
    };

    return { showNotification };
}