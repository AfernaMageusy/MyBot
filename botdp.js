const { Telegraf } = require('telegraf');
const mineflayer = require('mineflayer');
const readline = require('readline');

const telegramBot = new Telegraf('7546864528:AAEnWbpPmuMtsuEKZ1IJ0MRlXpqa0znVAT0');
const bot = new Telegraf('-1002651805346');

const Vec3 = require('vec3');
const fs = require('fs');



const originalJSONParse = JSON.parse;
JSON.parse = function (text, reviver) {
  if (typeof text !== 'string') return originalJSONParse(text, reviver);
  try {
    return originalJSONParse(text, reviver);
  } catch (e) {
    const fixed = text.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
    return originalJSONParse(fixed, reviver);
  }
};

// 📂 Данные
const blacklist = ['Тест', 'Тест2'];
let joinDates = loadJoinDates();
let notifiedPlayers = {};

const RECONNECT_DELAY = 30000;
const HOME_INTERVAL = 30000;
const LOOK_INTERVAL = 50;
const ADVERT_INTERVALS = [180000, 360000, 540000];

let mcBot;
let intervals = [];

function loadJoinDates() {
  try {
    return JSON.parse(fs.readFileSync('joinDates.json', 'utf8'));
  } catch {
    return {};
  }
}

function saveJoinDates(data) {
  fs.writeFileSync('joinDates.json', JSON.stringify(data, null, 2));
}

function clearAllIntervals() {
  for (const id of intervals) clearInterval(id);
  intervals = [];
}

function reconnect() {
  console.log(`🔁 Переподключение через ${RECONNECT_DELAY / 1000} секунд...`);
  setTimeout(() => createBot(), RECONNECT_DELAY);
}

function createBot() {
  mcBot = mineflayer.createBot({
    host: 'mc.mineblaze.net',
    port: 25565,
    username: 'Dragon_Bot',
    password: '271236',
    version: '1.16.5'
  });



  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  rl.setPrompt("> ");
  rl.prompt();
  rl.on('line', (input) => {
    bot.chat(input);
    rl.prompt();
  });





  mcBot.on('message', (message) => {
    const msg = message.toString();
    if (msg.includes('› Игрок [Владелец] ☑ Aferna_Mageusy подключился и пошел работать')) {
      mcBot.chat('/cc &a&l> &b&l&nВладелец клана&a&l < &#FF0000&lAferna_Mageusy &f&lприсоединился и пошёл работать!')
    }
  })

  mcBot.on('message', (message) => {
    const msg = message.toString();
    if (msg.includes('› Игрок [Опка] Aferna_Mageusy2 зашел на сервер.')) {
      mcBot.chat('/cc &a&l> &b&l&nВладелец клана с твинка&a&l < &#FF0000&lAferna_Mageusy2 &f&lприсоединился и пошёл работать!')
    }
  })


  mcBot.on('message', (message) => {
    const msg = message.toString();
    if (msg.includes('› Игрок [АнтиГрифер] vaseniz зашел на сервер.')) {
      mcBot.chat('/cc &a&l> Заместитель Владельца клана &a&l< &#FF0000&lvaseniz &f&lприсоединился и пошёл работать!')
    }
  })


  mcBot.once('spawn', () => {
      console.log('✅ Бот вошёл в игру!');
      mcBot.chat('/reg 271236');
      mcBot.chat('/login 271236');
      mcBot.chat('/s3');
      mcBot.chat('/warp n_l');

      // 📌 Перемещение домой
      intervals.push(setInterval(() => {
        mcBot.chat('/warp n_l');
      }, HOME_INTERVAL));

      // 📣 Рекламные сообщения
      const messages = [
        '!&4&lAnti&3&lChebrin &f&l- это не просто клан, &e&lэто удобный отдых для вас и ваших друзей! &b&lСкорее подавай на модератора клана и помогай развиваться нашему клану! &F&L/warp AC&e&l или &f&l/c join AntiChebrin.',
        '!&a&lДавно искали удобный клан для вас и ваших друзей? &4&lТогда вам к нам! &b&lУ нас вы можете стать администратором клана или же просто участником клана. &9&lСкорее вступай к нам в клан! &f&l/warp AC&e&l или &f&l/c join AntiChebrin.',
        '!&c&lДавно хотел быть в уютном клане? Тогда тебе в клан &4&lAnti&3&lChebrin! &b&lУ нас ты можешь найти всё! &6&lЖдём тебя на &f&l/warp AC&e&l или &f&l/c join AntiChebrin.'
      ];
      messages.forEach((msg, i) => {
        intervals.push(setInterval(() => mcBot.chat(msg), ADVERT_INTERVALS[i]));
      });

      // 👁️ Слежение за ближайшим игроком
      intervals.push(setInterval(() => {
        let nearest = null, minDist = Infinity;
        for (const id in mcBot.entities) {
          const e = mcBot.entities[id];
          if (e.type === 'player' && e.username !== mcBot.username) {
            const dist = mcBot.entity.position.distanceTo(e.position);
            if (dist < minDist) {
              minDist = dist;
              nearest = e;
            }
          }
        }
        if (nearest) {
          mcBot.lookAt(nearest.position.offset(0, nearest.height || 1.2, 0));
        }
      }, LOOK_INTERVAL));
    });


    mcBot.on('message', (jsonMsg) => {
      const message = jsonMsg.toString();
      console.log(message);
      const matchRequest = message.match(/Игрок (.+) подал заявку на вступление в ваш клан/);
      if (matchRequest) {
        const originalName = matchRequest[1];
        const lowerName = originalName.toLowerCase();

        console.log(`📥 Заявка от: ${originalName}`);
        const isBlacklisted = blacklist.map(n => n.toLowerCase()).includes(lowerName);

        if (isBlacklisted) {
          mcBot.chat(`/c deny ${originalName}`);
          mcBot.chat(`/c deny ${originalName}`);
          console.log(`❌ ${originalName} в черном списке. Заявка отклонена.`);
          notifiedPlayers[lowerName] = true;
        } else {
          mcBot.chat(`/c accept ${originalName}`);
          mcBot.chat(`/c accept ${originalName}`);
          console.log(`✅ ${originalName} принят в клан.`);

          if (!joinDates[lowerName]) {
            const now = new Date();
            const formatted = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}/${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            joinDates[lowerName] = formatted;
            saveJoinDates(joinDates);

            console.log(`[JOIN] ${originalName} вступил в клан. Дата: ${formatted}`);
            setTimeout(() => {
              mcBot.chat(`/cc &a&lПривет&f ${originalName}! Ты вступил в &c&lсамый&f лучший клан "&4&lᴀɴᴛɪ&3&lᴄʜᴇʙʀɪɴ&f"! Напиши &a/cc бoт привет&f!`);
            }, 1000);
          }
        }
      }
    });

    mcBot.on('chat', (username, message) => {
      if (message.includes('mineblaze.net/antibot')) {
        console.log('⚠️ Обнаружена капча. Ожидание кика...');
      }
    })

    mcBot.on('kicked', (reason) => {
      console.log('⛔ Бот был кикнут:', reason);
      clearAllIntervals();
      reconnect();
    });

    mcBot.on('end', () => {
      console.log('🔌 Подключение к серверу прервано');
      clearAllIntervals();
      reconnect();
    });

    mcBot.on('error', (err) => console.error('Ошибка:', err));
    mcBot._client.on('error', (err) => console.error('Ошибка клиента:', err))
}
createBot();




