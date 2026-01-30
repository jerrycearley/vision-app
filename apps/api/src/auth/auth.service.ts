import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { RegisterDto, LoginDto, PrivyAuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    let isMinor = false;
    if (registerDto.dateOfBirth) {
      const birthDate = new Date(registerDto.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      isMinor = age < 18;
    }

    const user = this.userRepository.create({
      email: registerDto.email.toLowerCase(),
      passwordHash,
      displayName: registerDto.displayName,
      dateOfBirth: registerDto.dateOfBirth ? new Date(registerDto.dateOfBirth) : null,
      isMinor,
    });

    await this.userRepository.save(user);

    // Create empty profile
    const profile = this.profileRepository.create({
      userId: user.id,
      interests: [],
      skills: [],
      careerGoals: [],
      hobbies: [],
    });
    await this.profileRepository.save(profile);

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async authenticateWithPrivy(privyAuthDto: PrivyAuthDto) {
    // In production, verify the Privy token with Privy's API
    // For now, we'll create/find user based on the token
    const privyAppId = this.configService.get<string>('privy.appId');

    if (!privyAppId) {
      throw new BadRequestException('Privy authentication not configured');
    }

    // This is a simplified implementation
    // In production, you would verify the token with Privy
    let user = await this.userRepository.findOne({
      where: { privyDid: privyAuthDto.privyDid },
    });

    if (!user) {
      // Create new user from Privy
      user = this.userRepository.create({
        email: privyAuthDto.email || `${privyAuthDto.privyDid}@privy.local`,
        displayName: privyAuthDto.displayName || 'Privy User',
        privyDid: privyAuthDto.privyDid,
        walletAddress: privyAuthDto.walletAddress,
        isMinor: false,
      });
      await this.userRepository.save(user);

      // Create empty profile
      const profile = this.profileRepository.create({
        userId: user.id,
        interests: [],
        skills: [],
        careerGoals: [],
        hobbies: [],
      });
      await this.profileRepository.save(profile);
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 604800, // 7 days in seconds
    };
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      isMinor: user.isMinor,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }
}
