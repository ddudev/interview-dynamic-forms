import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract the authenticated user from the request
 * Usage: @CurrentUser() user: User
 * 
 * Example:
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 * 
 * TODO: This will work once authentication is implemented and req.user is set
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // TODO: Return request.user once authentication is implemented
    // return request.user;
    return null;
  },
);

