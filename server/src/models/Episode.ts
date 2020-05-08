import { Min, Max } from 'class-validator'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity()
export default class Episode extends BaseEntity {

  @Column()
  actors: string;

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
  movieId: number;

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
