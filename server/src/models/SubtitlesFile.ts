import { IsIn, IsLocale } from 'class-validator'
import ISO6391 from 'iso-639-1'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import Library from './Library';

@Entity('subtitles_files')
export default class SubtitlesFile extends BaseEntity {
  @Column({
    default: false
  })
  downloaded: boolean;

  @Column({
    nullable: false
  })
  fileName: string;

  @Column({
    nullable: false
  })
  @IsLocale()
  lang: string;

  get langName () {
    return ISO6391.getName(this.lang)
  }

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

  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
