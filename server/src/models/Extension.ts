import { IsSemVer } from 'class-validator'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('extensions')
export default class Extension extends BaseEntity {
  @Column({
    nullable: true,
    default: false
  })
  enabled: boolean;

  @Column({
    nullable: false
  })
  @Index({ unique: true })
  name: string;

  @Column({
    nullable: false
  })
  path: string;

  @Column({
    nullable: false
  })
  @IsSemVer()
  version: string;

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
