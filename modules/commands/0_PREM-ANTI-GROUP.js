module.exports.config = {
  name: "anti",
  credits: "DungUwU",
  hasPermssion: 1,
  dependencies: {
    "imgbb-uploader": "",
    "axios": "",
    "fs": ""
  },
  description: "समूह में किसी चीज़ को प्रतिबंधित करें",
  usages: "< उपनाम/समूह चित्र/समूह नाम >",
  commandCategory: "समूह चैट"
};

const isBoolean = val => 'boolean' === typeof val;

module.exports.run = async ({
  api, event, args, Threads
}) => {
  try {
    const {
      threadID,
      messageID,
      senderID
    } = event;
    if (!await global.modelAntiSt.findOne({
      where: {
        threadID
      }
    }))
      await global.modelAntiSt.create({
        threadID, data: {}
      });


    try {
      if (senderID == threadID)
        return;
      const data = (await global.modelAntiSt.findOne({
        where: {
          threadID
        }
      })).data;
      if (!data.hasOwnProperty("antist")) {
        data.antist = {};
        await global.modelAntiSt.findOneAndUpdate({
          threadID
        }, {
          data
        });
      }
      if (!data.hasOwnProperty("antist_info")) {
        data.antist_info = {};
        await global.modelAntiSt.findOneAndUpdate({
          threadID
        }, {
          data
        });
      }

      const setting = args[0]?.toLowerCase();
      const _switch = args[1]?.toLowerCase();
      switch (setting) {
        case 'nickname': {
          if (_switch == "on")
            data.antist.nickname = true;
          else if (_switch == "off")
            data.antist.nickname = false;
          else
            data.antist.nickname = !data.antist.nickname;

          if (data.antist.nickname === true) {
            const _info = data.antist_info.nicknames ? data.antist_info : (await api.getThreadInfo(threadID) || {});
            const {
              nicknames
            } = _info;
            if (!nicknames) return api.sendMessage("[ मोड ] → आदेश चलाने में त्रुटि हुई", threadID);
            data.antist_info.nicknames = nicknames;
          } else {
            data.antist_info.nicknames = null;
          }
          break;
        }
        case 'boximage': {
          if (_switch == "on")
            data.antist.boximage = true;
          else if (_switch == "off")
            data.antist.boximage = false;
          else
            data.antist.boximage = !(isBoolean(data.antist.boximage) ? data.antist.boximage : false);

          if (data.antist.boximage == true) {
            const fs = global.nodemodule["fs"];
            const axios = global.nodemodule["axios"];
            const uploadIMG = global.nodemodule["imgbb-uploader"];

            const _info = data.antist_info.imageSrc ? data.antist_info : (await api.getThreadInfo(threadID) || {});
            const {
              imageSrc
            } = _info;
            if (!imageSrc) return api.sendMessage("आपके समूह में कोई चित्र नहीं है...", threadID);
            const imageStream = (await axios.get(imageSrc, {
              responseType: 'arraybuffer'
            })).data;
            const pathToImage = __dirname + `/cache/imgbb_antist_${Date.now()}.png`;
            fs.writeFileSync(pathToImage, Buffer.from(imageStream, 'utf-8'));
            const {
              url
            } = await uploadIMG("c4847250684c798013f3c7ee322d8692", pathToImage);

            fs.unlinkSync(pathToImage);

            data.antist_info.imageSrc = url;
          } else {
            data.antist_info.imageSrc = null;
          }

          break;
        }
        case 'boxname': {
          if (_switch == "on")
            data.antist.boxname = true;
          else if (_switch == "off")
            data.antist.boxname = false;
          else
            data.antist.boxname = !(isBoolean(data.antist.boxname) ? data.antist.boxname : false);


          if (data.antist.boxname === true) {
            const _info = data.antist_info.name ? data.antist_info : (await api.getThreadInfo(threadID) || {});
            const {
              name
            } = _info;
            if (!name) return api.sendMessage("समूह का कोई नाम नहीं है", threadID);
            data.antist_info.name = name;
          } else {
            data.antist_info.name = null;
          }

          break;
        }
        case "theme": {
          if (_switch == "on")
            data.antist.theme = true;
          else if (_switch == "off")
            data.antist.theme = false;
          else
            data.antist.theme = !(isBoolean(data.antist.theme) ? data.antist.theme : false);

          if (!global.client.antistTheme)
            global.client.antistTheme = {};
          if (data.antist.theme === true)
            return api.sendMessage('समूह सेटिंग में जाकर एक थीम को डिफॉल्ट थीम के रूप में सेट करें', threadID, (err, info) => {
              global.client.antistTheme[threadID] = {
                threadID,
                messageID: info.messageID,
                author: senderID,
                run: async function (themeID, accessibility_label) {
                  delete global.client.antistTheme[threadID];
                  const data = (await global.modelAntiSt.findOne({
                    where: {
                      threadID
                    }
                  })).data;
                  if (!data.hasOwnProperty("antist")) {
                    data.antist = {};
                    await global.modelAntiSt.findOneAndUpdate({
                      threadID
                    }, {
                      data
                    });
                  }
                  if (!data.hasOwnProperty("antist_info")) {
                    data.antist_info = {};
                    await global.modelAntiSt.findOneAndUpdate({
                      threadID
                    }, {
                      data
                    });
                  }

                  data.antist.theme = true;
                  data.antist_info.themeID = themeID;
                  api.sendMessage('डिफॉल्ट थीम के रूप में सेट: ' + accessibility_label, threadID);
                  await global.modelAntiSt.findOneAndUpdate({
                    threadID
                  }, {
                    data
                  });
                }
              };
            });
          break;
        }
        case "emoji": {
          if (_switch == "on")
            data.antist.emoji = true;
          else if (_switch == "off")
            data.antist.emoji = false;
          else
            data.antist.emoji = !(isBoolean(data.antist.emoji) ? data.antist.emoji : false);


          if (data.antist.emoji === true) {
            const _info = data.antist_info.emoji ? data.antist_info : (await api.getThreadInfo(threadID) || {});
            const {
              emoji
            } = _info;
            data.antist_info.emoji = emoji;
          } else {
            data.antist_info.emoji = null;
          }

          break;
        }

        default:
          return api.sendMessage(`🛠==== [ निर्देश ] ====🛠\n━━━━━━━━━━━━━━━\n\n• 𝗮𝗻𝘁𝗶 𝗯𝗼𝘅𝗻𝗮𝗺𝗲: समूह का नाम बदलने पर रोक\n• 𝗮𝗻𝘁𝗶 𝗯𝗼𝘅𝗶𝗺𝗮𝗴𝗲: समूह की तस्वीर बदलने पर रोक\n• 𝗮𝗻𝘁𝗶 𝗻𝗶𝗰𝗸𝗻𝗮𝗺𝗲: उपनाम बदलने पर रोक\n• 𝗮𝗻𝘁𝗶 𝗲𝗺𝗼𝗷𝗶: समूह के आइकन बदलने पर रोक\n• 𝗮𝗻𝘁𝗶 𝘁𝗵𝗲𝗺𝗲: समूह की थीम बदलने पर रोक`, threadID);
      }

      await global.modelAntiSt.findOneAndUpdate({
        threadID
      }, {
        data
      });
      return api.sendMessage(`[ मोड ] → एंटी ${setting} मोड: ${data.antist[setting] ? 'चालू' : 'बंद'}`, threadID);
    } catch (e) {
      console.log(e);
      api.sendMessage("[ मोड ] → आदेश चलाने में त्रुटि हुई", threadID);
    }
  }
  catch (err) {
    console.log(err)
  }
};
