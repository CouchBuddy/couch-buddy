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

@Entity('movies')
export default class Movie extends BaseEntity {
  private _backdrop?: string;
  private _poster?: string;
  // Workaround to pass `part` during lib scan
  part?: number;

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
  country?: string;

  @Column({
    nullable: true
  })
  director?: string;

  @OneToMany(() => Episode, episode => episode.movie)
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
  get poster (): string {
    return this._poster ? 'http://image.tmdb.org/t/p/w500' + this._poster : null
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
}
