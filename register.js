require('dotenv').config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = async function register(commands) {
	const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
	const cmdStrings = commands.map(command => command.toJSON());

	return rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: cmdStrings })
}
