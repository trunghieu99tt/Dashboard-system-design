import {MigrationInterface, QueryRunner} from "typeorm";

export class InitTables1718554545663 implements MigrationInterface {
    name = 'InitTables1718554545663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_score_event_event_type_enum" AS ENUM('ADD_SCORE')`);
        await queryRunner.query(`CREATE TABLE "user_score_event" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "id" BIGSERIAL NOT NULL, "quiz_id" integer NOT NULL, "user_id" integer NOT NULL, "status" "public"."user_score_event_status_enum" NOT NULL DEFAULT 'UN-PROCESSED', "event_type" "public"."user_score_event_event_type_enum" NOT NULL, "score" integer NOT NULL, CONSTRAINT "PK_aead26790e1f3758e6f6b5cd5dc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quiz" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "id" BIGSERIAL NOT NULL, "name" character varying(100), "status" "public"."quiz_status_enum" NOT NULL, "created_by" character varying NOT NULL, "updated_by" character varying, CONSTRAINT "PK_422d974e7217414e029b3e641d0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_score" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "id" BIGSERIAL NOT NULL, "quiz_id" integer NOT NULL, "user_id" integer NOT NULL, "score" integer NOT NULL, CONSTRAINT "PK_d8c3a8d078981d6afd578a11dd7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b53877b4abec103eb6ee554744" ON "user_score" ("quiz_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ec699039e231a0dcc9ae8cabb4" ON "user_score" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "user" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "id" BIGSERIAL NOT NULL, "user_name" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "avatar" character varying NOT NULL, "email" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ec699039e231a0dcc9ae8cabb4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b53877b4abec103eb6ee554744"`);
        await queryRunner.query(`DROP TABLE "user_score"`);
        await queryRunner.query(`DROP TABLE "quiz"`);
        await queryRunner.query(`DROP TABLE "user_score_event"`);
        await queryRunner.query(`DROP TYPE "public"."user_score_event_event_type_enum"`);
    }

}
