import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({ intents: [ GatewayIntentBits.Guilds ] });

client.once("ready", (c) => {
	console.log("Ready!", c);
	client.destroy();
});

client.login(process.env.DISCORD_TOKEN);
