import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' }),
      login: jest.fn().mockResolvedValue({ access_token: 'mock-token' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should register a user', async () => {
    const dto: CreateUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'secret',
    };

    const result = await controller.register(dto);
    expect(result).toHaveProperty('email', 'test@example.com');
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('should login a user', async () => {
    const dto: LoginDto = { email: 'john@example.com', password: 'secret' };

    const result = await controller.login(dto);
    expect(result).toHaveProperty('access_token', 'mock-token');
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('should return logout message', async () => {
    const req = { user: { id: 1 } };
    const result = await controller.logout(req);
    expect(result).toEqual({ message: 'Successfully logged out' });
  });
});
