import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const secret = process.env.SUPABASE_JWT_SECRET;

    if (!secret) {
      throw new UnauthorizedException('Secreto JWT no configurado');
    }

    try {
      const decoded = jwt.verify(token, secret) as any;

      // Puedes revisar campos específicos si quieres validar algo adicional
      if (!decoded.sub || !decoded.email) {
        throw new UnauthorizedException('Token inválido');
      }

      // Guardamos el usuario en la request para usarlo después
      request['user'] = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        ...decoded,
      };

      return true;
    } catch (err) {
      console.error('Error al verificar el token:', err.message);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}