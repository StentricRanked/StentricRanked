const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'rank',
  description: 'Check your rank',
  execute: async (message) => {
    if (!message.content.startsWith(prefix + 'rank')) return;

    const userId = message.author.id;
    const guildId = message.guild.id;

    const key = `${guildId}-${userId}`;
    const user = await db.get(key) || { score: 0, level: 0 };

    const score = user.score;
    const level = user.level;

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setThumbnail(message.author.displayAvatarURL())
      .setTitle(`${message.author.username}'s Rank`)
      .addField('Score', score, true)
      .addField('Level', level, true)
      .addField('Progress', getProgressBar(score), false);

    await message.channel.send({ embeds: [embed] });
  },
};

function getProgressBar(score) {
  const currentLevel = getLevel(score);
  const nextLevel = currentLevel + 1;

  const currentLevelScore = Math.pow(currentLevel * 10, 2);
  const nextLevelScore = Math.pow(nextLevel * 10, 2);

  const progress = ((score - currentLevelScore) / (nextLevelScore - currentLevelScore)) * 100;

  const progressBar = '▬'.repeat(10).split('');
  progressBar[Math.floor(progress / 10)] = '🔘';
  return progressBar.join('');
};