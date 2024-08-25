const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const mongoose = require('mongoose');

// Validate environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'MONGODB_URL', 'CLIENT_ID'];
requiredEnvVars.forEach(envVar => {
	if (!process.env[envVar]) {
		console.error(`Missing required environment variable: ${envVar}`);
		process.exit(1);
	}
});

const CLIENT_ID = process.env.CLIENT_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_IDS = process.env.GUILD_IDS ? process.env.GUILD_IDS.split(',') : [];

// Initialize the client
// Optimize Intents - Only include the ones your bot actually needs
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		// ... add other necessary intents
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Command collection
client.commands = new Collection();

// Function to recursively load commands from a directory (async)
async function loadCommands(dir) {
	try {
		const files = await fs.promises.readdir(dir);
		const loadPromises = files.map(async file => {
			const filePath = path.join(dir, file);
			const fileStat = await fs.promises.stat(filePath);

			if (fileStat.isDirectory()) {
				await loadCommands(filePath);
			} else if (file.endsWith('.js')) {
				const command = require(filePath);
				// Use hasOwnProperty() to check for properties
				if (command.hasOwnProperty('data') && command.hasOwnProperty('execute')) {
					client.commands.set(command.data.name, command);

					if (command.data.aliases) {
						for (const alias of command.data.aliases) {
							client.commands.set(alias, command);
						}
					}
				} else {
					console.warn(
						`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
					);
				}
			}
		});

		await Promise.all(loadPromises);
	} catch (err) {
		console.error('Error loading commands:', err);
	}
}

// Load commands from the 'commands' directory
loadCommands(path.join(__dirname, 'commands'));

// Event handling (async)
const loadEvents = async dir => {
	try {
		const eventFiles = (await fs.promises.readdir(dir)).filter(file => file.endsWith('.js'));

		const eventPromises = eventFiles.map(async file => {
			const event = require(path.join(dir, file));
			if (event.once) {
				client.once(event.name, (...args) => event.execute(...args));
			} else {
				client.on(event.name, (...args) => event.execute(...args));
			}
		});

		await Promise.all(eventPromises);
	} catch (err) {
		console.error('Error loading events:', err);
	}
};

loadEvents(path.join(__dirname, 'events'));

// MongoDB connection
async function connectToMongoDB(retries = 5) {
	try {
		mongoose.set('strictQuery', false);
		await mongoose.connect(process.env.MONGODB_URL);
		console.log('Connected to MongoDB');
	} catch (error) {
		console.error(`Failed to connect to MongoDB: ${error.message}`);
		if (retries > 0) {
			console.log(`Retrying to connect to MongoDB (${retries} attempts left)...`);
			setTimeout(() => connectToMongoDB(retries - 1), 5000);
		} else {
			console.error('Exhausted all retries. Shutting down...');
			process.exit(1);
		}
	}
}

// Deploy commands
const deployCommands = async () => {
	const commands = [];
	// Set the base directory for your commands
	const commandsDir = path.join(__dirname, 'commands');

	// Function to recursively get commands from subfolders
	function getCommandsFromDir(dirPath) {
		const files = fs.readdirSync(dirPath);

		for (const file of files) {
			const filePath = path.join(dirPath, file);
			const stat = fs.statSync(filePath);

			if (stat.isDirectory()) {
				getCommandsFromDir(filePath);
			} else if (file.endsWith('.js')) {
				const command = require(filePath);
				if (command.data && command.execute) {
					commands.push(command.data.toJSON());
				} else {
					console.warn(
						`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
					);
				}
			}
		}
	}

	// Start getting commands from the base directory
	getCommandsFromDir(commandsDir);

	const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// Deploy global commands
		await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
		console.log('Successfully deployed global commands.');

		// Handle guild-specific commands if needed (example using a loop)
		// for (const guildId of GUILD_IDS) {
		//   try {
		//     const data = await rest.put(
		//       Routes.applicationGuildCommands(CLIENT_ID, guildId),
		//       { body: commands }
		//     );
		//     console.log(
		//       `Successfully reloaded ${data.length} commands for guild ${guildId}.`
		//     );
		//   } catch (error) {
		//     console.error(
		//       `Failed to deploy commands for guild ${guildId}:`,
		//       error
		//     );
		//   }
		// }
	} catch (error) {
		console.error('Error deploying commands:', error);
	}
};

// Graceful shutdown
process.on('SIGINT', async () => {
	console.log('Shutting down gracefully...');
	await mongoose.connection.close();
	client.destroy();
	process.exit(0);
});

// Login to Discord and start the bot
(async () => {
	try {
		await connectToMongoDB();
		await deployCommands();
		await client.login(DISCORD_TOKEN);
	} catch (error) {
		console.error(`Failed to start the bot: ${error.message}`);
		process.exit(1);
	}
})();
