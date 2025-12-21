CREATE TABLE `emoji_words` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`emoji` text NOT NULL,
	`words` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `emoji_unq` ON `emoji_words` (`emoji`);--> statement-breakpoint
CREATE INDEX `emoji_idx` ON `emoji_words` (`emoji`);
