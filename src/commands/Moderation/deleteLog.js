const { SlashCommandBuilder } = require("discord.js");
const moderationLogs = require("./../../database/moderationLogs");
const { parseRange } = require("../../utils/rangeParser");
const { handleError } = require("../../utils/errorHandler");
const { MessageFlags } = require("discord.js");

module.exports = {
    description_full: "Deletes a moderation log or a range of logs by log number or range.",
    usage: "/delete_log [lognumber] [logrange]",
    examples: ["/delete_log lognumber:5", "/delete_log logrange:1-5"],

    data: new SlashCommandBuilder()
        .setName("delete_log")
        .setDescription("Delete a moderation log/logs by log number/range.")
        .addIntegerOption((option) =>
            option
                .setName("lognumber")
                .setDescription("The log number to delete")
                .setRequired(false),
        )
        .addStringOption((option) =>
            option
                .setName("logrange")
                .setDescription("The range of log numbers to delete (e.g., 1-5)")
                .setRequired(false),
        ),

    async execute(interaction) {
        const logNumber = interaction.options.getInteger("lognumber");
        const logRange = interaction.options.getString("logrange");

        if (!logNumber && !logRange) {
            await interaction.reply(
                "Please provide either a log number or a range of log numbers to delete.",
            );
            return;
        }

        try {
            if (logNumber) {
                const log = await moderationLogs.findOneAndDelete({
                    logNumber: logNumber,
                });

                if (log) {
                    await interaction.reply(`Successfully deleted log #${logNumber}.`);
                } else {
                    await interaction.reply(`No log found with log number ${logNumber}.`);
                }
            } else if (logRange) {
                const range = parseRange(logRange);

                if (!range) {
                    await interaction.reply(
                        "Invalid log range. Please provide a valid range (e.g., 1-5).",
                    );
                    return;
                }

                const { start, end } = range;

                const deletedLogs = await moderationLogs.deleteMany({
                    logNumber: { $gte: start, $lte: end },
                });

                if (deletedLogs.deletedCount > 0) {
                    await interaction.reply(
                        `Successfully deleted ${deletedLogs.deletedCount} logs in the range #${start}-#${end}.`,
                    );
                } else {
                    await interaction.reply(`No logs found in the range #${start}-#${end}.`);
                }
            }
        } catch (error) {
            handleError(error);
            await interaction.reply("Failed to delete the log(s). Please try again later.");
        }
    },
};
