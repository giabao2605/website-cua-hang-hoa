import assert from "node:assert/strict";
import test from "node:test";
import {
  SignupOtpError,
  issueSignupOtp,
  registerWithSignupOtp,
  type SignupOtpRow,
} from "../../lib/signup-otp-service.ts";

const validTestPassword = ["hoa", "mua", "xuan", "2026"].join("-");

test("OTP issue persists only a hash and enforces increasing resend cooldown", async () => {
  const database = new OtpDatabase();
  const sent: Array<{ to: string; otp: string; senderEmail: string; senderName: string }> = [];
  const dependencies = {
    db: database as unknown as D1Database,
    secret: "s".repeat(32),
    getSettings: async () => ({ shopName: "Trâm Florist", otpSenderEmail: "shop@gmail.com" }),
    sendEmail: async (message: { to: string; otp: string; senderEmail: string; senderName: string }) => { sent.push(message); },
  };

  const first = await issueSignupOtp({ email: " TRAM@example.com " }, {
    ...dependencies,
    now: 1_000_000,
    createCode: () => "1234",
  });

  assert.deepEqual(first, { email: "tram@example.com", expiresInSeconds: 300, retryAfterSeconds: 120 });
  assert.equal(sent[0]?.otp, "1234");
  assert.equal(sent[0]?.senderEmail, "shop@gmail.com");
  assert.notEqual(database.rows.get("tram@example.com")?.codeHash, "1234");
  assert.equal(database.rows.get("tram@example.com")?.sendCount, 1);

  await assert.rejects(
    issueSignupOtp({ email: "tram@example.com" }, { ...dependencies, now: 1_060_000, createCode: () => "6543" }),
    (error: unknown) => error instanceof SignupOtpError && error.code === "otp_cooldown" && error.retryAfterSeconds === 60,
  );
  assert.equal(sent.length, 1);

  const second = await issueSignupOtp({ email: "tram@example.com" }, {
    ...dependencies,
    now: 1_120_000,
    createCode: () => "6543",
  });
  assert.equal(second.retryAfterSeconds, 180);
  assert.equal(database.rows.get("tram@example.com")?.sendCount, 2);
  assert.equal(sent.length, 2);
});

test("OTP verification counts failures, creates a confirmed Supabase user once, then consumes the code", async () => {
  const database = new OtpDatabase();
  const base = {
    db: database as unknown as D1Database,
    secret: "s".repeat(32),
    getSettings: async () => ({ shopName: "Trâm Florist", otpSenderEmail: "shop@gmail.com" }),
    sendEmail: async () => undefined,
    now: 2_000_000,
    createCode: () => "1234",
  };
  await issueSignupOtp({ email: "tram@example.com" }, base);

  await assert.rejects(
    registerWithSignupOtp({ email: "tram@example.com", fullName: "Nguyễn Hà Trâm", password: validTestPassword, otp: "0000" }, {
      db: base.db,
      secret: base.secret,
      now: 2_010_000,
      createUser: async () => assert.fail("wrong OTP must not create a user"),
    }),
    (error: unknown) => error instanceof SignupOtpError && error.code === "otp_invalid" && error.attemptsRemaining === 4,
  );

  const created: unknown[] = [];
  const result = await registerWithSignupOtp({
    email: "tram@example.com",
    fullName: "Nguyễn Hà Trâm",
    password: validTestPassword,
    otp: "1234",
  }, {
    db: base.db,
    secret: base.secret,
    now: 2_020_000,
    createUser: async (input) => { created.push(input); },
  });

  assert.deepEqual(result, { email: "tram@example.com" });
  assert.deepEqual(created, [{
    email: "tram@example.com",
    password: validTestPassword,
    fullName: "Nguyễn Hà Trâm",
    emailConfirm: true,
  }]);
  assert.equal(database.rows.has("tram@example.com"), false);
});

test("expired or exhausted OTPs cannot create accounts", async () => {
  const database = new OtpDatabase();
  const dependencies = {
    db: database as unknown as D1Database,
    secret: "s".repeat(32),
    getSettings: async () => ({ shopName: "Trâm Florist", otpSenderEmail: "shop@gmail.com" }),
    sendEmail: async () => undefined,
    now: 3_000_000,
    createCode: () => "1234",
  };
  await issueSignupOtp({ email: "expired@example.com" }, dependencies);

  await assert.rejects(
    registerWithSignupOtp({ email: "expired@example.com", fullName: "Nguyễn Hà Trâm", password: validTestPassword, otp: "1234" }, {
      db: dependencies.db,
      secret: dependencies.secret,
      now: 3_300_001,
      createUser: async () => assert.fail("expired OTP must not create a user"),
    }),
    (error: unknown) => error instanceof SignupOtpError && error.code === "otp_expired",
  );

  await issueSignupOtp({ email: "locked@example.com" }, { ...dependencies, now: 4_000_000 });
  for (let attempt = 4; attempt > 0; attempt -= 1) {
    await assert.rejects(
      registerWithSignupOtp({ email: "locked@example.com", fullName: "Nguyễn Hà Trâm", password: validTestPassword, otp: "0000" }, {
        db: dependencies.db,
        secret: dependencies.secret,
        now: 4_010_000 + attempt,
        createUser: async () => assert.fail("wrong OTP must not create a user"),
      }),
      SignupOtpError,
    );
  }
  await assert.rejects(
    registerWithSignupOtp({ email: "locked@example.com", fullName: "Nguyễn Hà Trâm", password: validTestPassword, otp: "0000" }, {
      db: dependencies.db,
      secret: dependencies.secret,
      now: 4_020_000,
      createUser: async () => assert.fail("locked OTP must not create a user"),
    }),
    (error: unknown) => error instanceof SignupOtpError && error.code === "otp_attempts_exhausted",
  );
});

test("email delivery failure rolls back the pending OTP", async () => {
  const database = new OtpDatabase();
  await assert.rejects(
    issueSignupOtp({ email: "tram@example.com" }, {
      db: database as unknown as D1Database,
      secret: "s".repeat(32),
      now: 5_000_000,
      createCode: () => "1234",
      getSettings: async () => ({ shopName: "Trâm Florist", otpSenderEmail: "shop@gmail.com" }),
      sendEmail: async () => { throw new Error("provider unavailable"); },
    }),
    (error: unknown) => error instanceof SignupOtpError && error.code === "email_delivery_failed",
  );
  assert.equal(database.rows.size, 0);
});

test("parallel wrong codes atomically exhaust the five-attempt limit", async () => {
  const database = new OtpDatabase();
  const shared = {
    db: database as unknown as D1Database,
    secret: "s".repeat(32),
    getSettings: async () => ({ shopName: "Trâm Florist", otpSenderEmail: "shop@gmail.com" }),
    sendEmail: async () => undefined,
    now: 6_000_000,
    createCode: () => "1234",
  };
  await issueSignupOtp({ email: "tram@example.com" }, shared);
  const attempts = await Promise.allSettled(Array.from({ length: 10 }, () => registerWithSignupOtp({
    email: "tram@example.com",
    fullName: "Nguyễn Hà Trâm",
    password: validTestPassword,
    otp: "0000",
  }, {
    db: shared.db,
    secret: shared.secret,
    now: 6_010_000,
    createUser: async () => assert.fail("wrong OTP must not create a user"),
  })));

  assert.equal(attempts.every((attempt) => attempt.status === "rejected"), true);
  assert.equal(database.rows.get("tram@example.com")?.verifyAttempts, 5);
});

test("parallel sends reserve one code and a failed resend preserves the previous code", async () => {
  const database = new OtpDatabase();
  const sent: string[] = [];
  const shared = {
    db: database as unknown as D1Database,
    secret: "s".repeat(32),
    getSettings: async () => ({ shopName: "Trâm Florist", otpSenderEmail: "shop@gmail.com" }),
    sendEmail: async ({ otp }: { otp: string }) => { sent.push(otp); },
  };
  const concurrent = await Promise.allSettled([
    issueSignupOtp({ email: "tram@example.com" }, { ...shared, now: 7_000_000, createCode: () => "1234" }),
    issueSignupOtp({ email: "tram@example.com" }, { ...shared, now: 7_000_000, createCode: () => "5678" }),
  ]);
  assert.equal(concurrent.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(sent.length, 1);

  const previous = database.rows.get("tram@example.com");
  await assert.rejects(issueSignupOtp({ email: "tram@example.com" }, {
    ...shared,
    now: 7_120_000,
    createCode: () => "9999",
    sendEmail: async () => { throw new Error("provider unavailable"); },
  }), SignupOtpError);
  assert.deepEqual(database.rows.get("tram@example.com"), previous);
});

class OtpDatabase {
  readonly rows = new Map<string, SignupOtpRow>();

  prepare(sql: string) {
    let values: readonly unknown[] = [];
    return {
      bind(...next: readonly unknown[]) {
        values = next;
        return this;
      },
      first: async () => {
        if (/FROM signup_otps WHERE email = \?/.test(sql)) return this.rows.get(String(values[0])) ?? null;
        return null;
      },
      run: async () => {
        if (/INSERT INTO signup_otps/.test(sql)) {
          const [email, codeHash, expiresAt, nextSendAt, sendCount, verifyAttempts, createdAt, updatedAt] = values;
          const current = this.rows.get(String(email));
          if (current && current.nextSendAt > Number(values[8])) return { meta: { changes: 0 } };
          this.rows.set(String(email), {
            email: String(email), codeHash: String(codeHash), expiresAt: Number(expiresAt), nextSendAt: Number(nextSendAt),
            sendCount: current ? current.sendCount + 1 : Number(sendCount), verifyAttempts: Number(verifyAttempts), createdAt: Number(createdAt), updatedAt: Number(updatedAt),
          });
          return { meta: { changes: 1 } };
        }
        if (/UPDATE signup_otps SET verify_attempts = verify_attempts \+ 1/.test(sql)) {
          const [updatedAt, email, codeHash, now, maxAttempts] = values;
          const row = this.rows.get(String(email));
          if (!row || row.codeHash !== String(codeHash) || row.expiresAt <= Number(now) || row.verifyAttempts >= Number(maxAttempts)) return { meta: { changes: 0 } };
          this.rows.set(String(email), { ...row, verifyAttempts: row.verifyAttempts + 1, updatedAt: Number(updatedAt) });
          return { meta: { changes: 1 } };
        }
        if (/UPDATE signup_otps SET code_hash = \?/.test(sql)) {
          const [codeHash, expiresAt, nextSendAt, sendCount, verifyAttempts, createdAt, updatedAt, email, failedHash] = values;
          const row = this.rows.get(String(email));
          if (!row || row.codeHash !== String(failedHash)) return { meta: { changes: 0 } };
          this.rows.set(String(email), { email: String(email), codeHash: String(codeHash), expiresAt: Number(expiresAt), nextSendAt: Number(nextSendAt), sendCount: Number(sendCount), verifyAttempts: Number(verifyAttempts), createdAt: Number(createdAt), updatedAt: Number(updatedAt) });
          return { meta: { changes: 1 } };
        }
        if (/DELETE FROM signup_otps/.test(sql)) {
          const [email, codeHash, now, maxAttempts] = values;
          const row = this.rows.get(String(email));
          const matches = row && (values.length === 1
            || values.length === 2 && row.codeHash === String(codeHash)
            || values.length === 4 && row.codeHash === String(codeHash) && row.expiresAt > Number(now) && row.verifyAttempts < Number(maxAttempts));
          return { meta: { changes: matches && this.rows.delete(String(email)) ? 1 : 0 } };
        }
        return { meta: { changes: 0 } };
      },
    };
  }
}
