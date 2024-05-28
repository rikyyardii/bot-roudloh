const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");

let repliedContacts = {};

async function connectWhatsapp() {
  const auth = await useMultiFileAuthState("session");
  const socket = makeWASocket({
    printQRInTerminal: true,
    browser: ["Bot Konsultasi Roudloh", "Safari", "1.0.0"],
    auth: auth.state,
    logger: pino({ level: "silent" }),
  });

  socket.ev.on("creds.update", auth.saveCreds);
  socket.ev.on("connection.update", async ({ connection }) => {
    if (connection === "open") {
      console.log("200 OK (Bot Running✅)");
    } else if (connection === "close") {
      await connectWhatsapp();
    }
  });

  socket.ev.on("messages.upsert", async ({ messages, type }) => {
    const chat = messages[0];
    const remoteJid = chat.key.remoteJid;
    const pesan = (chat.message?.extendedTextMessage?.text ?? chat.message?.ephemeralMessage?.message?.extendedTextMessage?.text ?? chat.message?.conversation)?.toLowerCase() || "";
    const currentTime = Date.now();

    if (!chat.key.fromMe) {
      const lastReplyTime = repliedContacts[remoteJid] || 0;

      if (currentTime - lastReplyTime > 500) {
        if (pesan.includes("hai")) {
          await socket.sendMessage(remoteJid, { text: "Haloo, selamat datang di Bot Konsultasi Ruang Roudloh. Silahkan tinggalkan pesan untuk diteruskan kepada admin. Kami akan segera membalas pesan Anda secepatnya" }, { quoted: chat });
          repliedContacts[remoteJid] = currentTime;
        } else if (pesan.includes("assalamu'alaikum") || pesan.includes("assalamu'alaikum saya ingin bertanya")) {
          await socket.sendMessage(
            remoteJid,
            { text: "Wa'alaikumussalam, selamat datang di Bot Konsultasi Ruang Roudloh. Silahkan tinggalkan pesan untuk diteruskan kepada admin. Kami akan segera membalas pesan Anda secepatnya" },
            { quoted: chat }
          );
          repliedContacts[remoteJid] = currentTime;
        }
      }
    }
  });
}

connectWhatsapp();
