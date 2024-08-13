import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AppAbility, CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { CHECK_POLICIES_KEY } from 'src/decorators/CheckPolicies';
import { PolicyHandler } from 'src/interfaces/policies';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
    private jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];
    console.log('Policy Handlers:', policyHandlers);
    const request = context.switchToHttp().getRequest();
    const token = request.cookies['token'];

    if (!token) {
      throw new ForbiddenException('No token provided');
    }

    const decoded = this.jwt.decode(token) as {
      role: string;
      user: number;
    }; // Ensure the type matches your JWT payload
    const userRole = decoded.role;
    const userId = decoded.user;
    const ability = this.caslAbilityFactory.createForUser({
      role: userRole,
      user: userId,
    });
    console.log('this is the user role', userRole);
    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
