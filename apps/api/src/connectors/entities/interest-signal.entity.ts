import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Connector } from './connector.entity';
import { ConnectorType } from './connector.enums';

export enum EntityType {
  TOPIC = 'topic',
  PERSON = 'person',
  ORGANIZATION = 'organization',
  PLACE = 'place',
  EVENT = 'event',
  MEDIA = 'media',
  PRODUCT = 'product',
  SKILL = 'skill',
  CAREER = 'career',
  HOBBY = 'hobby',
}

@Entity('interest_signals')
@Index(['userId', 'source', 'topic'])
export class InterestSignal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ConnectorType,
  })
  source: ConnectorType;

  @Column({ nullable: true })
  connectorId: string;

  @ManyToOne(() => Connector, (connector) => connector.signals, { nullable: true })
  @JoinColumn({ name: 'connectorId' })
  connector: Connector;

  @Column({ nullable: true })
  sourceId: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column()
  topic: string;

  @Column({ nullable: true })
  entity: string;

  @Column({
    type: 'enum',
    enum: EntityType,
    nullable: true,
  })
  entityType: EntityType;

  @Column({ type: 'float', default: 1.0 })
  weight: number;

  @Column({ type: 'float', default: 1.0 })
  confidence: number;

  @Column({ type: 'jsonb', nullable: true })
  rawMetadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
