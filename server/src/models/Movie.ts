import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

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
  rating: number;
      // type: Sequelize.FLOAT,
      // validate: { min: 0, max: 10 }

  @Column()
  resolution: number;
    // type: Sequelize.INTEGER,
    // validate: { min: 0 }

  @Column()
  runtime: number;
      // type: Sequelize.INTEGER,
      // validate: { min: 0 }

  @Column()
  title: string;

  @Column({
    nullable: false
  })
  type: string;
      // validate: { isIn: [[ 'series', 'movie' ]] }

  @Column({
    default: 0,
  })
  watched: number;
    // validate: { min: 0, max: 100 }

  @Column()
  writer: string;

  @Column()
  year: number;
      // type: Sequelize.INTEGER,
      // validate: { min: 1900 }


  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
