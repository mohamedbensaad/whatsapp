import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "main"
  }),
  puppeteer: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ],
    headless: true
  }
});

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

client.on("ready", async () => {
  console.log("✅ Bot Ready");

  const chats = await client.getChats();
  const now = Date.now();

  for (const chat of chats) {
    if (!chat.isUser) continue;

    const messages = await chat.fetchMessages({ limit: 1 });
    const msg = messages[0];

    if (!msg) continue;
    if (msg.fromMe) continue;

    // ⏳ check if message is recent (last 5 min)
    const msgTime = msg.timestamp * 1000;

    if (now - msgTime > 5 * 60 * 1000) continue;

    const text = msg.body.toLowerCase();

    const keywords = ["hi", "hello", "salam", "hey"];

    if (!keywords.some(k => text.includes(k))) continue;

    // random delay (3–8 sec)
    const delay = 3000 + Math.random() * 5000;
    console.log(`⏳ waiting ${Math.round(delay)}ms`);
    await sleep(delay);

    await chat.sendMessage("Hi 👋 كيف داير؟ 😊");

    console.log("↩ replied to:", chat.id.user);

    await sleep(1500);
  }

  console.log("✅ Done replying");
  process.exit(0);
});

client.initialize();
