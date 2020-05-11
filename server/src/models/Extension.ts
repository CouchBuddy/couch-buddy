import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('extensions')
export default class Extension extends BaseEntity {
  @Column({
    default: false
  })
  enabled: boolean;

  @Column({
    nullable: false
  })
  name: string;

  @Column({
    nullable: false
  })
  path: string;

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
