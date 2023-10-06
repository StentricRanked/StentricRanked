const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'leaderboard',
  description: 'Show the top 10 most active users',
  execute: async (message) => {
    if (!message.content.startsWith(prefix + 'leaderboard')) return;

    const guildId = message.guild.id;

    const users = [];

    for (const member of message.guild.members.cache.values()) {
      const userId = member.id;

      const key = `${guildId}-${userId}`;
      const user = await db.get(key) || { score: 0, level: 0 };

      users.push(user);
    }

    users.sort((a, b) => b.level - a.level);

    users.slice(0, 10);

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('Leaderboard')
      .setDescription('The top 10 most active users in this server');

    embed.addField('\u200b', 'Rank', true);
    embed.addField('\u200b', 'Name', true);
    embed.addField('\u200b', 'Level', true);
    embed.addField('\u200b', 'Score', true);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      const userId = user.id;
      const userName = message.guild.members.cache.get(userId).user.username;

      const level = user.level;
      const score = user.score;

      embed.addField('\u200b', i + 1, true);
      embed.addField('\u200b', userName, true);
      embed.addField('\u200b', level, true);
      embed.addField('\u200b', score, true);
    }

    await message.channel.send({ embeds: [embed] });
  },
};
