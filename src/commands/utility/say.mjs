// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ChannelType } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName(`say`)
    .setDescription(`have the bot say a message`)
    .addStringOption(option =>
        option
            .setName(`message`)
            .setDescription(`message for bot to say.`)
            .setRequired(true)
    )
    .addChannelOption(option =>
        option
            .setName(`channel`)
            .setDescription(`what channel to send the message in.`)
            .addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
export async function execute(interaction) {

    await interaction.deferReply({ ephemeral: true });
    const messageToSay = interaction.options.getString(`message`, true);
    const channelToSayIn = interaction.options.getChannel(`channel`, false);
    const channel = channelToSayIn ? channelToSayIn : interaction.channel;
    if (interaction.guild.channels.cache.has(channel.id)) {
        const c = interaction.guild.channels.cache.get(channel.id);
        c.send(messageToSay);
    }


    return await interaction.editReply({ content: `I have sent the message: ${messageToSay} to channel: ${channel}`, ephemeral: true });
}