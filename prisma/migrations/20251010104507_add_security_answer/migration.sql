/*
  Warnings:

  - Added the required column `securityAnswer` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "securityAnswer" TEXT;
UPDATE "User" SET "securityAnswer" = '$2a$10$v7.Yl4UqP.t0n0z.D0d5k.qA1gA6b7s7E0eX3jD8fJ2aX8fA5aP1lY2' WHERE "securityAnswer" IS NULL;
ALTER TABLE "User" ALTER COLUMN "securityAnswer" SET NOT NULL;