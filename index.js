const discordjs = require('discord.js');
const dotenv = require('dotenv');
const Keyv = require('keyv');
const prefix = process.env.PREFIX;
const fs = require('fs');

const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

client.on("ready", () => {
  console.log(`${client.user} is now online!`);
});

const db = new Keyv('sqlite://db.sqlite');

function getLevel(score) {
  return Math.floor(Math.sqrt(score / 10));
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;
  const guildId = message.guild.id;

  const key = `${guildId}-${userId}`;
  const user = await db.get(key) || { score: 0, level: 0 };

  user.score++;

  const currentLevel = user.level;
  const newLevel = getLevel(user.score);

  if (newLevel > currentLevel) {
    user.level = newLevel;

    const roleId = process.env[`ROLE_${newLevel}`];

    const role = message.guild.roles.cache.get(roleId);

    if (role) {
      await message.member.roles.add(role);

      await message.channel.send(`Congratulations ${message.author}, you have reached level ${newLevel} and earned the ${role.name} role!`);
    }
  }

  await db.set(key, user);
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  client.commands.set(command.name, command);
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    await message.reply('There was an error while executing that command.');
  }
});

async function handleCommand(message, command, args) {
  if (command.permissions) {
    const userPermissions = message.member.permissions.toArray();

    for (const permission of command.permissions) {
      if (!userPermissions.includes(permission)) {
        await message.reply(`You need the ${permission} permission to use this command.`);
        return;
      }
    }
  }

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    await message.reply('There was an error while executing that command.');
  }
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (!command) return;

  await handleCommand(message, command, args);
});


client.login(process.env.BOT_TOKEN);