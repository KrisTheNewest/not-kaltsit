const { SlashCommandBuilder } = require('@discordjs/builders');

const commandInfo = new SlashCommandBuilder().setName('ping').setDescription('Pong!');

function command(interaction) {
	interaction.reply("Pong!");
}

module.exports = { commandInfo, command };
