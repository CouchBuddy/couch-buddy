import { IsIn, IsLocale } from 'class-validator'
import ISO6391 from 'iso-639-1'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('subtitles_files')
export default class SubtitlesFile extends BaseEntity {
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
