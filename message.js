// -------------------- [ Dependencies ] --------------------
const config = require('./settings/config')
const fs = require('fs')
const axios = require('axios')
const chalk = require("chalk")
const util = require("util")
const path = require("path")
const os = require('os')
const speed = require('performance-now')
const { default: baileys, getContentType, generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');
const { smsg, fetchJson, sleep, formatSize } = require('./lib/myfunction') 

// -------------------- [ Handler ] --------------------
module.exports = client = async (client, m, chatUpdate, store) => {
try {
// --- Message Parsing ---
const body = (
m.mtype === "conversation" ? m.message.conversation :
m.mtype === "imageMessage" ? m.message.imageMessage.caption :
m.mtype === "videoMessage" ? m.message.videoMessage.caption :
m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text :
m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId :
m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId :
m.mtype === "interactiveResponseMessage" ? JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id :
m.mtype === "templateButtonReplyMessage" ? m.msg.selectedId :
m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.selectedButtonId ||
m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text : ""
);

const sender = m.key.fromMe ? client.user.id.split(":")[0] + "@s.whatsapp.net" || client.user.id : m.key.participant || m.key.remoteJid;
const senderNumber = sender.split('@')[0];
const budy = (typeof m.text === 'string' ? m.text : '');
const prefa = ["", "!", ".", ",", "🐤", "🗿"];

const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/;
const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.';
const from = m.key.remoteJid;
const isGroup = from.endsWith("@g.us");
const botNumber = await client.decodeJid(client.user.id);

// --- Owner & Bot Check ---
const kontributor = JSON.parse(fs.readFileSync(path.resolve(__dirname, './lib/database/owner.json'), 'utf8'))
const isOwner = [botNumber, ...kontributor].map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender)
const isBot = botNumber.includes(senderNumber)

// --- Command Parsing ---
const isCmd = body.startsWith(prefix);
const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
const command2 = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
const args = body.trim().split(/ +/).slice(1);
const pushname = m.pushName || "No Name";
const text = q = args.join(" ");

// --- Quoted Message Check ---
const quoted = m.quoted ? m.quoted : m;
const mime = (quoted.msg || quoted).mimetype || '';
const qmsg = (quoted.msg || quoted);
const isMedia = /image|video|sticker|audio/.test(mime);

// --- Group Info ---
const groupMetadata = m?.isGroup ? await client.groupMetadata(m.chat).catch(() => ({})) : {};
const groupName = m?.isGroup ? groupMetadata.subject || '' : '';
const participants = m?.isGroup ? groupMetadata.participants?.map(p => {
let admin = null;
if (p.admin === 'superadmin') admin = 'superadmin';
else if (p.admin === 'admin') admin = 'admin';
return {
id: p.id || null,
jid: p.jid || null,
admin,
full: p
};
}) || []: [];
const groupOwner = m?.isGroup ? participants.find(p => p.admin === 'superadmin')?.jid || '' : '';
const groupAdmins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.jid || p.id);
const isBotAdmins = m?.isGroup ? groupAdmins.includes(botNumber) : false;
const isAdmins = m?.isGroup ? groupAdmins.includes(m.sender) : false;
const isGroupOwner = m?.isGroup ? groupOwner === m.sender : false;

// -------------------- [ Global Image ] --------------------

const S1 = fs.readFileSync(`./lib/media/S1.jpg`)
const imageList = [
"https://files.catbox.moe/kq7hck.mp4"
];
const SR = imageList[Math.floor(Math.random() * imageList.length)];
const ImageZnX = {
key: {
fromMe: false,
participant: `0@s.whatsapp.net`,
...(from ? {
remoteJid: "@s.whatsapp.net"
} : {})
},
"message": {
"orderMessage": {
"orderId": "594071395007984",
"thumbnail": S1,
"itemCount": 2009,
"status": "INQUIRY",
"surface": "CATALOG",
"message": `♱ 드༑⌁⃰⃟𝚪𝚯𝗫𝐗ᎨÈ 𝕻Ɽ𝟬͜͢-‣꙱\n[ ! ] version 3.0`,
"orderTitle": config.settings.title,
"sellerJid": "6289501955295@s.whatsapp.net",
"token": "AR40+xXRlWKpdJ2ILEqtgoUFd45C8rc1CMYdYG/R2KXrSg==",
"totalAmount1000": "2009",
"totalCurrencyCode": "IDR"
}
}
}
async function zreply(text) {
client.sendMessage(m.chat, {
text: text,
contextInfo: {
mentionedJid: [sender],
externalAdReply: {
title: config.settings.title,
body: config.settings.description,
thumbnailUrl: S1,
sourceUrl: config.socialMedia.Telegram,
renderLargerThumbnail: false,
}
}
}, { quoted: ImageZnX })
}

// -------------------- [ Utility Functions ] --------------------

const menureply = async (menu) => {
client.sendMessage(m.chat, {
interactiveMessage: {
title: menu,
footer: config.settings.footer,
video: SR,
nativeFlowMessage: {
messageParamsJson: JSON.stringify({
limited_time_offer: {
text: "드༑⌁⃰⃟𝚪𝚯𝗫𝐗ᎨÈ 𝕻Ɽ𝟬͜͢-‣꙱",
url: "t.me/AkunTelegramAsli",
copy_code: "♱CRAZYBOTZZ",
expiration_time: Date.now() * 9999
},
bottom_sheet: {
in_thread_buttons_limit: 2,
divider_indices: [1, 2, 3, 4, 5, 999],
list_title: "드༑⌁⃰⃟𝚪𝚯𝗫𝐗ᎨÈ 𝕻Ɽ𝟬͜͢-‣꙱",
button_title: "♱CRAZYBOTZZ"
},
tap_target_configuration: {
title: "▸ X ◂",
description: "bomboclard",
canonical_url: "https://t.me/AkunTelegramAsli",
domain: "shop.example.com",
button_index: 0
}
}),
buttons: [
{
name: "single_select",
buttonParamsJson: JSON.stringify({ has_multiple_buttons: true })
},
{
name: "call_permission_request",
buttonParamsJson: JSON.stringify({ has_multiple_buttons: true })
},
{
name: "single_select",
buttonParamsJson: JSON.stringify({
title: "[ ! ] M⃰͠E͟͜͢N̷͜͢͢U͢ B̴̶͠O̶T͟͠ ",
sections: [
{
title: "# CRAZYBOTZZ - NEW ERA",
highlight_label: "C͟R͜͢͢A̷̴͢S̷H̴̶† F͠O͟͜͢R̷͜͢͢ W̷̴A̴̶͠",
rows: [
{
title: "「 B͟͠U͟G͜͢͢⃟ M̷E̴̶N̶͟͠U⃰͠ ♱」̃", 
description: "W̴̶͠꙱H̶A͟͠T͟͜͢͢S͜͢A̷͢⃟P̷̴̶P̴S̶͠ C⃰͟R͜͢͢A̷̴͢S̷H̴",
id: `${prefix}bugmenu`
},
{ 
title: "「 S̷̴Y̴̶͠S̶T͟͠E͟͜͢͢꙱M͜͢ M̷̴̶E̴N̶͠⃟U͟͜͢͠ ♱」",
description: "A͟͜͢͢K͜͢S̷͢E̷̴̶꙱S̴ M͟͜͢͠E͟N͜͢͢⃟U̷̴͢ B̴̶O̶͟͠T⃰͠",
id: `${prefix}ownermenu`
}
]
}
],
has_multiple_buttons: true
})
},
{
name: "quick_reply",
buttonParamsJson: JSON.stringify({
display_text: "「 O̷͜͢͢W͢N̷̴E̴̶͠R̶⃰ B͟͜͢͢O͜͢T̷͢ ♱」",
id: `${prefix}buysc`
})
}
]
}
}
}, { quoted: ImageZnX })
}

async function sreply(teks) {
const buttons = [
{
buttonId: '.menu',
buttonText: { displayText: '#𝗖𝗥𝗔𝗭𝗬𝗕𝗢𝗧𝗭𝗭' },
type: 1
}
];

const buttonMessage = {
image: { url: SR },
caption: teks,
footer: '༑⌁⃰⃟𝚪𝚯𝗫𝐗ᎨÈ 𝕻Ɽ𝟬͜͢-‣꙱',
buttons,
headerType: 4,
contextInfo: {
forwardingScore: 99999,
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: "1@",
serverMessageId: null,
newsletterName: " UPDATE "
},
},
viewOnce: true
};

return await client.sendMessage(m.chat, buttonMessage, { quoted: ImageZnX });
}

// -------------------- [ Logging ] --------------------
if (m.message) {
console.log('\x1b[30m--------------------\x1b[0m');
console.log(chalk.bgHex("#4a69bd").bold(`> ♱ New Message`));
console.log(
chalk.bgHex("#ffffff").black(
`   > ♱ Tanggal: ${new Date().toLocaleString()} \n` +
`   > ♱ Pesan: ${m.body || m.mtype} \n` +
`   > ♱ Pengirim: ${pushname} \n` +
`   > ♱ JID: ${senderNumber} \n`
)
);
console.log();
}

const dbPath = './lib/database/antilinkgc.json';
let ntlinkgc = fs.existsSync(dbPath)
? JSON.parse(fs.readFileSync(dbPath))
: [];

const Antilinkgc = ntlinkgc.includes(m.chat);

if (isGroup && Antilinkgc) {
const detect = "chat.whatsapp.com/";

if (budy && budy.includes(detect)) {
if (isAdmins || isOwner) return;
if (!isBotAdmins) return zreply('_Bot bukan admin, tidak bisa kick!_');

await client.sendMessage(m.chat, { delete: m.key });
await client.groupParticipantsUpdate(m.chat, [m.sender], 'remove');

zreply(`⚠️ Link grup terdeteksi!\nPesan dihapus dan user telah dikeluarkan.`);
}
}

// -------------------- [ Function Crash.WhatSaap ] --------------------
// -------------------- [ Main Command Switch ] --------------------
const x = `${prefix + command}`
switch (command) {

case "menu": {
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const formattedUsedMem = formatSize(usedMem);
const formattedTotalMem = formatSize(totalMem);
let timestamp = speed()
let latensi = speed() - timestamp
const namaOrang = m.pushName || "No Name";
const user = `${namaOrang}`;
let menu =
`— ( 🕸️ ) Hello ${user}. i'm Roxxie Pro, created by t.me/AkunTelegramAsli. this bot is designed for testing whatsapp stability and may cause the app to crash on Android or IOS devices.

> ♱ Developer: t.me/AkunTelegramAsli
> ♱ Version: 1.2 (Free Release)
> ♱ Prefix Support: Multi-Prefix
> ♱ Langgue: JavaScript
> ♱ Performance: ${latensi.toFixed(4)} s
> ♱ Memory: ${formattedUsedMem} / ${formattedTotalMem}`;
menureply(menu)
}
break

case "bugmenu": {
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const formattedUsedMem = formatSize(usedMem);
const formattedTotalMem = formatSize(totalMem);
let timestamp = speed()
let latensi = speed() - timestamp
const namaOrang = m.pushName || "No Name";
const user = `${namaOrang}`;
let menu =
`— ( 🕸️ ) Hello ${user}. i'm Roxxie Pro, created by t.me/AkunTelegramAsli. this bot is designed for testing whatsapp stability and may cause the app to crash on Android or IOS devices.

> ♱ Developer: t.me/AkunTelegramAsli
> ♱ Version: 1.2 (Free Release)
> ♱ Prefix Support: Multi-Prefix
> ♱ Langgue: JavaScript
> ♱ Performance: ${latensi.toFixed(4)} s
> ♱ Memory: ${formattedUsedMem} / ${formattedTotalMem}

─ ◇ ! *Command Bugs*
• .ios ‹ 62xxx ›
• .android ‹ 62xxx ›
• .xgroup ‹ chat.whatsapp.com/ ›

— © C͟͜͢R̷͜͢͢A͢Z̷̴⃟Y̴̶͠B̶O͟͠T͟͜͢͢Z⃰͜͢Z̷͢`;
menureply(menu)
}
break

case "ownermenu": {
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const formattedUsedMem = formatSize(usedMem);
const formattedTotalMem = formatSize(totalMem);
let timestamp = speed()
let latensi = speed() - timestamp
const namaOrang = m.pushName || "No Name";
const user = `${namaOrang}`;
let menu =
`— ( 🕸️ ) Hello ${user}. i'm Roxxie Pro, created by t.me/AkunTelegramAsli. this bot is designed for testing whatsapp stability and may cause the app to crash on Android or IOS devices.

> ♱ Developer: t.me/AkunTelegramAsli
> ♱ Version: 1.2 (Free Release)
> ♱ Prefix Support: Multi-Prefix
> ♱ Langgue: JavaScript
> ♱ Performance: ${latensi.toFixed(4)} s
> ♱ Memory: ${formattedUsedMem} / ${formattedTotalMem}

─ ◇ ! *Command Owner*
• .addowner - ‹ 62xxx ›
• .delowner - ‹ 62xxx ›

— © C͟͜͢R̷͜͢͢A͢Z̷̴⃟Y̴̶͠B̶O͟͠T͟͜͢͢Z⃰͜͢Z̷͢`;
menureply(menu)
}
break;

// --- Owner Commands ---
case 'addowner': {
if (!isOwner) return zreply(config.message.owner)
if (!q) return zreply(`— ex: ${x} 62xxx`);

let bijipler = q.replace(/[^0-9]/g, "")
if (bijipler.startsWith('0')) return zreply(`— ex: ${x} 62xxx !!`);
let add = bijipler + '@s.whatsapp.net'

let capt = `anda kini telah mendapatkan akses owner ke bot`
kontributor.push(bijipler)
fs.writeFileSync(path.resolve(__dirname, './lib/database/owner.json'), JSON.stringify(kontributor), 'utf8')
zreply("berhasil menambahkan ke daftar owner")
await sleep(5000)
client.sendMessage(add, { text: capt }) 
}
break

case 'delowner': {
if (!isOwner) return zreply(config.message.owner)
if (!q) return zreply(`— ex: ${x} 62xxx`);

let bijipler = q.replace(/[^0-9]/g,"")
if (bijipler.startsWith('0')) return zreply(`— ex: ${x} 62xxx !!`);
let index = kontributor.indexOf(bijipler)

if (index > -1) {
kontributor.splice(index,1)
fs.writeFileSync(path.resolve(__dirname,'./lib/database/owner.json'),JSON.stringify(kontributor),'utf8')
zreply("owner berhasil dihapus")
} else {
zreply("nomor tidak ditemukan dalam daftar owner")
}
}
break;

case "self": {
if (!isOwner) return zreply(config.message.owner)

client.public = true;

zreply("*Success Change Mode Public To Self*");
}
break

case "public": {
if (!isOwner) return zreply(config.message.owner)

client.public = true;

zreply("*Success Change Mode Self To Public*");
}
break;
case 'android': {
if (!isOwner) return zreply(config.message.owner);
if (!q) return zreply(`— ex: ${x} 62xxx`);

let jidx = q.replace(/[^0-9]/g, "");
if (jidx.startsWith('0')) return zreply(`— ex: ${x} 62xxx !!`);

let isTarget = `${jidx}@s.whatsapp.net`;
let menu = `*(#) Target Execute !!*
⬡ number : *${jidx}*
⬡ status : *procces to sent.*`;

const buttonMessage = {
image: { url: SR },
caption: menu,
footer: 'િ፷𝑹̶𝒊̈́͟𝒛𝒙̶ᐁ𝑽𝒆̽͢𝒍𝒛𝑶̽𝒇𝒇𝒊𝒄𝒊𝒂𝒍፮▾ ༑̴⟆',
headerType: 6,
contextInfo: {
forwardingScore: 99999,
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: "1@newsteller",
serverMessageId: null,
newsletterName: "X"
},
mentionedJid: ['13135550002@s.whatsapp.net'],
},
viewOnce: true,
buttons: []
};

const nativeFlowButton = {
buttonId: 'action',
buttonText: { displayText: 'Options' },
type: 4,
nativeFlowInfo: {
name: 'single_select',
paramsJson: JSON.stringify({
title: '¿?',
sections: [
{
title: "⌜ 𝐀𝐧𝐝𝐫𝐨𝐢𝐝 𝐌𝐞𝐧 𝐈𝐧 𝐂𝐲𝐛𝐞𝐫𝐒𝐩𝐚𝐜𝐞♻️ ⌟",
highlight_label: "〽️",
rows: [
{
header: "",
title: "𝐃͢𝐞𝐥𝐚͢𝐲 𝐈𝐧𝐕͢𝐢𝐬𝐢͢𝐛𝐥𝐞",
description: "› delay invisible android",
id: `.a_invisible ${isTarget}`
},
{
header: "",
title: "𝐒͢𝐪𝐋͢𝐂 𝐅͢𝐥𝐨͢𝐰𝐬",
description: "› forclose android ( beta )",
id: `.a_close ${isTarget}`
}
]
},
{
title: "⌜ 𝐂𝐲𝐛𝐞𝐫𝐒𝐩𝐚𝐜𝐞 𝐂𝐥𝐢𝐞𝐧𝐭`𝐂𝐨𝐫𝐞🎭 ⌟",
highlight_label: "🦠",
rows: [
{
header: "",
title: "#𝐃𝐞͢𝐯𝐞𝐥𝐨𝐩𝐞𝐫 – 𝐈͢𝐧𝐟𝐨𝐫͢𝐦𝐚𝐭𝐢𝐨𝐧",
description: "information about the developer",
id: `.about`
}
]
}
]
})
}
};

buttonMessage.buttons.push(nativeFlowButton);

return await client.sendMessage(m.chat, buttonMessage, { quoted: ImageZnX });
}
break;
case 'add': {
if (!isGroup) return zreply('Fitur ini hanya untuk grup!');
if (!isBotAdmins) return zreply('_Bot harus menjadi admin terlebih dahulu_');
if (!isOwner) return zreply('Hanya admin/owner yang bisa menggunakan fitur ini');

if (!q && !m.quoted)
return zreply(`— ex: ${x} 62xxx atau reply pesan target`);

let targetNum = m.quoted
? (m.quoted.sender || m.quoted.participant || '').replace(/[^0-9]/g, '')
: q.replace(/[^0-9]/g, '');

if (!targetNum) return zreply('Nomor tidak valid!');
if (targetNum.startsWith('0')) return zreply(`— ex: ${x} 62xxx !!`);

let isTarget = `${targetNum}@s.whatsapp.net`;

try {
await client.groupParticipantsUpdate(m.chat, [isTarget], 'add');
zreply(`✅ Berhasil menambahkan *${targetNum}* ke grup`);
} catch (err) {
console.log(err);
zreply(`❌ Gagal menambahkan user: ${err.message || err}`);
}
}
break;
case 'kick': {
if (!isGroup) return zreply('Fitur ini hanya untuk grup!');
if (!isOwner) return zreply('Hanya admin/owner!');
if (!isBotAdmins) return zreply('_Bot harus menjadi admin terlebih dahulu_');

if (!q && !m.quoted)
return zreply(`— ex: ${x} 62812xxxx atau reply pesan target`);

let num = m.quoted
? (m.quoted.sender || '').replace(/[^0-9]/g, '')
: q.replace(/[^0-9]/g, '');

if (!num) return zreply('Nomor tidak valid!');
let target = `${num}@s.whatsapp.net`;

try {
await client.groupParticipantsUpdate(m.chat, [target], 'remove');
zreply(`✅ Berhasil mengeluarkan *${num}*`);
} catch (err) {
zreply('❌ Gagal kick user');
}
}
break;
case 'promote': {
if (!isGroup) return zreply('Fitur hanya untuk grup!');
if (!isOwner) return zreply('Hanya admin/owner!');
if (!isBotAdmins) return zreply('_Bot harus menjadi admin terlebih dahulu_');

if (!q && !m.quoted)
return zreply(`— ex: ${x} 62812xxxx atau reply target`);

let num = m.quoted
? (m.quoted.sender || '').replace(/[^0-9]/g, '')
: q.replace(/[^0-9]/g, '');

if (!num) return zreply('Nomor tidak valid!');
let target = `${num}@s.whatsapp.net`;

try {
await client.groupParticipantsUpdate(m.chat, [target], 'promote');
zreply(`✅ *${num}* sekarang menjadi admin`);
} catch (e) {
zreply('❌ Gagal promote');
}
}
break;
case 'demote': {
if (!isGroup) return zreply('Fitur hanya untuk grup!');
if (!isOwner) return zreply('Hanya admin/owner!');
if (!isBotAdmins) return zreply('_Bot harus menjadi admin terlebih dahulu_');

if (!q && !m.quoted)
return zreply(`— ex: ${x} 62812xxxx atau reply target`);

let num = m.quoted
? (m.quoted.sender || '').replace(/[^0-9]/g, '')
: q.replace(/[^0-9]/g, '');

if (!num) return zreply('Nomor tidak valid!');
let target = `${num}@s.whatsapp.net`;

try {
await client.groupParticipantsUpdate(m.chat, [target], 'demote');
zreply(`✅ *${num}* diturunkan dari admin`);
} catch (e) {
zreply('❌ Gagal demote');
}
}
break;
case 'setppgroup': {
if (!isGroup) return zreply('Fitur khusus grup!');
if (!isOwner) return zreply('Admin only!');
if (!isBotAdmins) return zreply('Bot harus admin!');
if (!m.quoted || !/image/.test(mime)) return zreply(`Reply gambar dengan:\n${x}setppgroup`);

let media = await client.downloadAndSaveMediaMessage(qmsg);

await client.updateProfilePicture(m.chat, { url: media })
.then(() => zreply('✅ Foto profil grup berhasil diubah'))
.catch(() => zreply('❌ Gagal mengubah foto profil!'));
}
break;
case 'delppgroup': {
if (!isGroup) return zreply('Fitur khusus grup!');
if (!isOwner) return zreply('Admin only!');
if (!isBotAdmins) return zreply('Bot harus admin!');

try {
await client.removeProfilePicture(m.chat);
zreply('✅ Foto profil grup berhasil dihapus');
} catch (e) {
zreply('❌ Gagal menghapus foto grup');
}
}
break;
case 'setname': {
if (!isGroup) return zreply('Fitur khusus grup!');
if (!isOwner) return zreply('Admin only!');
if (!isBotAdmins) return zreply('Bot harus admin!');
if (!q) return zreply(`— ex: ${x}setname NamaBaru`);

try {
await client.groupUpdateSubject(m.chat, q);
zreply(`✅ Nama grup berhasil diubah menjadi:\n*${q}*`);
} catch (e) {
zreply('❌ Gagal mengubah nama grup');
}
}
break;
case 'setdesc': {
if (!isGroup) return zreply('Fitur khusus grup!');
if (!isOwner) return zreply('Admin only!');
if (!isBotAdmins) return zreply('Bot harus admin!');
if (!q) return zreply(`— ex: ${x}setdesc DeskripsiBaru`);

try {
await client.groupUpdateDescription(m.chat, q);
zreply(`✅ Deskripsi grup berhasil diubah`);
} catch (e) {
zreply('❌ Gagal mengubah deskripsi grup');
}
}
break;
case 'antilinkgc': {
if (!isGroup) return zreply('Fitur ini hanya untuk grup!');
if (!isBotAdmins) return zreply('_Bot harus menjadi admin terlebih dahulu_');
if (!isOwner) return zreply('Khusus admin!');

const dbPath = './lib/database/antilinkgc.json';
let ntlinkgc = fs.existsSync(dbPath)
? JSON.parse(fs.readFileSync(dbPath))
: [];

const Antilinkgc = ntlinkgc.includes(m.chat);

if (args[0] === "on") {

if (Antilinkgc) return zreply('✅ Antilinkgc sudah aktif');

ntlinkgc.push(m.chat);
fs.writeFileSync(dbPath, JSON.stringify(ntlinkgc));

zreply('✅ Antilinkgc berhasil diaktifkan di grup ini');

let groupMeta = await client.groupMetadata(m.chat);
let members = groupMeta.participants.map(a => a.id);

await client.sendMessage(m.chat, {
text: `\`\`\`「 ⚠️ WARNING ⚠️ 」\`\`\`\n\nTidak ada yang diizinkan mengirim link grup di sini.\nYang mengirim akan *langsung di-kick*!`,
contextInfo: { mentionedJid: members }
}, { quoted: m });

} else if (args[0] === "off") {

if (!Antilinkgc) return zreply('✅ Antilinkgc sudah nonaktif');

let idx = ntlinkgc.indexOf(m.chat);
ntlinkgc.splice(idx, 1);
fs.writeFileSync(dbPath, JSON.stringify(ntlinkgc));

zreply('✅ Antilinkgc berhasil dimatikan di grup ini');

} else {
zreply(`Contoh: ${x}antilinkgc on / off`);
}
}
break;
case 'closetime': {
if (!isGroup) return zreply('Fitur khusus grup!');
if (!isAdmins && !isOwner) return zreply('Khusus admin!');
if (!isBotAdmins) return zreply('Bot harus admin!');
if (!args[0] || !args[1]) 
return zreply(`— ex: ${x}closetime 5 minute`);

let time = parseInt(args[0]);
let unit = args[1].toLowerCase();
let ms =
unit === 'second' ? time * 1000 :
unit === 'minute' ? time * 60000 :
unit === 'hour'   ? time * 3600000 :
unit === 'day'? time * 86400000 : null;

if (!ms) return zreply('Format waktu salah! (second/minute/hour/day)');

zreply(`✅ Grup akan ditutup dalam ${args[0]} ${args[1]}`);

setTimeout(async () => {
await client.groupSettingUpdate(m.chat, 'announcement');
zreply('📌 Grup berhasil ditutup (announcement mode)');
}, ms);
}
break;
case 'opentime': {
if (!isGroup) return zreply('Fitur khusus grup!');
if (!isAdmins && !isOwner) return zreply('Khusus admin!');
if (!isBotAdmins) return zreply('Bot harus admin!');
if (!args[0] || !args[1])
return zreply(`— ex: ${x}opentime 10 minute`);

let time = parseInt(args[0]);
let unit = args[1].toLowerCase();
let ms =
unit === 'second' ? time * 1000 :
unit === 'minute' ? time * 60000 :
unit === 'hour'   ? time * 3600000 :
unit === 'day'? time * 86400000 : null;

if (!ms) return zreply('Format waktu salah! (second/minute/hour/day)');

zreply(`✅ Grup akan dibuka dalam ${args[0]} ${args[1]}`);

setTimeout(async () => {
await client.groupSettingUpdate(m.chat, 'not_announcement');
zreply('✅ Grup berhasil dibuka (semua anggota bisa chat)');
}, ms);
}
break;
case 'resetlink': {
if (!isGroup) return zreply('Fitur khusus grup!');
if (!isAdmins && !isOwner) return zreply('Khusus admin!');
if (!isBotAdmins) return zreply('Bot harus admin!');

try {
let res = await client.groupRevokeInvite(m.chat);
zreply(`✅ Link grup berhasil di-reset!\n\nLink baru:\nhttps://chat.whatsapp.com/${res}`);
} catch (e) {
zreply('❌ Gagal reset link grup');
}
}
break;
case 'leavegc': {
if (!isOwner) return zreply('Khusus Owner!');
await zreply('✅ Bot akan keluar dari grup ini...');
await client.groupLeave(m.chat);
}
break;
case 'tiktok': {
if (!q) return zreply(`— ex: ${x}tiktok https://vt.tiktok.com/...`);

let api = await fetchJson(`https://www.tikwm.com/api/?url=${q}`);

if (!api || !api.data || !api.data.play) 
return zreply('Gagal mengambil data TikTok');

await client.sendMessage(m.chat, { 
video: { url: api.data.play }, 
caption: '✅)' 
});
}
break;
case 'tiktokslide': {
if (!q) return zreply(`— ex: ${x}tiktokslide https://vt.tiktok.com/...`);

let api = await fetchJson(`https://www.tikwm.com/api/?url=${q}`);

if (!api || !api.data || !api.data.images || api.data.images.length === 0)
return zreply('Slide tidak tersedia pada video ini');

const template = {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 2
},
carouselMessage: {
cards: api.data.images.slice(0, 10).map((img, index) => ({
cardId: `card_${index}`,
card: {
header: {
title: `TikTok Slide ${index + 1} dari ${api.data.images.length}`,
subtitle: `URL: ${img.substring(0, 30)}...`,
imageMessage: {
url: img,
mimetype: 'image/jpeg'
}
},
body: `🖼️ Geser untuk melihat gambar selanjutnya.`,
footer: `Slide ke ${index + 1}`
}
}))
}
}
}
};

await client.sendMessage(m.chat, template);
}

break;
case 'tiktokaudio': {
if (!q) return zreply(`— ex: ${x}tiktokaudio https://vt.tiktok.com/...`);

let api = await fetchJson(`https://www.tikwm.com/api/?url=${q}`);

if (!api || !api.data || !api.data.music)
return zreply('Audio tidak ditemukan');

await client.sendMessage(m.chat, {
audio: { url: api.data.music }, 
mimetype: 'audio/mp4'
});
}
break;
case 'ytsearch': {
if (!q) return zreply(`— ex: ${x}ytsearch lathi`);

let res = await fetchJson(`https://api.ryzendesu.vip/api/search/youtube?query=${q}`);
if (!res || !res.result) return zreply('Hasil tidak ditemukan');

let teks = `🔎 *YouTube Search:* ${q}\n\n`;
let no = 1;

for (let vid of res.result.slice(0, 10)) {
teks += `${no++}. *${vid.title}*\n↳ Duration: ${vid.duration}\n↳ Link: ${vid.url}\n\n`;
}

zreply(teks.trim());
}
// --# End File JavaScript #-- \\
break;

default:
}
} catch (err) {
console.error(chalk.red('[ CATCH ERROR ]'), util.format(err));
}
};

let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
require('fs').unwatchFile(file)
console.log(chalk.greenBright(`[ UPDATED ] ${__filename} updated!`))
delete require.cache[file]
require(file)
})