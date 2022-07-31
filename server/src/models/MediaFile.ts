import { IsMimeType, IsIn, Min } from 'class-validator'
import path from 'path';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import Library from './Library'

@Entity('media_files')
export default class MediaFile extends BaseEntity {
  @Column({
    nullable: false
  })
  fileName: string;

  @ManyToOne(() => Library)
  library: Library;

  @Column({
    nullable: false
  })
  mediaId: number;

  @Column({
    nullable: false
  })
  @IsIn([ 'episode', 'movie' ])
  mediaType: string;

  @Column({
    nullable: false
  })
  @IsMimeType()
  mimeType: string;

  @Column({
    nullable: true
  })
  @Min(1)
  part: number;

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  getAbsolutePath () {
    if (this.fileName.startsWith('http')) {
      return this.fileName
    } else {
      return path.join(this.library.path, this.fileName)
    }
  }
}
