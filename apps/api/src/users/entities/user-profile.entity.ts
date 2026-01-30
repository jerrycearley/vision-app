import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column('simple-array', { default: '' })
  interests: string[];

  @Column('simple-array', { default: '' })
  skills: string[];

  @Column({ nullable: true })
  educationLevel: string;

  @Column('simple-array', { default: '' })
  careerGoals: string[];

  @Column('simple-array', { default: '' })
  hobbies: string[];

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  timezone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
