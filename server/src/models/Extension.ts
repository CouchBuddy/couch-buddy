import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity()
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

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
