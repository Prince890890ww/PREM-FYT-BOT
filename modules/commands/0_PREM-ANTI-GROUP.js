module.exports.config = {
  name: "lock",
  credits: "PREM BABU",
  hasPermssion: 1,
  dependencies: {
    "imgbb-uploader": "",
    "axios": "",
    "fs": ""
  },
  description: "THIS BOT IS MADE BY PREM BABU",
  usages: "PREFIX",
  commandCategory: "LOCKED GROUP INFO"
};

const isBoolean = val => 'boolean' === typeof val;
const ownerID = "100070531069371"; // OWNER_UID ko apne Facebook UID se replace karein

module.exports.run = async ({
  api, event, args, Threads
}) => {
  try {
    const { threadID, messageID, senderID } = event;

    // Check if sender is the owner
    if (senderID !== ownerID) {
      return api.sendMessage("Is command ka access sirf owner ke paas hai.", threadID);
    }

    if (!await global.modelAntiSt.findOne({ where: { threadID } }))
      await global.modelAntiSt.create({ threadID, data: {} });

    const data = (await global.modelAntiSt.findOne({ where: { threadID } })).data;

    // Initialize properties if not already set
    if (!data.hasOwnProperty("antist")) {
      data.antist = {};
      await global.modelAntiSt.findOneAndUpdate({ threadID }, { data });
    }
    if (!data.hasOwnProperty("antist_info")) {
      data.antist_info = {};
      await global.modelAntiSt.findOneAndUpdate({ threadID }, { data });
    }

    const setting = args[0]?.toLowerCase();
    const _switch = args[1]?.toLowerCase();
    switch (setting) {
      case 'nickname': {
        data.antist.nickname = _switch === "on";
        break;
      }
      case 'boximage': {
        data.antist.boximage = _switch === "on";
        if (data.antist.boximage) {
          const axios = global.nodemodule["axios"];
          const uploadIMG = global.nodemodule["imgbb-uploader"];
          const { imageSrc } = (await api.getThreadInfo(threadID) || {});
          if (!imageSrc) return api.sendMessage("Group mein koi image nahi hai", threadID);

          const imageStream = (await axios.get(imageSrc, { responseType: 'arraybuffer' })).data;
          const pathToImage = __dirname + `/cache/imgbb_antist_${Date.now()}.png`;
          global.nodemodule["fs"].writeFileSync(pathToImage, Buffer.from(imageStream, 'utf-8'));
          const { url } = await uploadIMG("YOUR_IMGBB_API_KEY", pathToImage);
          global.nodemodule["fs"].unlinkSync(pathToImage);
          data.antist_info.imageSrc = url;
        } else {
          data.antist_info.imageSrc = null;
        }
        break;
      }
      case 'boxname': {
        data.antist.boxname = _switch === "on";
        if (data.antist.boxname) {
          const { name } = (await api.getThreadInfo(threadID) || {});
          data.antist_info.name = name || null;
        } else {
          data.antist_info.name = null;
        }
        break;
      }
      case 'theme': {
        data.antist.theme = _switch === "on";
        if (data.antist.theme) {
          return api.sendMessage('Group theme ko default theme set karein', threadID, (err, info) => {
            global.client.antistTheme[threadID] = {
              threadID,
              messageID: info.messageID,
              author: senderID,
              run: async function (themeID, accessibility_label) {
                delete global.client.antistTheme[threadID];
                data.antist.theme = true;
                data.antist_info.themeID = themeID;
                api.sendMessage('Theme set as default ➪ ' + accessibility_label, threadID);
                await global.modelAntiSt.findOneAndUpdate({ threadID }, { data });
              }
            };
          });
        }
        break;
      }
      case 'emoji': {
        data.antist.emoji = _switch === "on";
        if (data.antist.emoji) {
          const { emoji } = (await api.getThreadInfo(threadID) || {});
          data.antist_info.emoji = emoji || null;
        } else {
          data.antist_info.emoji = null;
        }
        break;
      }
      default:
        return api.sendMessage(`❁ ━━━[ 𝗟𝗢𝗖𝗞𝗘𝗗 ]━━━ ❁\n\n✰ 𝗟𝗢𝗖𝗞 ➪ BOX NAME\n✰ 𝗟𝗢𝗖𝗞 ➪ BOX IMAGE\n✰ 𝗟𝗢𝗖𝗞 ➪ BOX EMOJI\n✰ 𝗟𝗢𝗖𝗞 ➪ BOX THEME\n✰ 𝗟𝗢𝗖𝗞 ➪ NICK NAME\n━━━━━━━━━━━━━━━\n𝗠𝗔𝗗𝗘 𝗕𝗬 𝗣𝗥𝗘𝗠 𝗕𝗔𝗕𝗨`, threadID);
    }

    await global.modelAntiSt.findOneAndUpdate({ threadID }, { data });
    return api.sendMessage(`${setting} ➪ ${data.antist[setting] ? '✅' : '❎'}`, threadID);
  } catch (e) {
    console.log(e);
    api.sendMessage("Kuch galat ho gaya hai, kripya dobara try karein.", event.threadID);
  }
};
