import { UserResponseDTO } from '../../dtos/AuthDTO';

declare global {
    namespace Express {
        interface Request {
            user?: UserResponseDTO;
        }
    }
}
