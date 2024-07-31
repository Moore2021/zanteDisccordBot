// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { writeFile, readFileSync } from "node:fs";
import { config } from "../../configs/config.mjs";

export const data = new SlashCommandBuilder()
  .setName(`setgenerator`)
  .setDescription(`sets the message to listen to, to give roles.`)
  .addStringOption(option => option.setName(`message_id`).setDescription(`the message id of the message.`).setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

/**
 *  
 * @param {ChatInputCommandInteraction} interaction 
 */
export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const fileName = config.DEV_MODE ? `./src/configs/message-ids-DEV.json` : `./src/configs/message-ids.json`;
  const messageId = interaction.options.getString(`message_id`, true);

  const testMessage = await interaction.channel.messages.fetch(messageId);
  const isAuthor = testMessage.author.id === interaction.guild.members.me.id;
  if (!isAuthor) return await interaction.editReply({ content: `message id has **NOT** been updated, I am not the author of that message`, ephemeral: true });
  const file = {
    clan: messageId
  };

  const orginFile = readFileSync(fileName, { encoding: `utf8`, flag: `r` });
  const data = JSON.parse(orginFile);
  const orginMessageId = data.clan;

  if (orginMessageId) {
    try {
      const rollMessage = await interaction.channel.messages.fetch(messageId);
      if (rollMessage.editable) {
        rollMessage.edit({ components: [] });
      }
    } catch (error) {
      console.error(error);
    }
  }

  writeFile(fileName, JSON.stringify(file, null, 2), function writeJSON(err) {
    if (err) return console.log(err);
  });
  return await interaction.editReply({ content: `message id has been updated`, ephemeral: true });
}