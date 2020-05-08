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
  @Column()
  actors: string;

  @Column()
  backdrop: string;

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
  poster: string;
      // get () {
      //   const rawValue = this.getDataValue('poster')

      //   if (rawValue && !rawValue.startsWith('http')) {
      //     return 'http://image.tmdb.org/t/p/w500' + rawValue
      //   } else {
      //     return rawValue
      //   }
      // }

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
