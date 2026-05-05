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

  for (const chat of chats) {
    if (!chat.isUser) continue;

    const messages = await chat.fetchMessages({ limit: 3 });

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.fromMe) continue;

    const text = lastMsg.body.toLowerCase();

    const keywords = ["hi", "hello", "salam", "hey"];

    if (!keywords.some(k => text.includes(k))) continue;

    // ⏳ random delay (3s → 8s)
    const delay = 3000 + Math.random() * 5000;
    console.log(`⏳ waiting ${Math.round(delay)}ms`);
    await sleep(delay);

    await chat.sendMessage("Hi 👋 كيف داير؟ 😊");

    console.log("↩ replied to:", chat.id.user);

    // small delay
    await sleep(1500);
  }

  console.log("✅ Done");
  process.exit(0);
});

client.initialize();
