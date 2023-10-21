const { Client, GatewayIntentBits  } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

// Define an array to hold queued players
const queue = [];
const maxQueueSize = 4; // Set the maximum number of players allowed in the queue
const confirmationTimeout = 90000; // 90 seconds in milliseconds

// Command prefix
const prefix = '!';

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'queue') {
        // Execute the queue command
        queuePlayer(message.author);
    }
});

function queuePlayer(player) {
    if (queue.includes(player)) {
        return player.send('You are already in the queue.');
    }

    if (queue.length >= maxQueueSize) {
        displayQueueFilledScreen(player);
        return;
    }

    queue.push(player);
    player.send('You have been added to the queue.');

    if (queue.length >= 2) {
        // If there are enough players in the queue, start the confirmation process
        initiateConfirmation(queue.slice(0, 2));
    }
}

function displayQueueFilledScreen(player) {
    const queueFilledEmbed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('Queue Filled!')
        .setDescription('The queue has reached the maximum number of players.')
        .addField('Players in Queue:', queue.map(player => player.username).join('\n'))
        .setTimestamp();

    player.send({ embeds: [queueFilledEmbed] });
}

async function initiateConfirmation(players) {
    const confirmEmbed = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle('Game Confirmation')
        .setDescription('Are you ready to start the game?')
        .addField('Players:', players.map(player => player.username).join('\n'))
        .setTimestamp();

    const confirmationMessage = await players[0].send({ embeds: [confirmEmbed] });
    await confirmationMessage.react('✅'); // Add a checkmark (✅) reaction for confirmation
    await confirmationMessage.react('❌'); // Add a cross (❌) reaction for rejection

    const filter = (reaction, user) => {
        return ['✅', '❌'].includes(reaction.emoji.name) && players.includes(user);
    };

    confirmationMessage.awaitReactions({ filter, time: confirmationTimeout })
        .then((collected) => {
            const confirmations = collected.get('✅');
            if (confirmations && confirmations.size === players.length) {
                startGame(players);
            } else {
                players.forEach(player => player.send('Game confirmation timed out or not all players confirmed.'));
                queue.push(...players); // Return players to the queue
            }
        })
        .catch(() => {
            players.forEach(player => player.send('Game confirmation timed out or not all players confirmed.'));
            queue.push(...players); // Return players to the queue
        });
}

function startGame(players) {
    // Logic for starting a game with the specified players
    // You can create a game instance, assign roles, and handle game-specific actions here
    console.log('Starting a game with players:', players.map(player => player.tag));
}

function displayQueueFilledScreen(player) {
    const queueFilledEmbed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('Queue Filled!')
        .setDescription('The queue has reached the maximum number of players.')
        .addField('Players in Queue:', queue.map(player => player.username).join('\n'))
        .setTimestamp();

    player.send({ embeds: [queueFilledEmbed] });
}
function startGame(players) {
    // Logic for starting a game with the specified players
    // You can create a game instance, assign roles, and handle game-specific actions here
    console.log('Starting a game with players:', players.map(player => player.tag));
}

const databasePath = 'elo_ratings.sqlite'; // SQLite database file

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore messages from other bots
    if (!message.content.startsWith(prefix)) return; // Ignore messages that don't start with the prefix

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Handle Elo-related commands
    if (command === 'rank') {
        // Implement a command to check a user's Elo rating
    } else if (command === 'win') {
        // Implement a command to report a win for a user
    } else if (command === 'lose') {
        // Implement a command to report a loss for a user
    } else if (command === 'leaderboard') {
        // Implement a command to show the Elo leaderboard
    }
});

// Function to calculate Elo ratings (K-factor can be adjusted)
function calculateEloRating(playerRating, opponentRating, result) {
    const K = 10; // Adjust this value as needed
    const expected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    return playerRating + K * (result - expected);
}

// Initialize the SQLite database
async function initializeDatabase() {
    const db = await open({
        filename: databasePath,
        driver: sqlite3.Database
    });

    // Create an Elo ratings table if it doesn't exist
    await db.exec(`CREATE TABLE IF NOT EXISTS elo_ratings (
        user_id TEXT PRIMARY KEY,
        rating INTEGER DEFAULT 150
    )`);

    return db;
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore messages from other bots
    if (!message.content.startsWith(prefix)) return; // Ignore messages that don't start with the prefix

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Handle Elo-related commands
    if (command === 'rank') {
        // Command to check a user's Elo rating
        const user = message.mentions.users.first() || message.author;

        // Retrieve the user's Elo rating from the database (you need to implement this function)
        const userRating = await getEloRating(user.id);

        message.reply(`${user.tag}'s Elo rating is ${userRating}`);
    } else if (command === 'win') {
        // Command to report a win for a user
        const opponent = message.mentions.users.first();

        if (!opponent) {
            return message.reply('You need to mention the opponent.');
        }

        // Update Elo ratings for the player and the opponent (you need to implement this function)
        updateEloRatings(message.author, opponent, 1);

        message.reply(`Match result recorded. Congratulations on the win!`);
    } else if (command === 'lose') {
        // Command to report a loss for a user
        const opponent = message.mentions.users.first();

        if (!opponent) {
            return message.reply('You need to mention the opponent.');
        }

        // Update Elo ratings for the player and the opponent (you need to implement this function)
        updateEloRatings(message.author, opponent, 0);

        message.reply(`Match result recorded. Better luck next time!`);
    } else if (command === 'leaderboard') {
        // Command to show the Elo leaderboard
        const leaderboard = await getEloLeaderboard(message.guild.id);

        if (leaderboard.length === 0) {
            return message.reply('The leaderboard is empty.');
        }

        let leaderboardMessage = 'Elo Leaderboard:\n';
        leaderboard.forEach((entry, index) => {
            leaderboardMessage += `${index + 1}. ${entry.user.tag} - ${entry.rating}\n`;
        });

        message.reply(leaderboardMessage);
    }
});

// Get a user's Elo rating from the database
async function getEloRating(userId) {
    const db = await initializeDatabase();
    const query = await db.get('SELECT rating FROM elo_ratings WHERE user_id = ?', userId);
    await db.close();
    return query ? query.rating : 150; // Default rating if not found
}

// Update Elo ratings for both players based on the match result
async function updateEloRatings(playerId, opponentId, result) {
    const playerRating = await getEloRating(playerId);
    const opponentRating = await getEloRating(opponentId);

    // Calculate new ratings using the Elo formula
    const newPlayerRating = calculateEloRating(playerRating, opponentRating, result);
    const newOpponentRating = calculateEloRating(opponentRating, playerRating, 1 - result); // Opponent's result is the opposite

    const db = await initializeDatabase();

    // Update the player's rating
    await db.run('INSERT OR REPLACE INTO elo_ratings (user_id, rating) VALUES (?, ?)', playerId, newPlayerRating);
    // Update the opponent's rating
    await db.run('INSERT OR REPLACE INTO elo_ratings (user_id, rating) VALUES (?, ?)', opponentId, newOpponentRating);

    await db.close();
}

// Get the top N players in the Elo leaderboard
async function getEloLeaderboard(serverId, limit = 10) {
    const db = await initializeDatabase();
    const query = await db.all('SELECT user_id, rating FROM elo_ratings ORDER BY rating DESC LIMIT ?', limit);
    await db.close();

    const leaderboard = [];

    // Fetch user tags from Discord and add them to the leaderboard
    for (const row of query) {
        const user = await client.users.fetch(row.user_id);
        leaderboard.push({ user: user, rating: row.rating });
    }

    return leaderboard;
}

const roleThresholds = [
    { eloThreshold: 0, roleName: 'Iron' },
    { eloThreshold: 150, roleName: 'Bronze' },
    { eloThreshold: 300, roleName: 'Silver' },
    { eloThreshold: 450, roleName: 'Gold' },
    { eloThreshold: 600, roleName: 'Platinum' },
    { eloThreshold: 775, roleName: 'Iron' },
    { eloThreshold: 1000, roleName: 'Diamond' },
    { eloThreshold: 1250, roleName: 'Unreal' },
    // Add more thresholds and roles as needed
];

async function updateEloRatings(playerId, opponentId, result) {
    // Fetch the current Elo ratings of both players
    const playerRating = await getEloRating(playerId);
    const opponentRating = await getEloRating(opponentId);
   
    // Calculate the expected outcome for each player
    const expectedPlayer = 1 / (1 + 10 ** ((opponentRating - playerRating) / 400));
    const expectedOpponent = 1 - expectedPlayer;

    // Calculate new ratings using the Elo formula
    const newPlayerRating = playerRating + K * (result - expectedPlayer);
    const newOpponentRating = opponentRating + K * ((1 - result) - expectedOpponent)
  
    // Define a K-factor to control the magnitude of rating changes
    const K = 32; // You can adjust this value as needed

    // Update the ratings in the database (you will need to implement this function)
    updateDatabaseWithNewRatings(playerId, newPlayerRating);
    updateDatabaseWithNewRatings(opponentId, newOpponentRating);

    // Assign roles based on Elo thresholds
    const playerRoles = await assignRoles(playerId, newPlayerRating);

    const db = await initializeDatabase();

    // Update the player's rating
    await db.run('INSERT OR REPLACE INTO elo_ratings (user_id, rating) VALUES (?, ?)', playerId, newPlayerRating);
    // Update the opponent's rating
    await db.run('INSERT OR REPLACE INTO elo_ratings (user_id, rating) VALUES (?, ?)', 
    opponentId, newOpponentRating);

    // Set the player's nickname to include their Elo ranking
    const player = await message.guild.members.fetch(playerId);
    const newNickname = `[${newPlayerRating}] ${player.user.username}`;
    await player.setNickname(newNickname);
      await db.close();
}

async function assignRoles(userId, newRating) {
    const member = await message.guild.members.fetch(userId);
    const rolesToAssign = [];

    for (const threshold of roleThresholds) {
        if (newRating >= threshold.eloThreshold) {
            const role = message.guild.roles.cache.find((role) => role.name === threshold.roleName);
            if (role && !member.roles.cache.has(role.id)) {
                rolesToAssign.push(role);
            }
        }
    }

    // Assign roles to the user
    if (rolesToAssign.length > 0) {
        await member.roles.add(rolesToAssign);
    }

    return rolesToAssign;
}

const mySecret = process.env['TOKEN']
