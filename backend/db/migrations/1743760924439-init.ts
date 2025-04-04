import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1743760924439 implements MigrationInterface {
    name = 'Init1743760924439'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."delivery_time_dayofweek_enum" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')`);
        await queryRunner.query(`CREATE TABLE "delivery_time" ("id" SERIAL NOT NULL, "dayOfWeek" "public"."delivery_time_dayofweek_enum" NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "pickupPointId" integer, CONSTRAINT "PK_ef1b3d23f93ec33cfa77e3bb08d" PRIMARY KEY ("id")); COMMENT ON COLUMN "delivery_time"."dayOfWeek" IS 'День недели'; COMMENT ON COLUMN "delivery_time"."startTime" IS 'Время начала доставки в формате HH:MM'; COMMENT ON COLUMN "delivery_time"."endTime" IS 'Время окончания доставки в формате HH:MM'; COMMENT ON COLUMN "delivery_time"."isActive" IS 'Активно ли время для выбора'`);
        await queryRunner.query(`CREATE TYPE "public"."pickup_point_status_enum" AS ENUM('active', 'deleted')`);
        await queryRunner.query(`CREATE TABLE "pickup_point" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "address" text, "coordinates" point, "status" "public"."pickup_point_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9433b0417c214a3cd2fd39d402c" PRIMARY KEY ("id")); COMMENT ON COLUMN "pickup_point"."name" IS 'Название пункта выдачи'; COMMENT ON COLUMN "pickup_point"."address" IS 'Адрес пункта выдачи'; COMMENT ON COLUMN "pickup_point"."coordinates" IS 'Координаты пункта (широта, долгота)'; COMMENT ON COLUMN "pickup_point"."status" IS 'Статус пункта выдачи'`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('waitForPay', 'payConfirm', 'finished')`);
        await queryRunner.query(`CREATE TABLE "order" ("id" SERIAL NOT NULL, "status" "public"."order_status_enum" NOT NULL DEFAULT 'waitForPay', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deliveryDate" date NOT NULL, "address" character varying(255) NOT NULL, "phoneNumber" character varying(20) NOT NULL, "comment" text, "totalAmount" numeric(10,2) NOT NULL DEFAULT '0', "paymentMethod" character varying(50), "pickupPointId" integer, "deliveryTimeId" integer, "userId" integer, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6b86fb2de173d0ba94fe8423ba" ON "order" ("deliveryDate") `);
        await queryRunner.query(`CREATE TABLE "ordered_products_entity" ("id" SERIAL NOT NULL, "telegram_id" bigint NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "productId" integer, "userId" integer, "orderId" integer, CONSTRAINT "PK_bf5eb7175f9ef258e7c62c56ac3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "discount" numeric(5,2) NOT NULL, "image" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "unitValue" integer NOT NULL, "unitOfMeasurement" character varying NOT NULL, "is_expired" boolean NOT NULL, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "selected-products" ("id" SERIAL NOT NULL, "productId" integer NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "userTgchatId" bigint NOT NULL, "basketId" integer, "userId" integer, CONSTRAINT "PK_32014ad6b5208e4be7508ebbeef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "basket" ("id" SERIAL NOT NULL, "products_count" integer NOT NULL DEFAULT '0', "telegram_id" bigint NOT NULL, "userId" integer, CONSTRAINT "REL_26dcb999420495bb5b14a4f8d1" UNIQUE ("userId"), CONSTRAINT "PK_895e6f44b73a72425e434a614cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "address" ("id" SERIAL NOT NULL, "addressString" character varying(255) NOT NULL, "userId" integer, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "telegram_id" bigint NOT NULL, "telegram_username" character varying NOT NULL DEFAULT '', "name" character varying NOT NULL, "phone_number" character varying NOT NULL DEFAULT '', "is_phone_confirmed" boolean NOT NULL DEFAULT false, "email" character varying NOT NULL, "age" integer NOT NULL DEFAULT '0', "password" character varying NOT NULL DEFAULT '', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "delivery_time" ADD CONSTRAINT "FK_e440fca8c08264e26b41a8aa42d" FOREIGN KEY ("pickupPointId") REFERENCES "pickup_point"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_a578da3ed7469b5a2a30b0f8e96" FOREIGN KEY ("pickupPointId") REFERENCES "pickup_point"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_450fa5fdc4aa023aa358128a878" FOREIGN KEY ("deliveryTimeId") REFERENCES "delivery_time"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ordered_products_entity" ADD CONSTRAINT "FK_4d982fbf162e7dde7b4682862af" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ordered_products_entity" ADD CONSTRAINT "FK_fb0ac406cd8a8daf2d2b868a66c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ordered_products_entity" ADD CONSTRAINT "FK_f7431777eb3e6e2dffd6da375f4" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "selected-products" ADD CONSTRAINT "FK_6119538e25ff082c64f0a66fa49" FOREIGN KEY ("basketId") REFERENCES "basket"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "selected-products" ADD CONSTRAINT "FK_7ed50b24a3a3a543f1f2b379617" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "selected-products" ADD CONSTRAINT "FK_6185362cd5b4e8223d4b833f23f" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "basket" ADD CONSTRAINT "FK_26dcb999420495bb5b14a4f8d1c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "address" ADD CONSTRAINT "FK_d25f1ea79e282cc8a42bd616aa3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "address" DROP CONSTRAINT "FK_d25f1ea79e282cc8a42bd616aa3"`);
        await queryRunner.query(`ALTER TABLE "basket" DROP CONSTRAINT "FK_26dcb999420495bb5b14a4f8d1c"`);
        await queryRunner.query(`ALTER TABLE "selected-products" DROP CONSTRAINT "FK_6185362cd5b4e8223d4b833f23f"`);
        await queryRunner.query(`ALTER TABLE "selected-products" DROP CONSTRAINT "FK_7ed50b24a3a3a543f1f2b379617"`);
        await queryRunner.query(`ALTER TABLE "selected-products" DROP CONSTRAINT "FK_6119538e25ff082c64f0a66fa49"`);
        await queryRunner.query(`ALTER TABLE "ordered_products_entity" DROP CONSTRAINT "FK_f7431777eb3e6e2dffd6da375f4"`);
        await queryRunner.query(`ALTER TABLE "ordered_products_entity" DROP CONSTRAINT "FK_fb0ac406cd8a8daf2d2b868a66c"`);
        await queryRunner.query(`ALTER TABLE "ordered_products_entity" DROP CONSTRAINT "FK_4d982fbf162e7dde7b4682862af"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_450fa5fdc4aa023aa358128a878"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_a578da3ed7469b5a2a30b0f8e96"`);
        await queryRunner.query(`ALTER TABLE "delivery_time" DROP CONSTRAINT "FK_e440fca8c08264e26b41a8aa42d"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "address"`);
        await queryRunner.query(`DROP TABLE "basket"`);
        await queryRunner.query(`DROP TABLE "selected-products"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "ordered_products_entity"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6b86fb2de173d0ba94fe8423ba"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
        await queryRunner.query(`DROP TABLE "pickup_point"`);
        await queryRunner.query(`DROP TYPE "public"."pickup_point_status_enum"`);
        await queryRunner.query(`DROP TABLE "delivery_time"`);
        await queryRunner.query(`DROP TYPE "public"."delivery_time_dayofweek_enum"`);
    }

}
