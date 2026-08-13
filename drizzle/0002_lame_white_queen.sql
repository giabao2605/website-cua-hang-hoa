ALTER TABLE `orders` ADD `buyer_email` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_orders_buyer_email` ON `orders` (`buyer_email`);