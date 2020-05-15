import { Min, Max } from 'class-validator'
import { Exclude, Expose, classToPlain } from 'class-transformer'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import Movie from './Movie'
import { getTmdbImageUrl } from '../utils'

@Entity('episodes')
export default class Episode extends BaseEntity {
  @Exclude()
  private _backdrop?: string;

  @Exclude()
  private _poster?: string;

  // Workaround to pass `part` during lib scan
  @Exclude()
  part: number;

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
  director?: string;

  @Column({
    nullable: false
  })
  @Min(1)
  episode: number;

  @Column({
    nullable: true
  })
  firstAired?: string;

  @Column({
    nullable: true
  })
  imdbId?: string;

  @ManyToOne(() => Movie, (series) => series.episodes)
  movie?: Movie;

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
  @Min(1)
  season: number;

  @Column({
    nullable: true
  })
  thumbnail?: string;

  @Column({
    nullable: false
  })
  title: string;

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

  toJSON () {
    return classToPlain(this)
  }
}
