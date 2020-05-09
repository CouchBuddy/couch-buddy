import { IsEnum, Min, Max } from 'class-validator'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import Episode from './Episode'

export enum MovieType {
  Movie = 'movie',
  Series = 'series'
}

@Entity()
export default class Movie extends BaseEntity {
  private _backdrop: string;
  private _poster: string;

  @Column()
  actors: string;

  @Column()
  get backdrop(): string {
    return this._backdrop ? 'http://image.tmdb.org/t/p/w500' + this._backdrop : null
  }
  set backdrop(b: string) { this._backdrop = b }

  @Column()
  country: string;

  @Column()
  director: string;

  @OneToMany(() => Episode, episode => episode.movie)
  episodes: Episode[];

  @Column()
  genre: string;

  @Column()
  imdbId: string;

  @Column()
  language: string;

  @Column()
  plot: string;

  @Column()
  get poster (): string {
    return this._poster ? 'http://image.tmdb.org/t/p/w500' + this._poster : null
  }
  set poster (p: string) { this._poster = p }

  @Column()
  rated: string;

  @Column({
    type: 'float'
  })
  @Min(0)
  @Max(10)
  rating: number;

  @Column()
  @Min(0)
  resolution: number;

  @Column()
  @Min(0)
  runtime: number;

  @Column()
  title: string;

  @Column({
    nullable: false
  })
  @IsEnum(MovieType)
  type: string;

  @Column({
    default: 0,
    type: 'float'
  })
  @Min(0)
  @Max(100)
  watched: number;

  @Column()
  writer: string;

  @Column()
  @Min(1900)
  year: number;


  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
