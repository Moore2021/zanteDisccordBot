// eslint-disable-next-line no-unused-vars
import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { getRoleForUser } from "../../libs/database.mjs";

export const data = new SlashCommandBuilder()
    .setName(`retrieve_role`)
    .setDescription(`add the role a member is suppose to have if the bot failed to add.`)
    .addUserOption(option =>
        option
            .setName(`user`)
            .setDescription(`user to add role`)
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 */
export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const user = interaction.options.getMember(`user`, true);
    const userId = user.id;
    const hasPermission = interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles);
    if (!hasPermission) return interaction.editReply({ content: `I current dont have permission to add role to user`, ephemeral: true });
    const role = await getRoleForUser(userId);
    if (!role) return interaction.editReply({ content: `User has not gotten a roll yet.`, ephemeral: true });
    let result = true;
    try {
        user.roles.add(role);
    } catch (error) {
        console.error(error);
        result = false;
    }
    if (!result) return interaction.editReply({ content: `I've encounted an error, no role added. Role id: \`${role}\``, ephemeral: true });
    return interaction.editReply({ content: `Role has been added to ${user}, roleId: ${role}`, ephemeral: true });
}