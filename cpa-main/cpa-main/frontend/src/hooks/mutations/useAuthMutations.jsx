import { useMutation } from '@tanstack/react-query';
import { login } from '../../api/auth';
import { setToken, setIsAdmin, setUserEmail } from '../../api/tokenStore';

export const useLoginMutation = () => {
    return useMutation({
        mutationFn: ({ email, senha }) => login(email, senha),
        onSuccess: (data, variables) => {
            if (data.token) {
                setToken(data.token);
                setIsAdmin(data.user?.isAdmin);
                setUserEmail(variables.email);
            }
        },
    });
};
