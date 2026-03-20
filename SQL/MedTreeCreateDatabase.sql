-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema medtree
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema medtree
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `medtree` DEFAULT CHARACTER SET utf8 ;
USE `medtree` ;

-- -----------------------------------------------------
-- Table `medtree`.`Person`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`Person` ;

CREATE TABLE IF NOT EXISTS `medtree`.`Person` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `FirstName` VARCHAR(50) NOT NULL,
  `MiddleName` VARCHAR(100) NULL,
  `LastName` VARCHAR(100) NOT NULL,
  `IsDeceased` TINYINT(1) NOT NULL,
  `DateOfBirth` DATE NOT NULL,
  `GenderIdentity` VARCHAR(255) NULL,
  `GenderAssignedAtBirth` VARCHAR(255) NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `medtree`.`Account`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`Account` ;

CREATE TABLE IF NOT EXISTS `medtree`.`Account` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Username` VARCHAR(255) NOT NULL,
  `Password` VARCHAR(255) NOT NULL,
  `PersonID` INT NOT NULL,
  PRIMARY KEY (`ID`),
  INDEX `_idx` (`PersonID` ASC) VISIBLE,
  CONSTRAINT ``
    FOREIGN KEY (`PersonID`)
    REFERENCES `medtree`.`Person` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `medtree`.`MedicalOffice`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`MedicalOffice` ;

CREATE TABLE IF NOT EXISTS `medtree`.`MedicalOffice` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `medtree`.`Contact`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`Contact` ;

CREATE TABLE IF NOT EXISTS `medtree`.`Contact` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `ContactType` ENUM('PHONE', 'ADDRESS', 'EMAIL') NOT NULL,
  `Description` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `medtree`.`AccountContact`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`AccountContact` ;

CREATE TABLE IF NOT EXISTS `medtree`.`AccountContact` (
  `AccountID` INT NOT NULL,
  `ContactID` INT NOT NULL,
  PRIMARY KEY (`AccountID`, `ContactID`),
  INDEX `2_idx` (`ContactID` ASC) VISIBLE,
  INDEX `1_idx` (`AccountID` ASC) VISIBLE,
  CONSTRAINT `1`
    FOREIGN KEY (`AccountID`)
    REFERENCES `medtree`.`Account` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `2`
    FOREIGN KEY (`ContactID`)
    REFERENCES `medtree`.`Contact` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `medtree`.`PersonRelationshipTypes`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`PersonRelationshipTypes` ;

CREATE TABLE IF NOT EXISTS `medtree`.`PersonRelationshipTypes` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `TypeName` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `medtree`.`PersonRelationships`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`PersonRelationships` ;

CREATE TABLE IF NOT EXISTS `medtree`.`PersonRelationships` (
  `PersonOneID` INT NOT NULL,
  `PersonTwoID` INT NOT NULL,
  `RelationshipTypeID` INT NOT NULL,
  `Description` VARCHAR(255) NULL,
  PRIMARY KEY (`PersonOneID`, `PersonTwoID`),
  INDEX `4_idx` (`PersonTwoID` ASC) VISIBLE,
  INDEX `3_idx` (`PersonOneID` ASC) VISIBLE,
  INDEX `5_idx` (`RelationshipTypeID` ASC) VISIBLE,
  CONSTRAINT `3`
    FOREIGN KEY (`PersonOneID`)
    REFERENCES `medtree`.`Person` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `4`
    FOREIGN KEY (`PersonTwoID`)
    REFERENCES `medtree`.`Person` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `5`
    FOREIGN KEY (`RelationshipTypeID`)
    REFERENCES `medtree`.`PersonRelationshipTypes` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `medtree`.`MedicalDiagnosis`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`MedicalDiagnosis` ;

CREATE TABLE IF NOT EXISTS `medtree`.`MedicalDiagnosis` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `DiagnosisName` VARCHAR(255) NOT NULL,
  `DiagnosisDescription` TEXT NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `medtree`.`PersonMedicalDiagnosis`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`PersonMedicalDiagnosis` ;

CREATE TABLE IF NOT EXISTS `medtree`.`PersonMedicalDiagnosis` (
  `PersonID` INT NOT NULL,
  `DiagnosisID` INT NOT NULL,
  `DateDiagnosed` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `IsCauseOfDeath` TINYINT(1) NOT NULL,
  PRIMARY KEY (`PersonID`, `DiagnosisID`),
  INDEX `7_idx` (`DiagnosisID` ASC) VISIBLE,
  INDEX `6_idx` (`PersonID` ASC) VISIBLE,
  CONSTRAINT `6`
    FOREIGN KEY (`PersonID`)
    REFERENCES `medtree`.`Person` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `7`
    FOREIGN KEY (`DiagnosisID`)
    REFERENCES `medtree`.`MedicalDiagnosis` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `medtree`.`MedicalOfficePerson`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`MedicalOfficePerson` ;

CREATE TABLE IF NOT EXISTS `medtree`.`MedicalOfficePerson` (
  `MedicalOfficeID` INT NOT NULL,
  `PersonID` INT NOT NULL,
  PRIMARY KEY (`MedicalOfficeID`, `PersonID`),
  INDEX `9_idx` (`PersonID` ASC) VISIBLE,
  INDEX `8_idx` (`MedicalOfficeID` ASC) VISIBLE,
  CONSTRAINT `8`
    FOREIGN KEY (`MedicalOfficeID`)
    REFERENCES `medtree`.`MedicalOffice` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `9`
    FOREIGN KEY (`PersonID`)
    REFERENCES `medtree`.`Person` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `medtree`.`Medications`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`Medications` ;

CREATE TABLE IF NOT EXISTS `medtree`.`Medications` (
  `ID` INT NOT NULL,
  `MedicationName` VARCHAR(255) NOT NULL,
  `MedicationDescription` TEXT NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `medtree`.`PersonMedications`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`PersonMedications` ;

CREATE TABLE IF NOT EXISTS `medtree`.`PersonMedications` (
  `PersonID` INT NOT NULL,
  `MedicationID` INT NOT NULL,
  `DatePrescribed` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `DateStopped` TIMESTAMP NULL,
  PRIMARY KEY (`PersonID`, `MedicationID`),
  INDEX `11_idx` (`MedicationID` ASC) VISIBLE,
  INDEX `10_idx` (`PersonID` ASC) VISIBLE,
  CONSTRAINT `10`
    FOREIGN KEY (`PersonID`)
    REFERENCES `medtree`.`Person` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `11`
    FOREIGN KEY (`MedicationID`)
    REFERENCES `medtree`.`Medications` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `medtree`.`PreviousProcedures`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`PreviousProcedures` ;

CREATE TABLE IF NOT EXISTS `medtree`.`PreviousProcedures` (
  `ID` INT NOT NULL,
  `ProcedureName` VARCHAR(255) NOT NULL,
  `ProcedureDescription` TEXT NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `medtree`.`PersonPreviousProcedures`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`PersonPreviousProcedures` ;

CREATE TABLE IF NOT EXISTS `medtree`.`PersonPreviousProcedures` (
  `PersonID` INT NOT NULL,
  `ProcedureID` INT NOT NULL,
  `ProcedureDate` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PersonID`, `ProcedureID`),
  INDEX `13_idx` (`ProcedureID` ASC) VISIBLE,
  INDEX `12_idx` (`PersonID` ASC) VISIBLE,
  CONSTRAINT `12`
    FOREIGN KEY (`PersonID`)
    REFERENCES `medtree`.`Person` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `13`
    FOREIGN KEY (`ProcedureID`)
    REFERENCES `medtree`.`PreviousProcedures` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `medtree`.`Allergies`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`Allergies` ;

CREATE TABLE IF NOT EXISTS `medtree`.`Allergies` (
  `ID` INT NOT NULL,
  `AllergicTo` VARCHAR(255) NOT NULL,
  `AllergyDescription` TEXT NULL,
  PRIMARY KEY (`ID`))
ENGINE = InnoDB
COMMENT = '	\n';


-- -----------------------------------------------------
-- Table `medtree`.`PersonAllergies`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `medtree`.`PersonAllergies` ;

CREATE TABLE IF NOT EXISTS `medtree`.`PersonAllergies` (
  `PersonID` INT NOT NULL,
  `AllergyID` INT NOT NULL,
  PRIMARY KEY (`PersonID`, `AllergyID`),
  INDEX `15_idx` (`AllergyID` ASC) VISIBLE,
  INDEX `14_idx` (`PersonID` ASC) VISIBLE,
  CONSTRAINT `14`
    FOREIGN KEY (`PersonID`)
    REFERENCES `medtree`.`Person` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `15`
    FOREIGN KEY (`AllergyID`)
    REFERENCES `medtree`.`Allergies` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
