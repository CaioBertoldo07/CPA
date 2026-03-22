import { useMutation } from '@tanstack/react-query';
import { login } from '../../api/auth';

export const useLoginMutation = () => {
    return useMutation({
        mutationFn: ({ email, senha }) => login(email, senha),
        onSuccess: (data, variables) => {
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('isAdmin', data.isAdmin);
                localStorage.setItem('userEmail', variables.email);
            }
        },
    });
};
