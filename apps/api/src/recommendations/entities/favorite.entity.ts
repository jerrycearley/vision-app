import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Recommendation } from './recommendation.entity';

@Entity('favorites')
@Unique(['userId', 'recommendationId'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  recommendationId: string;

  @ManyToOne(() => Recommendation)
  @JoinColumn({ name: 'recommendationId' })
  recommendation: Recommendation;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column('simple-array', { default: '' })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;
}
