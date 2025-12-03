-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "title" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "aadharNumber" TEXT,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "designation" TEXT,
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "profilePicture" TEXT;
