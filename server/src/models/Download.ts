import { IsMagnetURI } from 'class-validator'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('downloads')
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
