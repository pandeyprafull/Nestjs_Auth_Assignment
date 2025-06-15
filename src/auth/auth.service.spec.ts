import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  let mockUser;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);

    mockUser = {
      id: 1,
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
    };

    usersService = {
      findByEmail: jest.fn().mockResolvedValue(mockUser),
      create: jest
        .fn()
        .mockImplementation(
          (dto: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
          }) => ({
            ...dto,
            id: 1,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            role: 'user',
          }),
        ),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
    };

    authService = new AuthService(
      usersService as UsersService,
      jwtService as JwtService,
    );
  });

  describe('validateUser', () => {
    it('should return user without password if valid credentials', async () => {
      const result = await authService.validateUser(
        'test@example.com',
        'password123',
      );
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if invalid password', async () => {
      const result = await authService.validateUser(
        'test@example.com',
        'wrongpass',
      );
      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      const result = await authService.validateUser(
        'notfound@example.com',
        'password',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token and user details if login successful', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toHaveProperty('access_token', 'mock-token');
      expect(result.user.email).toEqual('test@example.com');
    });

    it('should throw UnauthorizedException if credentials invalid', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);
      await expect(
        authService.login({ email: 'x@example.com', password: 'bad' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should hash password and create user', async () => {
      const dto = {
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        password: 'pass1234',
      };

      const result = await authService.register(dto);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: dto.email }),
      );
      expect(result).not.toHaveProperty('password');
    });
  });
});
