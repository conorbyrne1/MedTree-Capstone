-- Migration: Add GenderIdentity and GenderAssignedAtBirth columns to Person table
-- Run this if your database was created before these columns were added to the schema.

USE `medtree`;

ALTER TABLE `Person`
    ADD COLUMN IF NOT EXISTS `GenderIdentity` VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS `GenderAssignedAtBirth` VARCHAR(255) NULL;
