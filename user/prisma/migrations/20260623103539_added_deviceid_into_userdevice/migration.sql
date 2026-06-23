/*
  Warnings:

  - A unique constraint covering the columns `[deviceId]` on the table `UserDevice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceId` to the `UserDevice` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `deviceType` on the `UserDevice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "UserDevice" ADD COLUMN     "deviceId" TEXT NOT NULL,
DROP COLUMN "deviceType",
ADD COLUMN     "deviceType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "DEVICETYPE";

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_deviceId_key" ON "UserDevice"("deviceId");
