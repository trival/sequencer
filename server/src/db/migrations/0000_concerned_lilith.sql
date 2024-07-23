CREATE TABLE `collection` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`title` text,
	`description` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `song` (
	`id` text PRIMARY KEY NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` text NOT NULL,
	`forked_from_id` text,
	`is_public` integer DEFAULT true NOT NULL,
	`collection_id` text,
	`data` blob,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`forked_from_id`) REFERENCES `song`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`collection_id`) REFERENCES `collection`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`is_public` integer DEFAULT true NOT NULL,
	`color` text
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `song` (`user_id`);--> statement-breakpoint
CREATE INDEX `collection_idx` ON `song` (`collection_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `username_idx` ON `user` (`username`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `user` (`email`);