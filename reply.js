import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import fs from "fs-extra";

const SESSION_DIR = "./session";
const REPLIED_FILE = "./replied.json";

// load replied messages
let replied = [];
if (await fs.pathExists(REPLIED_FILE)) {
  replied = await fs.readJson(REPLIED_FILE);
}

// random delay function
const randomDelay = () => {
  return 3000 + Math.floor(Math.random() * 7000); 
  // بين 3s و 10s
};

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "main",
    dataPath: SESSION_DIR
  }),
puppeteer: {
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu"
  ]
}
});

client.on("ready", async () => {
  console.log("✅ Bot Ready");

  const chats = await client.getChats();

  for (const chat of chats) {
    if (!chat.isUser) continue;

    const messages = await chat.fetchMessages({ limit: 10 });

    for (const msg of messages) {
      const id = msg.id._serialized;

      if (replied.includes(id)) continue;
      if (msg.fromMe) continue;

      const text = msg.body.toLowerCase();

      // رد فقط على كلمات معينة (اختياري)
      const keywords = ["hi", "hello", "salam", "hey"];

      if (!keywords.some(k => text.includes(k))) continue;

      // ⏳ delay عشوائي قبل الرد
      const delay = randomDelay();
      console.log(`⏳ waiting ${delay / 1000}s before reply...`);
      await new Promise(r => setTimeout(r, delay));

      await chat.sendMessage("Hi 👋 how are you 😊");

      console.log("↩ replied:", chat.id.user);

      replied.push(id);
      await fs.writeJson(REPLIED_FILE, replied, { spaces: 2 });

      // delay صغير بين الرسائل
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log("✅ Done replying, exiting...");
  process.exit(0);
});

client.initialize();
