import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InterestSignal } from './interest-signal.entity';
import { ConnectorType, ConnectorStatus } from './connector.enums';

export { ConnectorType, ConnectorStatus };

@Entity('connectors')
export class Connector {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.connectors)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ConnectorType,
  })
  type: ConnectorType;

  @Column({
    type: 'enum',
    enum: ConnectorStatus,
    default: ConnectorStatus.PENDING,
  })
  status: ConnectorStatus;

  @Column({ type: 'text', nullable: true })
  accessToken: string | null;

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  tokenExpiresAt: Date | null;

  @Column('simple-array', { default: '' })
  scopes: string[];

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  errorMessage: string;

  @OneToMany(() => InterestSignal, (signal) => signal.connector)
  signals: InterestSignal[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
