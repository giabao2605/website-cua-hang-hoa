import assert from "node:assert/strict";
import test from "node:test";
import {
  countActiveNewsletterSubscribers,
  createContactRequest,
  listContactRequests,
  subscribeNewsletter,
  updateContactRequestStatus,
} from "../../lib/engagement-store.ts";

test("contact requests and explicit newsletter consent persist without a platform binding", async () => {
  const created = await createContactRequest({
    name: "Nguyễn Hà Trâm",
    phone: "0838 469 089",
    email: "TRAM@example.com",
    occasion: "Kỷ niệm",
    message: "Mình muốn một bó hoa tông xanh nhạt và trắng.",
    website: "",
  });
  const contacts = await listContactRequests();
  const contact = contacts.find((item) => item.id === created.id);
  assert.equal(contact?.phone, "0838469089");
  assert.equal(contact?.email, "tram@example.com");
  assert.equal(contact?.status, "new");

  await updateContactRequestStatus(created.id, { status: "contacted" });
  assert.equal((await listContactRequests()).find((item) => item.id === created.id)?.status, "contacted");

  const before = await countActiveNewsletterSubscribers();
  await subscribeNewsletter({ email: "SEASON@example.com", consent: true, website: "" });
  await subscribeNewsletter({ email: "season@example.com", consent: true, website: "" });
  assert.equal(await countActiveNewsletterSubscribers(), before + 1);
});
