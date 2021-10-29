import {MigrationInterface, QueryRunner} from "typeorm";

export class AddLibraries1635324854481 implements MigrationInterface {
    name = 'AddLibraries1635324854481'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "libraries" ("name" varchar, "path" varchar NOT NULL, "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "libraries"`);
    }

}
