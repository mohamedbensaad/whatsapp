import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

const SESSION_DIR = "./session";

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "main",
    dataPath: SESSION_DIR
  }),
  puppeteer: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ],
    headless: true
  }
});

const delay = (ms) => new Promise(r => setTimeout(r, ms));

client.on("ready", async () => {
  console.log("✅ Bot Ready");

  const chats = await client.getChats();

  for (const chat of chats) {
    if (!chat.isUser) continue;

    const messages = await chat.fetchMessages({ limit: 5 });

    for (const msg of messages) {
      if (msg.fromMe) continue;

      const text = msg.body.toLowerCase();

      const keywords = ["hi", "hello", "salam", "hey"];

      if (!keywords.some(k => text.includes(k))) continue;

      // random delay (3s - 8s)
      const waitTime = 3000 + Math.floor(Math.random() * 5000);
      console.log(`⏳ waiting ${waitTime}ms`);
      await delay(waitTime);

      await chat.sendMessage("Hi 👋 how are you 😊");

      console.log("↩ replied to:", chat.id.user);

      // small delay between users
      await delay(2000);
    }
  }

  console.log("✅ Done replying, exiting...");
  process.exit(0);
});

client.initialize();
