const { SlashCommandBuilder, PollLayoutType, EmbedBuilder } = require("discord.js");

const MAX_POLL_DURATION_HOURS = 32;
const MAX_POLL_DURATION_MINUTES = MAX_POLL_DURATION_HOURS * 60;

const { MessageFlags } = require("discord.js");

module.exports = {
    description_full: "Creates a poll with the given question, options, and duration.",
    usage: '/create_poll question:"poll question" options:"option1,option2,..." multi_select:true/false duration:hours',
    examples: [
        '/create_poll question:"What is your favorite color?" options:"Red,Blue,Green" multi_select:false duration:1',
        '/create_poll question:"Which games do you like?" options:"Minecraft,Fortnite,Valorant" multi_select:true duration:24',
    ],
    
    data: new SlashCommandBuilder()
        .setName("create_poll")
        .setDescription("Create a poll")
        .addStringOption((option) =>
            option.setName("question").setDescription("The question of the poll").setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("options")
                .setDescription("The options of the poll, separated by commas")
                .setRequired(true),
        )
        .addBooleanOption((option) =>
            option
                .setName("multi_select")
                .setDescription("Allow multiple answer selections")
                .setRequired(true),
        )
        .addIntegerOption((option) =>
            option
                .setName("duration")
                .setDescription(
                    `Duration of the poll in hours (max ${MAX_POLL_DURATION_HOURS} hours)`,
                )
                .setRequired(true),
        ),

    async execute(interaction) {
        try {
            const question = interaction.options.getString("question");
            const options = interaction.options
                .getString("options")
                .split(",")
                .map((option) => option.trim())
                .filter((option) => option !== ""); // Remove empty options
            const multiSelect = interaction.options.getBoolean("multi_select");
            const durationHours = interaction.options.getInteger("duration");

            if (options.length < 2) {
                return interaction.reply({
                    content: "Please provide at least two options for the poll.",
                    flags: MessageFlags.Ephemeral,
                });
            }

            if (durationHours <= 0 || durationHours > MAX_POLL_DURATION_HOURS) {
                return interaction.reply({
                    content: `Duration must be between 1 and ${MAX_POLL_DURATION_HOURS} hours.`,
                    flags: MessageFlags.Ephemeral,
                });
            }

            const durationMinutes = Math.min(durationHours * 60, MAX_POLL_DURATION_MINUTES);

            await interaction.reply({
                poll: {
                    question: { text: question }, // Placeholder question
                    answers: options.map((option) => ({ text: option })),
                    allowMultiselect: multiSelect,
                    duration: durationMinutes,
                    layoutType: PollLayoutType.Default,
                },
            });
        } catch (error) {
            handleError(error);
            await interaction.reply({
                content: "An error occurred while creating the poll.",
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
