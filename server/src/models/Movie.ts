import { IsEnum, Min, Max } from 'class-validator'
import { Exclude, Expose, classToPlain } from 'class-transformer'
import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import Episode from './Episode'
import { getTmdbImageUrl } from '../utils'
import { getIpAddresses } from '../services/system'
import config from '../config'

export enum MovieType {
  Movie = 'movie',
  Series = 'series'
}

@Entity('movies')
export default class Movie extends BaseEntity {
  videoUri: String

  @Exclude()
  private _backdrop?: string;

  @Exclude()
  private _poster?: string;

  // Workaround to pass `part` during lib scan
  @Exclude()
  part?: number;

  @Column({
    nullable: true
  })
  actors?: string;

  @Column({
    nullable: true
  })
  @Expose()
  get backdrop (): string {
    return (this._backdrop && !this._backdrop.startsWith('http'))
      ? getTmdbImageUrl(this._backdrop) : this._backdrop
  }

  set backdrop (b: string) { this._backdrop = b }

  @Column({
    nullable: true
  })
  country?: string;

  @Column({
    nullable: true
  })
  director?: string;

  @OneToMany(() => Episode, episode => episode.movie, { cascade: true })
  episodes?: Episode[];

  @Column({
    nullable: true
  })
  genre?: string;

  @Column({
    nullable: true
  })
  imdbId?: string;

  @Column({
    nullable: true
  })
  language?: string;

  @Column({
    nullable: true
  })
  plot?: string;

  @Column({
    nullable: true
  })
  @Expose()
  get poster (): string {
    return (this._poster && !this._poster.startsWith('http'))
      ? getTmdbImageUrl(this._poster) : this._poster
  }

  set poster (p: string) { this._poster = p }

  @Column({
    nullable: true
  })
  rated?: string;

  @Column({
    nullable: true
  })
  @Min(0)
  resolution?: number;

  @Column({
    nullable: true
  })
  @Min(0)
  runtime?: number;

  @Column({
    nullable: false
  })
  title: string;

  @Column({
    nullable: false
  })
  @IsEnum(MovieType)
  type: string;

  @Column({
    nullable: true,
    type: 'float'
  })
  @Min(0)
  @Max(10)
  vote?: number;

  @Column({
    nullable: true,
    default: 0,
    type: 'float'
  })
  @Min(0)
  @Max(100)
  watched?: number;

  @Column({
    nullable: true
  })
  writer?: string;

  @Column({
    nullable: true
  })
  @Min(1900)
  year?: number;

  @PrimaryGeneratedColumn()
  id?: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  generateVideoUri(): void {
    this.videoUri = `http://${getIpAddresses()[0]}:${config.port}/api/watch/m${this.id}`
  }

  toJSON () {
    return classToPlain(this)
  }
}
