const { Events, MessageFlags } = require("discord.js");
const Logger = require("../utils/logger");
const { handleError } = require("../utils/errorHandler");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                Logger.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                // Log command usage
                await Logger.commandUsage(
                    interaction.commandName,
                    interaction.user,
                    interaction.guild,
                    true,
                );

                await command.execute(interaction);
            } catch (error) {
                // Log command failure
                await Logger.commandUsage(
                    interaction.commandName,
                    interaction.user,
                    interaction.guild,
                    false,
                );

                await Logger.errorWithContext(error, {
                    command: interaction.commandName,
                    user: interaction.user.tag,
                    guild: interaction.guild?.name,
                    channel: interaction.channel?.name,
                });

                await handleError(
                    interaction,
                    error,
                    "COMMAND_EXECUTION",
                    `An error occurred while executing the ${interaction.commandName} command.`,
                );
            }
        }

        // Handle button interactions, select menus, and modals for YouTube subscriber role config
        else if (
            interaction.isButton() ||
            interaction.isStringSelectMenu() ||
            interaction.isModalSubmit()
        ) {
            const userId = interaction.user.id;

            // Import the ytSubRoleConfig module to access its handlers
            try {
                const ytSubRoleConfig = require("../features/youtube-subscriber-roles/commands/ytSubRoleConfig");

                // Handle YouTube subscriber role config interactions
                if (
                    interaction.customId?.includes("yt_config_") ||
                    interaction.customId?.includes("yt_remove_") ||
                    interaction.customId?.includes("yt_add_tier_") ||
                    interaction.customId?.includes("yt_clear_") ||
                    interaction.customId?.includes("yt_setup_")
                ) {
                    await handleYTConfigInteractions(interaction, userId, ytSubRoleConfig);
                }
            } catch (error) {
                Logger.error("Error handling component interaction:", error);

                // Only try to respond if the interaction hasn't been handled and isn't expired
                if (!interaction.replied && !interaction.deferred) {
                    try {
                        await interaction.reply({
                            content: "An error occurred while processing your interaction.",
                            flags: MessageFlags.Ephemeral,
                        });
                    } catch (replyError) {
                        // If we can't reply (interaction expired), just log it
                        Logger.error("Could not reply to interaction:", replyError.message);
                    }
                }
            }
        }
    },
};

// Helper function to handle YouTube config interactions
async function handleYTConfigInteractions(interaction, userId, ytSubRoleConfig) {
    const YTSubRoleConfig = require("../features/youtube-subscriber-roles/database/ytSubRoleConfig");
    const { EmbedBuilder } = require("discord.js");

    // Handle add tier button
    if (interaction.customId === `yt_config_add_${userId}`) {
        await ytSubRoleConfig.handleAddTier(interaction, interaction.guild.id, userId);
    }

    // Handle remove tier button
    else if (interaction.customId === `yt_config_remove_${userId}`) {
        await ytSubRoleConfig.handleRemoveTier(interaction, interaction.guild.id, userId);
    }

    // Handle toggle button
    else if (interaction.customId === `yt_config_toggle_${userId}`) {
        await ytSubRoleConfig.handleToggle(interaction, interaction.guild.id, userId);
    }

    // Handle remove tier select menu
    else if (interaction.customId === `yt_remove_select_${userId}`) {
        await interaction.deferReply();

        const tierIndex = parseInt(interaction.values[0]);
        const config = await YTSubRoleConfig.findOne({ guildId: interaction.guild.id });

        if (!config || tierIndex >= config.subscriberTiers.length) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Invalid Selection")
                .setDescription("The selected tier no longer exists.")
                .setColor("#FF0000");

            await interaction.editReply({ embeds: [embed] });
            return;
        }

        const removedTier = config.subscriberTiers[tierIndex];
        config.subscriberTiers.splice(tierIndex, 1);
        config.updatedBy = userId;
        await config.save();

        const embed = new EmbedBuilder()
            .setTitle("✅ Tier Removed")
            .setDescription(
                `Successfully removed the ${ytSubRoleConfig.formatNumber(removedTier.minSubscribers)} subscriber tier.`,
            )
            .setColor("#00FF00");

        await interaction.editReply({ embeds: [embed] });
    }

    // Handle add tier modal
    else if (interaction.customId === `yt_add_tier_${userId}`) {
        await interaction.deferReply();

        const subscribers = parseInt(interaction.fields.getTextInputValue("subscribers"));
        const roleName = interaction.fields.getTextInputValue("role").trim();

        if (isNaN(subscribers) || subscribers < 0) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Invalid Subscriber Count")
                .setDescription("Please enter a valid number of subscribers (0 or greater).")
                .setColor("#FF0000");

            await interaction.editReply({ embeds: [embed] });
            return;
        }

        const role = interaction.guild.roles.cache.find(
            (r) => r.name.toLowerCase() === roleName.toLowerCase(),
        );
        if (!role) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Role Not Found")
                .setDescription(
                    `Role "${roleName}" not found. Please check the role name and try again.`,
                )
                .setColor("#FF0000");

            await interaction.editReply({ embeds: [embed] });
            return;
        }

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Cannot Manage Role")
                .setDescription(
                    `Cannot manage role "${roleName}" because it's higher than or equal to the bot's highest role.`,
                )
                .setColor("#FF0000");

            await interaction.editReply({ embeds: [embed] });
            return;
        }

        let config = await YTSubRoleConfig.findOne({ guildId: interaction.guild.id });
        if (!config) {
            config = new YTSubRoleConfig({
                guildId: interaction.guild.id,
                subscriberTiers: [],
                updatedBy: userId,
            });
        }

        // Check if tier already exists
        const existingTier = config.subscriberTiers.find(
            (tier) => tier.minSubscribers === subscribers,
        );
        if (existingTier) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Tier Already Exists")
                .setDescription(
                    `A tier for ${ytSubRoleConfig.formatNumber(subscribers)} subscribers already exists.`,
                )
                .setColor("#FF0000");

            await interaction.editReply({ embeds: [embed] });
            return;
        }

        config.subscriberTiers.push({
            minSubscribers: subscribers,
            roleId: role.id,
            tierName: roleName,
        });

        config.updatedBy = userId;
        await config.save();

        const embed = new EmbedBuilder()
            .setTitle("✅ Tier Added")
            .setDescription(
                `Successfully added tier: **${ytSubRoleConfig.formatNumber(subscribers)}+ subscribers** → ${role.name}`,
            )
            .setColor("#00FF00");

        await interaction.editReply({ embeds: [embed] });
    }

    // Handle setup modal
    else if (interaction.customId === `yt_setup_${userId}`) {
        try {
            await interaction.deferReply();
            await ytSubRoleConfig.processSetupData(interaction, interaction.guild.id, userId);
        } catch (error) {
            Logger.error("Error processing setup modal:", error);
            if (!interaction.replied) {
                try {
                    await interaction.reply({
                        content: "An error occurred while processing the setup. Please try again.",
                        flags: MessageFlags.Ephemeral,
                    });
                } catch (replyError) {
                    Logger.error("Could not reply to setup modal:", replyError.message);
                }
            }
        }
    }

    // Handle clear confirmation buttons
    else if (interaction.customId === `yt_clear_confirm_${userId}`) {
        await YTSubRoleConfig.deleteOne({ guildId: interaction.guild.id });

        const embed = new EmbedBuilder()
            .setTitle("✅ Configuration Cleared")
            .setDescription("All YouTube subscriber role configuration has been cleared.")
            .setColor("#00FF00");

        await interaction.update({ embeds: [embed], components: [] });
    } else if (interaction.customId === `yt_clear_cancel_${userId}`) {
        const embed = new EmbedBuilder()
            .setTitle("❌ Cancelled")
            .setDescription("Configuration clear cancelled.")
            .setColor("#FF0000");

        await interaction.update({ embeds: [embed], components: [] });
    }
}
