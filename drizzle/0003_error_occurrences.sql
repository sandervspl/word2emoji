CREATE TABLE `error_occurrences` (
	`error_key` text NOT NULL,
	`day` text NOT NULL,
	`occurrence_count` integer DEFAULT 1 NOT NULL,
	`last_message` text NOT NULL,
	`updated_at` text NOT NULL,
	`notification_attempted_at` text,
	PRIMARY KEY(`error_key`, `day`)
);
