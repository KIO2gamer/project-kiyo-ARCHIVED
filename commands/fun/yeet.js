const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('yeet').setDescription('yeet'),
	 
	async execute(interaction) {
		await interaction.reply(
			'https://tenor.com/view/yeet-lion-king-simba-rafiki-throw-gif-16194362'
		);
	},
};
