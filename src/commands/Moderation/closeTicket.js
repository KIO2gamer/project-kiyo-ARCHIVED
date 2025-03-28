/**
 * Closes the current ticket channel. Requires the "Manage Channels" permission.
 *
 * @param {import('discord.js').Interaction} interaction - The Discord.js interaction object.
 * @returns {Promise<void>} - A Promise that resolves when the ticket is closed.
 */
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

const { MessageFlags } = require("discord.js");

module.exports = {
    description_full:
        'Closes the current ticket channel. Requires the "Manage Channels" permission.',
    usage: '/close_ticket [reason:"close reason"]',
    examples: ["/close_ticket", '/close_ticket reason:"Issue resolved"'],

    data: new SlashCommandBuilder()
        .setName("close_ticket")
        .setDescription("Closes the current ticket channel.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption((option) =>
            option.setName("reason").setDescription("The reason for closing the ticket"),
        ),
    async execute(interaction) {
        const reason = interaction.options.getString("reason") ?? "No reason provided";

        if (!interaction.channel.name.startsWith("ticket-")) {
            return interaction.reply({
                content: "This command can only be used in ticket channels.",
                flags: MessageFlags.Ephemeral,
            });
        }

        const ticketCreatorId = interaction.channel.name.split("-")[1];

        try {
            const ticketCreator = await interaction.guild.members.fetch(ticketCreatorId);

            if (ticketCreator) {
                await ticketCreator.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Ticket Closed")
                            .setDescription(
                                `Your ticket in \`${interaction.channel.guild.name}\` has been closed. Reason: ${reason}`,
                            )
                            .setColor("Green")
                            .setThumbnail(interaction.channel.guild.iconURL())
                            .setTimestamp(),
                    ],
                });
            }

            await interaction.reply({
                content: "Ticket closed successfully.",
                flags: MessageFlags.Ephemeral,
            });
            await interaction.channel.delete();
        } catch (error) {
            handleError("Error closing ticket channel:", error.message);
            if (error.message.includes("Cannot send messages")) {
                interaction.reply({
                    content: "I cannot send messages to that user as their DMs are turned off.",
                    flags: MessageFlags.Ephemeral,
                });
                return;
            } else {
                interaction.reply({
                    content: "An error occurred while closing the ticket.",
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
        }
    },
};
