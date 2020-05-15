import { MigrationInterface, QueryRunner } from 'typeorm'

const FTS_TABLE = 'movies_fts'
const SEARCH_FIELDS = 'id, actors, director, plot, title'

/**
 * Set up Full Text Search using SQLite FTS5 extension
 */
export class FtsSetup1589541677919 implements MigrationInterface {
  public async up (queryRunner: QueryRunner): Promise<void> {
    const ftsTableExists = await queryRunner.hasTable(FTS_TABLE)

    // Create a virtual table for FTS5 based on `movies` columns
    await queryRunner.query(`CREATE VIRTUAL TABLE IF NOT EXISTS ${FTS_TABLE} USING fts5(${SEARCH_FIELDS});`)

    if (!ftsTableExists) {
      // Copy rows from the normal movies table to FTS movie table
      await queryRunner.query(`INSERT INTO ${FTS_TABLE} SELECT ${SEARCH_FIELDS} FROM movies;`)

      // Set default columns weights for search order
      await queryRunner.query(`INSERT INTO ${FTS_TABLE}(${FTS_TABLE}, rank) VALUES('rank', 'bm25(0.0, 1, 1, 3, 5)');`)
    }

    // Add triggers to keep movies tables in sync with FTS table
    // After Insert
    await queryRunner.query(`
    CREATE TRIGGER IF NOT EXISTS movies_after_insert AFTER INSERT ON movies BEGIN
        INSERT INTO ${FTS_TABLE}(${SEARCH_FIELDS}) SELECT ${SEARCH_FIELDS} FROM movies WHERE new.id = movies.id;
    END;`)

    // Before Update
    await queryRunner.query(`
    CREATE TRIGGER IF NOT EXISTS movies_fts_before_update BEFORE UPDATE ON movies BEGIN
        DELETE FROM ${FTS_TABLE} WHERE id=old.id;
    END
    `)

    // After Update
    await queryRunner.query(`
    CREATE TRIGGER IF NOT EXISTS movies_after_update AFTER UPDATE ON movies BEGIN
        INSERT INTO ${FTS_TABLE}(${SEARCH_FIELDS}) SELECT ${SEARCH_FIELDS} FROM movies WHERE new.id = movies.id;
    END
    `)

    // Before Delete
    await queryRunner.query(`
    CREATE TRIGGER IF NOT EXISTS movies_fts_before_delete BEFORE DELETE ON movies BEGIN
        DELETE FROM ${FTS_TABLE} WHERE id=old.id;
    END
    `)
  }

  public async down (queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable(FTS_TABLE, true, true, true)
  }
}
