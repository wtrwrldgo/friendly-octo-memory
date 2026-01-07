-- CreateTable: client_profiles
CREATE TABLE "client_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_profiles_user_id_key" ON "client_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data: Create ClientProfile for each user with a name
INSERT INTO "client_profiles" ("id", "user_id", "name", "email", "created_at", "updated_at")
SELECT
    gen_random_uuid()::text,
    "id",
    COALESCE("name", 'User'),
    "email",
    "created_at",
    "updated_at"
FROM "users"
WHERE "name" IS NOT NULL OR "email" IS NOT NULL;

-- Drop columns from users (name and email moved to client_profiles)
ALTER TABLE "users" DROP COLUMN IF EXISTS "name";
ALTER TABLE "users" DROP COLUMN IF EXISTS "email";
