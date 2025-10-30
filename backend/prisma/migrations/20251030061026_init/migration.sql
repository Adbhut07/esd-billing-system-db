-- CreateTable
CREATE TABLE `admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'OPERATOR') NOT NULL DEFAULT 'ADMIN',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_username_key`(`username`),
    UNIQUE INDEX `admin_email_key`(`email`),
    INDEX `admin_email_idx`(`email`),
    INDEX `admin_username_idx`(`username`),
    INDEX `admin_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `charges` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `charges_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mohalla` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `number` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mohalla_number_key`(`number`),
    INDEX `mohalla_number_idx`(`number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `house` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mohalla_id` INTEGER NOT NULL,
    `house_number` VARCHAR(20) NOT NULL,
    `consumer_code` VARCHAR(30) NOT NULL,
    `department` VARCHAR(100) NULL,
    `licensee_name` VARCHAR(150) NOT NULL,
    `electricity_meter_number` VARCHAR(30) NULL,
    `water_meter_number` VARCHAR(30) NULL,
    `mobile_number` VARCHAR(15) NULL,
    `email` VARCHAR(100) NULL,
    `license_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `residence_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `house_consumer_code_key`(`consumer_code`),
    UNIQUE INDEX `house_electricity_meter_number_key`(`electricity_meter_number`),
    UNIQUE INDEX `house_water_meter_number_key`(`water_meter_number`),
    INDEX `house_mohalla_id_idx`(`mohalla_id`),
    INDEX `house_consumer_code_idx`(`consumer_code`),
    INDEX `house_mobile_number_idx`(`mobile_number`),
    INDEX `house_email_idx`(`email`),
    INDEX `house_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reading` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `house_id` INTEGER NOT NULL,
    `month` DATE NOT NULL,
    `electricity_import_reading` INTEGER NOT NULL DEFAULT 0,
    `electricity_export_reading` INTEGER NOT NULL DEFAULT 0,
    `electricity_export_carry_forward` INTEGER NOT NULL DEFAULT 0,
    `electricity_consumption` INTEGER NOT NULL DEFAULT 0,
    `electricity_billed_energy` INTEGER NOT NULL DEFAULT 0,
    `electricity_reading_upload_date` DATETIME(0) NULL,
    `max_demand` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `water_reading` INTEGER NOT NULL DEFAULT 0,
    `water_consumption` INTEGER NOT NULL DEFAULT 0,
    `water_reading_upload_date` DATETIME(0) NULL,
    `bill_1_upto_15` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `bill_1_after_15` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `bill_2_upto_15` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `bill_2_after_15` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `total_bill_upto_15` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `total_bill_after_15` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `bill_1_arrear` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `bill_2_arrear` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `fixed_charge` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `electricity_charge` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `electricity_duty` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `water_charge` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `maintenance_charge` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `other_charges` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `paid_amount` DECIMAL(10, 2) NULL,
    `paid_on` DATE NULL,
    `bill_status` ENUM('PENDING', 'GENERATED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
    `bill_generated_at` DATETIME(0) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `reading_house_id_idx`(`house_id`),
    INDEX `reading_month_idx`(`month`),
    INDEX `reading_bill_status_idx`(`bill_status`),
    INDEX `reading_paid_on_idx`(`paid_on`),
    UNIQUE INDEX `reading_house_id_month_key`(`house_id`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `house` ADD CONSTRAINT `house_mohalla_id_fkey` FOREIGN KEY (`mohalla_id`) REFERENCES `mohalla`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reading` ADD CONSTRAINT `reading_house_id_fkey` FOREIGN KEY (`house_id`) REFERENCES `house`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
