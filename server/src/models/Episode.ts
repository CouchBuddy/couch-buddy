import { Min, Max } from 'class-validator'
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

@Entity()
export default class Episode extends BaseEntity {
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
  director: string;

  @Column()
  @Min(1)
  episode: number;

  @Column()
  firstAired: string;

  @Column()
  imdbId: string;

  @Column()
  @ManyToOne(() => Movie, (series) => series.episodes)
  movie: Movie;

  @Column()
  plot: string;

  @Column()
  get poster (): string {
    return this._poster ? 'http://image.tmdb.org/t/p/w500' + this._poster : null
  }
  set poster (p: string) { this._poster = p }

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
  @Min(1)
  season: number;

  @Column()
  thumbnail: string;

  @Column({
    nullable: false
  })
  title: string;

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
