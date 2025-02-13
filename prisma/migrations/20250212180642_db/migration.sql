-- CreateTable
CREATE TABLE `Referral` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `referrerName` VARCHAR(255) NOT NULL,
    `referrerEmail` VARCHAR(255) NOT NULL,
    `refereeName` VARCHAR(255) NOT NULL,
    `refereeEmail` VARCHAR(255) NOT NULL,
    `courseId` VARCHAR(255) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    `emailSent` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Referral_referrerEmail_idx`(`referrerEmail`),
    INDEX `Referral_refereeEmail_idx`(`refereeEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
