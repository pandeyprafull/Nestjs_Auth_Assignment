import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  const mockUsers: User[] = [
    {
      id: '1',
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: '',
    } as unknown as User,
  ];

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockResolvedValue(mockUsers[0]),
    find: jest.fn().mockResolvedValue(mockUsers),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should return all users', async () => {
    const users = await service.findAll();
    expect(users).toEqual(mockUsers);
    expect(repo.find).toHaveBeenCalled();
  });

  it('should return one user if found', async () => {
    mockRepository.findOne.mockResolvedValue(mockUsers[0]);
    const user = await service.findOne('1');
    expect(user).toEqual(mockUsers[0]);
  });

  it('should throw NotFoundException if user not found', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    await expect(service.findOne('2')).rejects.toThrow(NotFoundException);
  });

  it('should update and return user', async () => {
    mockRepository.findOne.mockResolvedValue(mockUsers[0]);
    const updated = await service.update('1', { firstName: 'Jane' });
    expect(updated).toEqual(mockUsers[0]);
    expect(mockRepository.update).toHaveBeenCalledWith('1', {
      firstName: 'Jane',
    });
  });

  it('should remove user', async () => {
    mockRepository.delete.mockResolvedValue({ affected: 1 });
    await expect(service.remove('1')).resolves.not.toThrow();
  });

  it('should throw if remove fails', async () => {
    mockRepository.delete.mockResolvedValue({ affected: 0 });
    await expect(service.remove('2')).rejects.toThrow(NotFoundException);
  });

  it('should find by email', async () => {
    mockRepository.findOne.mockResolvedValue(mockUsers[0]);
    const user = await service.findByEmail('user1@example.com');
    expect(user).toEqual(mockUsers[0]);
  });
});
