const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const readline = require("readline");

const apiId = 32238728;
const apiHash = "4dd5d8988791f0256794c49f5e97c5cb";
const phoneNumber = "+79110287931";
const twoFaPassword = "1550";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

(async () => {
  const stringSession = new StringSession("");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => phoneNumber,
    phoneCode: async () => await ask("Enter the code you received: "),
    password: async () => twoFaPassword,
    onError: (err) => console.error(err),
  });

  console.log("\n✅ Logged in.");
  console.log("SESSION_STRING:");
  console.log(client.session.save());

  rl.close();
  await client.disconnect();
})();
