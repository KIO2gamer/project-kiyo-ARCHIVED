const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const moderationLogs = require("./../../database/moderationLogs");
const { parseRange } = require("../../utils/rangeParser");
const { handleError } = require("../../utils/errorHandler");

module.exports = {
    description_full: "Edits the reason for a specific log entry or a range of log entries.",
    usage: '/edit_reason reason:"new reason" [lognumber] [logrange]',
    examples: [
        '/edit_reason reason:"Spamming" lognumber:5',
        '/edit_reason reason:"Inappropriate behavior" logrange:10-15',
    ],

    data: new SlashCommandBuilder()
        .setName("edit_reason")
        .setDescription("Edit the reason for a specific log entry / a range of log entries.")
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("The new reason for the log entry or entries")
                .setRequired(true),
        )
        .addIntegerOption((option) =>
            option.setName("lognumber").setDescription("The log number to edit").setRequired(false),
        )
        .addStringOption((option) =>
            option
                .setName("logrange")
                .setDescription("The range of log numbers to edit (e.g., 1-5)")
                .setRequired(false),
        ),

    async execute(interaction) {
        const logNumber = interaction.options.getInteger("lognumber");
        const logRange = interaction.options.getString("logrange");
        const newReason = interaction.options.getString("reason");

        if (!logNumber && !logRange) {
            await interaction.reply(
                "Please provide either a log number or a range of log numbers to edit.",
            );
            return;
        }

        try {
            if (logNumber) {
                const log = await moderationLogs.findOne({
                    logNumber: logNumber,
                });

                if (log) {
                    log.reason = newReason;
                    await log.save();
                    await interaction.reply(
                        `Successfully updated reason for log #${logNumber} to: ${newReason}`,
                    );
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

                const logs = await moderationLogs.find({
                    logNumber: { $gte: start, $lte: end },
                });

                if (logs.length > 0) {
                    await moderationLogs.updateMany(
                        { logNumber: { $gte: start, $lte: end } },
                        { $set: { reason: newReason } },
                    );
                    await interaction.reply(
                        `Successfully updated reason for ${logs.length} logs in the range #${start}-#${end} to: ${newReason}`,
                    );
                } else {
                    await interaction.reply(`No logs found in the range #${start}-#${end}.`);
                }
            }
        } catch (error) {
            handleError(error);
            await interaction.reply("Failed to update the log(s). Please try again later.");
        }
    },
};
