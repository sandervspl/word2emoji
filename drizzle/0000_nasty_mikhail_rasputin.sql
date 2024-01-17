CREATE TABLE `emojis` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`word` text NOT NULL,
	`emoji` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `word_idx` ON `emojis` (`word`);--> statement-breakpoint
CREATE UNIQUE INDEX `word_unq` ON `emojis` (`word`);