import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route as public (no authentication required)
 * Usage: @Public() on controller methods or classes
 * 
 * Example:
 * @Controller('auth')
 * export class AuthController {
 *   @Public()
 *   @Post('login')
 *   login() { ... }
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

