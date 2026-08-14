CREATE TABLE `signup_otps` (
	`email` text PRIMARY KEY NOT NULL,
	`code_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`next_send_at` integer NOT NULL,
	`send_count` integer DEFAULT 1 NOT NULL,
	`verify_attempts` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "signup_otp_send_count_positive" CHECK("signup_otps"."send_count" >= 1),
	CONSTRAINT "signup_otp_attempts_nonnegative" CHECK("signup_otps"."verify_attempts" >= 0)
);
--> statement-breakpoint
CREATE INDEX `idx_signup_otps_expires_at` ON `signup_otps` (`expires_at`);
