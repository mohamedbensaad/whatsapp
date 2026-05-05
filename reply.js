import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import fs from "fs-extra";

const SESSION_DIR = "./session";
const REPLIED_FILE = "./replied.json";

const REPLY_TEXT = "Hi 👋 how are you 😊";

// تحميل الرسائل لي تردينا عليها
let replied = [];
if (await fs.pathExists(REPLIED_FILE)) {
  replied = await fs.readJson(REPLIED_FILE);
}

// init client
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "main", // نفس session ديال send.js
    dataPath: SESSION_DIR
  }),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true
  }
});

client.on("ready", () => {
  console.log("✅ Ready for reply");

  // ⚠️ مهم: فـ GitHub Actions خاصنا نجيب آخر الرسائل (مشّي event فقط)
  autoReply();
});

// ===== SMART FETCH (باش يخدم ف GitHub Actions) =====
async function autoReply() {
  const chats = await client.getChats();

  for (const chat of chats) {
    if (!chat.isUser) continue;

    const messages = await chat.fetchMessages({ limit: 5 });

    for (const msg of messages) {
      const id = msg.id._serialized;

      if (replied.includes(id)) continue;
      if (msg.fromMe) continue;

      await chat.sendMessage(REPLY_TEXT);
      console.log("↩ Replied to:", chat.id.user);

      replied.push(id);
      await fs.writeJson(REPLIED_FILE, replied, { spaces: 2 });

      // delay صغير باش ماتبانش spam
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log("✅ Reply job done");
  process.exit(0);
}

client.initialize();
