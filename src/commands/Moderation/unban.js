const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const moderationLogs = require("./../../database/moderationLogs");

const { MessageFlags } = require("discord.js");

module.exports = {
    description_full: "Unbans a member from the server with the specified reason.",
    usage: '/unban user:"user ID or unique username" [reason:"unban reason"]',
    examples: [
        '/unban user:"123456789012345678"',
        '/unban user:"yoo_12345" reason:"Ban was a mistake"',
    ],

    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban a member from the server.")
        .addStringOption((option) =>
            option
                .setName("user")
                .setDescription("The ID or unique username of the member to unban")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option.setName("reason").setDescription("The reason for unbanning"),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const userInput = interaction.options.getString("user");
        const reason = interaction.options.getString("reason") ?? "No reason provided";

        try {
            const bans = await interaction.guild.bans.fetch();
            const bannedUser = bans.find(
                (ban) =>
                    ban.user.id === userInput ||
                    ban.user.tag.toLowerCase() === userInput.toLowerCase(),
            );

            if (!bannedUser) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Error")
                            .setDescription("User is not banned or not found")
                            .setColor("Red")
                            .setTimestamp()
                            .setFooter({
                                text: `Requested by ${interaction.user.tag}`,
                                iconURL: interaction.user.displayAvatarURL(),
                            }),
                    ],
                });
                return;
            }

            await interaction.guild.members.unban(bannedUser.user.id, reason);

            const logEntry = new moderationLogs({
                action: "unban",
                moderator: interaction.user.id,
                user: bannedUser.user.id,
                reason: reason,
            });

            await logEntry.save();

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("User Unbanned")
                        .setDescription(`Successfully unbanned ${bannedUser.user.tag}`)
                        .addFields(
                            {
                                name: "User ID",
                                value: bannedUser.user.id,
                                inline: true,
                            },
                            { name: "Reason", value: reason, inline: true },
                        )
                        .setColor("Green")
                        .setTimestamp()
                        .setFooter({
                            text: `Unbanned by ${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL(),
                        }),
                ],
            });
        } catch (error) {
            handleError("Error unbanning user:", error);
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription("An error occurred while trying to unban the user")
                        .setColor("Red")
                        .setTimestamp()
                        .setFooter({
                            text: `Requested by ${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL(),
                        }),
                ],
            });
        }
    },
};
