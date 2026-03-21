import { UserResponseDTO } from '../../dtos/AuthDTO';

declare module 'express-serve-static-core' {
    interface Request {
        user?: UserResponseDTO & { role?: string };
    }
}
