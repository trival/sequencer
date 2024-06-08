CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`title` text,
	`description` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `songs` (
	`id` text PRIMARY KEY NOT NULL,
	`updated_at` integer,
	`is_public` integer DEFAULT true,
	`user_id` text,
	`collection_id` text,
	`data` blob,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`is_public` integer DEFAULT true,
	`color` text
);
--> statement-breakpoint
CREATE INDEX `username_idx` ON `users` (`username`);