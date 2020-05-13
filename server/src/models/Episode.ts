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

@Entity('episodes')
export default class Episode extends BaseEntity {
  private _backdrop?: string;
  private _poster?: string;
  // Workaround to pass `part` during lib scan
  part: number;

  @Column({
    nullable: true
  })
  actors?: string;

  @Column({
    nullable: true
  })
  get backdrop (): string {
    return this._backdrop ? 'http://image.tmdb.org/t/p/w500' + this._backdrop : null
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
  get poster (): string {
    return this._poster ? 'http://image.tmdb.org/t/p/w500' + this._poster : null
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
}
