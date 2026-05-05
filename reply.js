import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import qrcode from "qrcode-terminal";
import fs from "fs-extra";

const SESSION_DIR = "./session";
const REPLIED_FILE = "./replied.json";

const REPLY_TEXT = "Hi 👋 how are you 😊";

// load replied messages
let replied = [];
if (await fs.pathExists(REPLIED_FILE)) {
  replied = await fs.readJson(REPLIED_FILE);
}

// init client
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "main",
    dataPath: SESSION_DIR
  }),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true
  }
});

// QR (only first time)
client.on("qr", qr => {
  console.log("🔐 Scan QR:");
  qrcode.generate(qr, { small: true });
});

// ready
client.on("ready", () => {
  console.log("✅ WhatsApp Ready");
});

// message listener
client.on("message", async msg => {
  try {
    const id = msg.id._serialized;

    // skip if already replied
    if (replied.includes(id)) return;

    // skip your own messages
    if (msg.fromMe) return;

    // only private chats
    if (!msg.from.endsWith("@c.us")) return;

    // reply
    await msg.reply(REPLY_TEXT);
    console.log("↩ Replied to:", msg.from);

    // save
    replied.push(id);
    await fs.writeJson(REPLIED_FILE, replied, { spaces: 2 });

  } catch (err) {
    console.log("❌ Error:", err.message);
  }
});

client.initialize();
