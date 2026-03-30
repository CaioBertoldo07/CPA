import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../api/auth';

export const useGetCurrentUserQuery = () => {
    return useQuery({
        queryKey: ['auth', 'me'],
        queryFn: getCurrentUser,
        retry: false,
        staleTime: 30 * 1000,
    });
};
