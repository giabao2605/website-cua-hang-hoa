DROP INDEX `idx_products_active_featured`;--> statement-breakpoint
ALTER TABLE `products` ADD `gallery_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `occasions_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `flowers_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `palette` text DEFAULT 'Theo mùa' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `badge` text;--> statement-breakpoint
ALTER TABLE `products` ADD `sort_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_products_active_featured` ON `products` (`active`,`featured`,`sort_order`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`sku` text NOT NULL,
	`product_name` text NOT NULL,
	`variant_name` text NOT NULL,
	`image_url` text NOT NULL,
	`unit_price` integer NOT NULL,
	`quantity` integer NOT NULL,
	`line_total` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "order_item_money_nonnegative" CHECK("__new_order_items"."unit_price" >= 0 AND "__new_order_items"."line_total" >= 0),
	CONSTRAINT "order_item_quantity_positive" CHECK("__new_order_items"."quantity" > 0)
);
--> statement-breakpoint
INSERT INTO `__new_order_items`("id", "order_id", "product_id", "sku", "product_name", "variant_name", "image_url", "unit_price", "quantity", "line_total") SELECT "id", "order_id", "product_id", "sku", "product_name", "variant_name", "image_url", "unit_price", "quantity", "line_total" FROM `order_items`;--> statement-breakpoint
DROP TABLE `order_items`;--> statement-breakpoint
ALTER TABLE `__new_order_items` RENAME TO `order_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_order_items_order_id` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`public_code` text NOT NULL,
	`customer_id` text,
	`idempotency_key` text NOT NULL,
	`buyer_name` text NOT NULL,
	`buyer_phone` text NOT NULL,
	`recipient_name` text NOT NULL,
	`recipient_phone` text NOT NULL,
	`province` text NOT NULL,
	`locality` text NOT NULL,
	`address_line` text NOT NULL,
	`delivery_date` text NOT NULL,
	`delivery_slot` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`payment_method` text NOT NULL,
	`payment_status` text NOT NULL,
	`status` text NOT NULL,
	`subtotal` integer NOT NULL,
	`discount` integer DEFAULT 0 NOT NULL,
	`shipping_fee` integer NOT NULL,
	`total` integer NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "order_money_nonnegative" CHECK("__new_orders"."subtotal" >= 0 AND "__new_orders"."discount" >= 0 AND "__new_orders"."shipping_fee" >= 0 AND "__new_orders"."total" >= 0),
	CONSTRAINT "order_version_positive" CHECK("__new_orders"."version" >= 1)
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "public_code", "customer_id", "idempotency_key", "buyer_name", "buyer_phone", "recipient_name", "recipient_phone", "province", "locality", "address_line", "delivery_date", "delivery_slot", "note", "payment_method", "payment_status", "status", "subtotal", "discount", "shipping_fee", "total", "version", "created_at", "updated_at") SELECT "id", "public_code", "customer_id", "idempotency_key", "buyer_name", "buyer_phone", "recipient_name", "recipient_phone", "province", "locality", "address_line", "delivery_date", "delivery_slot", "note", "payment_method", "payment_status", "status", "subtotal", "discount", "shipping_fee", "total", "version", "created_at", "updated_at" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_orders_public_code` ON `orders` (`public_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_orders_idempotency_key` ON `orders` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_orders_customer_id` ON `orders` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_status_created_at` ON `orders` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `__new_payment_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`transaction_reference` text DEFAULT '' NOT NULL,
	`object_key` text,
	`amount` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewed_by` text,
	`reviewed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "payment_evidence_amount_nonnegative" CHECK("__new_payment_evidence"."amount" IS NULL OR "__new_payment_evidence"."amount" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_payment_evidence`("id", "order_id", "transaction_reference", "object_key", "amount", "status", "reviewed_by", "reviewed_at", "created_at") SELECT "id", "order_id", "transaction_reference", "object_key", "amount", "status", "reviewed_by", "reviewed_at", "created_at" FROM `payment_evidence`;--> statement-breakpoint
DROP TABLE `payment_evidence`;--> statement-breakpoint
ALTER TABLE `__new_payment_evidence` RENAME TO `payment_evidence`;--> statement-breakpoint
CREATE INDEX `idx_payment_evidence_order_id` ON `payment_evidence` (`order_id`);--> statement-breakpoint
CREATE TABLE `__new_product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`compare_at_price` integer,
	`stock` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "product_variant_price_nonnegative" CHECK("__new_product_variants"."price" >= 0),
	CONSTRAINT "product_variant_compare_at_nonnegative" CHECK("__new_product_variants"."compare_at_price" IS NULL OR "__new_product_variants"."compare_at_price" >= 0),
	CONSTRAINT "product_variant_stock_nonnegative" CHECK("__new_product_variants"."stock" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_product_variants`("id", "product_id", "name", "price", "compare_at_price", "stock", "active") SELECT "id", "product_id", "name", "price", "compare_at_price", "stock", "active" FROM `product_variants`;--> statement-breakpoint
DROP TABLE `product_variants`;--> statement-breakpoint
ALTER TABLE `__new_product_variants` RENAME TO `product_variants`;--> statement-breakpoint
CREATE INDEX `idx_product_variants_product_id` ON `product_variants` (`product_id`);--> statement-breakpoint
CREATE TABLE `__new_shipping_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`value` text NOT NULL,
	`fee` integer NOT NULL,
	`estimate` text NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "shipping_rule_fee_nonnegative" CHECK("__new_shipping_rules"."fee" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_shipping_rules`("id", "name", "kind", "value", "fee", "estimate", "priority", "active", "updated_at") SELECT "id", "name", "kind", "value", "fee", "estimate", "priority", "active", "updated_at" FROM `shipping_rules`;--> statement-breakpoint
DROP TABLE `shipping_rules`;--> statement-breakpoint
ALTER TABLE `__new_shipping_rules` RENAME TO `shipping_rules`;--> statement-breakpoint
CREATE INDEX `idx_shipping_rules_active_priority` ON `shipping_rules` (`active`,`priority`);