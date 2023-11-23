require('dotenv').config();
const { Client, GatewayIntentBits } = require("discord.js");
const { readdir } = require('fs/promises');
const register = require("./register.js");
const twitter = require("./posters/twitterNews.js")

// TODO: POSSIBLY TURN THE COMMAND FILE INTO AN ARRAY
// TODO: OR DO SOMETHING WITH THE NAMING SCHEME

const client = new Client({ intents: [ GatewayIntentBits.Guilds ] });

const commandMap = new Map();

client.once("ready", async (c) => {
	// catching errors in the ready block is pointless
	// if anything here fails the bot won't function properly
	const commandData = (await readdir("./commands", "utf-8"))
		.filter(c => c.endsWith(".js"))
		.map(c => require("./commands/" + c));

	const toBeRegistered = commandData.map(c => c.commandInfo);
	await register(toBeRegistered);

	commandData.forEach(({ commandInfo, command }) => {
		commandMap.set(commandInfo.name, command);
	});

	const newsChannel = c.channels.cache.get(process.env.DEBUG_NEWS_CHANNEL);
	setInterval(() => { 
		twitter(newsChannel);
	}, 60 * 1000);
	
	console.log("Connected and ready!");
});

client.on("interactionCreate", interaction => {
	if (!interaction.isChatInputCommand()) return;
	commandMap.get(interaction.commandName)(interaction);
});

client.login(process.env.DISCORD_TOKEN);
