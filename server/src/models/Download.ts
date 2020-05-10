import { IsMagnetURI } from 'class-validator'
import {
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'

export default class Download extends BaseEntity {
  @Column({
    nullable: false
  })
  infoHash: string;

  @Column()
  @IsMagnetURI()
  magnetURI: string;

  @Column({
    nullable: false
  })
  name: string;

  @Column()
  done: boolean;

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
