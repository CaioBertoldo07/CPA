import { useQuery } from '@tanstack/react-query';
import { getAdmins } from '../../api/admin';

export const useGetAdminsQuery = () => {
    return useQuery({
        queryKey: ['admins'],
        queryFn: getAdmins,
    });
};
