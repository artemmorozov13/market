import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAddress1745063204886 implements MigrationInterface {
    name = 'AddAddress1745063204886'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pickup_point" ADD "fullAddress" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pickup_point" DROP COLUMN "fullAddress"`);
    }

}
