require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const { readdir } = require('fs/promises');
const register = require("./register.js");

const twitterNews    = require("./posters/twitterNews.js")

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

	setTimeout(() => { 
		twitterNews(c);
	}, 60 * 1000);

	c.user.setActivity({ name: "Vibing!", type: ActivityType.Custom, });
	console.log("Connected and ready!");
});

client.on("interactionCreate", interaction => {
	if (!interaction.isChatInputCommand()) return;
	commandMap.get(interaction.commandName)(interaction);
});

client.login(process.env.DISCORD_TOKEN);
