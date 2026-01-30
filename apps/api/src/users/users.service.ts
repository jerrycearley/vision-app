import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['profile'],
    });
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<UserProfile> {
    let profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      profile = this.profileRepository.create({ userId });
    }

    // Update profile fields
    if (updateDto.bio !== undefined) profile.bio = updateDto.bio;
    if (updateDto.interests !== undefined) profile.interests = updateDto.interests;
    if (updateDto.skills !== undefined) profile.skills = updateDto.skills;
    if (updateDto.educationLevel !== undefined) profile.educationLevel = updateDto.educationLevel;
    if (updateDto.careerGoals !== undefined) profile.careerGoals = updateDto.careerGoals;
    if (updateDto.hobbies !== undefined) profile.hobbies = updateDto.hobbies;
    if (updateDto.location !== undefined) profile.location = updateDto.location;
    if (updateDto.timezone !== undefined) profile.timezone = updateDto.timezone;

    await this.profileRepository.save(profile);

    // Update user display name if provided
    if (updateDto.displayName) {
      await this.userRepository.update(userId, { displayName: updateDto.displayName });
    }

    return profile;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    await this.userRepository.update(userId, updates);
    return this.findById(userId);
  }

  async getAggregatedInterests(userId: string): Promise<string[]> {
    const profile = await this.getProfile(userId);

    // Combine all interest sources
    const allInterests = [
      ...profile.interests,
      ...profile.hobbies,
      ...profile.careerGoals,
      ...profile.skills,
    ];

    // Remove duplicates and return
    return [...new Set(allInterests)];
  }

  async isMinor(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    return user.isMinor;
  }
}
