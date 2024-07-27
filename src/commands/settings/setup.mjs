// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import {readFileSync} from "node:fs"

export const data = new SlashCommandBuilder()
    .setName("setup")
    .setDescription("add button to message")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
export async function execute(interaction) {
    const fileName = `./src/configs/message-ids.json`;
    const file = readFileSync(fileName,{ encoding: 'utf8', flag: 'r' });
    const data = JSON.parse(file);
    const messageId = data.clan
    
    const rollButton = new ButtonBuilder().setCustomId("rollRandom").setLabel("roll").setStyle(ButtonStyle.Success)

    const row = new ActionRowBuilder().addComponents(rollButton);
    const rollMessage = await interaction.channel.messages.fetch(messageId)
    if (rollMessage.editable) {
        await rollMessage.edit({components:[row]});
    }

    return await interaction.reply({content:"Button has been added",ephemeral:true});
}