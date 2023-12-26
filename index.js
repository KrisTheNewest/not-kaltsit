require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const { readdir, writeFile } = require('fs/promises');

const register = require("./register.js");
const queryDataBase = require('./queryDataBase.js');
const readableDate = require("./util/readableDate.js");

const twitterNews = require("./posters/twitterNews.js");
// TODO: WEIBO

const client = new Client({ intents: [ GatewayIntentBits.Guilds ] });
// TODO: DATABASE CONNECTION

const commandMap = new Map();
const cache = new Map();

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

	const data = await queryDataBase()

	data.forEach(({ server, /*botLang, gameLang*/ ...ids }) => {
		const pairs = Object.entries(ids);
		pairs.forEach(([name, id]) => {
			if (!cache.has(name)) cache.set(name, new Map());
			if (id) cache.get(name).set(server, id);
		});
	});

	setInterval(() => {
		twitterNews(c, cache);
		// save date to prevent reposts of old posts
		writeFile("./logs/time.json", JSON.stringify(readableDate()));
	}, 60 * 1000);

	c.user.setActivity({ name: "Sending news from Twitter!", type: ActivityType.Custom, });
	console.log("Connected and ready!");
});

client.on("interactionCreate", interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = commandMap.get(interaction.commandName);
	command(interaction, cache);
});

process.on('SIGINT', async () => {
	// pm2 fires this event before exit, allowing a graceful shutdown
	try {
		await writeFile("./logs/time.json", JSON.stringify(readableDate()));
		await client.destroy();
		process.exit(0);
	}
	catch (err) {
		console.error(err);
		process.exit(1);
	}
});

client.login(process.env.DISCORD_TOKEN);
