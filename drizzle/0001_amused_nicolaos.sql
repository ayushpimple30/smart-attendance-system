CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`studentId` int NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`confidenceScore` varchar(10) NOT NULL,
	`livenessScore` varchar(10),
	`faceBoundingBox` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionName` varchar(255) NOT NULL,
	`startTime` timestamp NOT NULL DEFAULT (now()),
	`endTime` timestamp,
	`status` enum('active','completed','paused') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`embeddings` text NOT NULL,
	`imageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_studentId_unique` UNIQUE(`studentId`)
);
--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_sessionId_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE no action ON UPDATE no action;