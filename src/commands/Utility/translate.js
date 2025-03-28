const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const translate = require("@iamtraction/google-translate");

const { MessageFlags } = require("discord.js");

module.exports = {
    description_full:
        'Translates the provided text into the specified target language. Use language codes like "en" (English), "es" (Spanish), "fr" (French), etc.',
    usage: "/translate <input:text_to_translate> <target_lang:language_code>",
    examples: ['/translate input:"Hello, world!" target_lang:es'],

    data: new SlashCommandBuilder()
        .setName("translate")
        .setDescription("Translates text into the desired output language.")
        .addStringOption((option) =>
            option.setName("input").setDescription("The text to translate").setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("target_lang")
                .setDescription("The target language (e.g., en, es, fr, de, ja)")
                .setRequired(true),
        ),

    async execute(interaction) {
        const input = interaction.options.getString("input");
        const targetLang = interaction.options.getString("target_lang");

        try {
            const result = await translate(input, { to: targetLang });

            const embed = new EmbedBuilder()
                .setTitle("Translation Result")
                .setColor("#00ff00")
                .addFields(
                    { name: "Input Text", value: input },
                    { name: "Translated Text", value: result.text },
                    {
                        name: "Target Language",
                        value: targetLang,
                        inline: true,
                    },
                )
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            handleError("Error executing translate command:", error);
            await interaction.reply(
                "There was an error while executing this command. Please try again later.",
            );
        }
    },
};
