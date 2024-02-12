import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class MockJwtAuthGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // モック用にすべてに認証を許可
    return true;
  }
}
