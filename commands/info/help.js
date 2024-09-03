const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ComponentType,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js')
const fs = require('fs')
const path = require('path')

const commandData = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays all commands or info about a specific command')
    .addStringOption((option) =>
        option
            .setName('command')
            .setRequired(false)
            .setDescription('The name of the command you want more info on')
    )
    .addStringOption((option) =>
        option
            .setName('search')
            .setRequired(false)
            .setDescription('Search for a command by name or description')
    )

module.exports = {
    data: commandData,
    async execute(interaction) {
        await interaction.deferReply()

        const { guild } = interaction
        const commandName = interaction.options
            .getString('command')
            ?.toLowerCase()
        const searchQuery = interaction.options
            .getString('search')
            ?.toLowerCase()

        const commandsByCategory = await getCommandsByCategory(guild)
        const allCommands = Array.from(commandsByCategory.values()).flat()

        const embedFooter = {
            text: `Requested by ${interaction.user.tag}`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        }

        if (commandName) {
            const command = allCommands.find((cmd) => cmd.name === commandName)

            if (!command) {
                return await interaction.editReply({
                    content: `No command found with the name "${commandName}"`,
                    ephemeral: true,
                })
            }

            const usageField = {
                name: 'Usage:',
                value: command.usage
                    ? `\`${command.usage}\``
                    : 'No specific usage.',
                inline: false,
            }
            const examplesField = {
                name: 'Examples:',
                value: command.examples
                    ? command.examples.map((ex) => `\`${ex}\``).join('\n')
                    : 'No examples provided.',
                inline: false,
            }

            const commandInfoEmbed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle(`❓ Command Details: /${command.name}`)
                .setDescription(
                    truncateDescription(
                        command.description_full ||
                            command.description ||
                            'No detailed description available.'
                    )
                )
                .addFields(usageField)
                .setTimestamp()
                .setFooter(embedFooter)

            if (usageField.value !== examplesField.value) {
                commandInfoEmbed.addFields(examplesField)
            }

            return await interaction.editReply({ embeds: [commandInfoEmbed] })
        }

        if (searchQuery) {
            const searchResults = getSearchResults(
                commandsByCategory,
                searchQuery
            )

            if (searchResults.length === 0) {
                return await interaction.editReply({
                    content: `No commands found matching "${searchQuery}"`,
                    ephemeral: true,
                })
            }

            const searchEmbed = createCommandListEmbed(
                searchResults,
                `🔍 Search Results for "${searchQuery}"`,
                '#f39c12'
            ).setFooter(embedFooter)

            return await interaction.editReply({ embeds: [searchEmbed] })
        }

        try {
            const commandListEmbed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('📃 Kiyo Bot Commands')
                .setDescription(
                    'Here is a list of all commands categorized by their functionality:'
                )
                .setTimestamp()
                .setFooter(embedFooter)

            for (const [category, commands] of commandsByCategory.entries()) {
                let fieldValue = ''

                const sortedCommands = commands.sort((a, b) =>
                    a.name.localeCompare(b.name)
                ) // Sort commands alphabetically

                sortedCommands.forEach((cmd) => {
                    const cmdStr = `</${cmd.name}:${cmd.id}> - ${truncateDescription(cmd.description)}\n`

                    if (fieldValue.length + cmdStr.length <= 1024) {
                        fieldValue += cmdStr
                    } else {
                        commandListEmbed.addFields({
                            name: `**${category}**`,
                            value: fieldValue,
                            inline: false,
                        })
                        fieldValue = cmdStr
                    }
                })

                if (fieldValue.length > 0) {
                    commandListEmbed.addFields({
                        name: `**${category}**`,
                        value: fieldValue,
                        inline: false,
                    })
                }
            }

            const mainMenuEmbed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('Welcome to Kiyo Bot Help 👋')
                .setDescription(
                    'Click the button below to view a list of all commands. You can also search for a specific command using `/help [search]`!'
                )
                .setThumbnail(interaction.client.user.avatarURL())
                .setTimestamp()
                .setFooter(embedFooter)

            const rowButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('show-command-list')
                    .setLabel('Command List')
                    .setStyle(ButtonStyle.Primary)
            )

            const reply = await interaction.editReply({
                embeds: [mainMenuEmbed],
                components: [rowButton],
            })

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60_000 * 5,
            })

            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) {
                    return await i.reply({
                        content:
                            'You should run the command to use this interaction.',
                        ephemeral: true,
                    })
                }

                if (i.customId === 'show-command-list') {
                    await i.update({
                        embeds: [commandListEmbed],
                        components: [],
                    })
                }
            })

            collector.on('end', () => {
                reply.edit({ components: [] })
            })
        } catch (error) {
            console.error('Error in help command:', error)
            await interaction.editReply({
                content: 'An error occurred while processing the help command.',
                ephemeral: true,
            })
        }
    },
}

function createCommandListEmbed(commands, title, color) {
    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setTimestamp()

    const fieldValueMaxLength = 1024
    let currentFieldValue = ''

    commands.forEach((cmd, index) => {
        const cmdStr = `> \`${index + 1}.\` </${cmd.name}:${cmd.id}> - ${cmd.description}\n`

        if (currentFieldValue.length + cmdStr.length <= fieldValueMaxLength) {
            currentFieldValue += cmdStr
        } else {
            embed.addFields({
                name: currentFieldValue.length > 0 ? '\u200B' : title,
                value: currentFieldValue,
            })
            currentFieldValue = cmdStr
        }
    })

    if (currentFieldValue.length > 0) {
        embed.addFields({
            name: '\u200B',
            value: currentFieldValue,
        })
    }

    return embed
}

function getSearchResults(commandsByCategory, searchQuery) {
    return Array.from(commandsByCategory.values()).flatMap((commands) =>
        commands.filter(
            (cmd) =>
                cmd.name.toLowerCase().includes(searchQuery) ||
                cmd.description.toLowerCase().includes(searchQuery)
        )
    )
}

async function getCommandsByCategory(guild) {
    const guildCommands = await guild.commands.fetch()
    const commandsDirectory = path.join(__dirname, '..')
    const categoryFolders = fs
        .readdirSync(commandsDirectory)
        .filter((dir) =>
            fs.statSync(path.join(commandsDirectory, dir)).isDirectory()
        )

    const commandsByCategory = new Map()
    for (const category of categoryFolders) {
        commandsByCategory.set(category, [])

        const commandFiles = fs
            .readdirSync(path.join(commandsDirectory, category))
            .filter((file) => file.endsWith('.js'))

        for (const file of commandFiles) {
            const filePath = path.join(commandsDirectory, category, file)
            const command = require(filePath)
            commandsByCategory.get(category).push({
                id: guildCommands.find((c) => c.name === command.data.name).id,
                name: command.data.name,
                description: command.data.description,
                description_full: command.description_full,
                usage: command.usage,
                examples: command.examples,
            })
        }
    }

    return commandsByCategory
}
