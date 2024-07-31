// eslint-disable-next-line no-unused-vars
import { Guild, Role } from "discord.js";

/**
 *
 * @param {string} rarity
 * @param {Guild} guild
 * @returns {Collection<string,Role>}
 */
export function getRoles(rarity, guild) {

    const roleSections = getRoleSections(guild);

    const section = { start: `${rarity}_START`, end: `${rarity}_END` };
    return guild.roles.cache.filter(role => compare(role, roleSections[section.start], roleSections[section.end], guild));
}

/**
 * Return roles for the sections
 * @param {Guild} guild 
 * @returns {{MYTHIC_START:Role,MYTHIC_END:Role,LEGENDARY_START:Role,LEGENDARY_END:Role,EPIC_START:Role,EPIC_END:Role,UNCOMMON_START:Role,UNCOMMON_END:Role,COMMON_START:Role, COMMON_END:Role}}
 */
export function getRoleSections(guild) {
    const roleSections = {
        MYTHIC_START: guild.roles.cache.get(`1266828973984317490`),
        MYTHIC_END: guild.roles.cache.get(`1266858490157207777`),
        LEGENDARY_START: guild.roles.cache.get(`1266829060902879283`),
        LEGENDARY_END: guild.roles.cache.get(`1266858469005197372`),
        EPIC_START: guild.roles.cache.get(`1266829099658117140`),
        EPIC_END: guild.roles.cache.get(`1266858451888509068`),
        UNCOMMON_START: guild.roles.cache.get(`1266829175508041879`),
        UNCOMMON_END: guild.roles.cache.get(`1266858530019868765`),
        COMMON_START: guild.roles.cache.get(`1266829217966985278`),
        COMMON_END: guild.roles.cache.get(`1266858918374670336`),
    };
    return roleSections;
}
/**
 * Negative number if the first role's position is lower (second role's is higher)
 * @param {import("discord.js").RoleResolvable} role1
 * @param {import("discord.js").RoleResolvable} role2
 * @param {Guild} guild
 * @returns {boolean}
 */
export function belowStart(role1, role2, guild) {
    const test = guild.roles.comparePositions(role1, role2);
    if (test < 0) return true;
    return false;
}

/**
 * Positive number if the first's is higher (second's is lower), 0 if equal
 * @param {import("discord.js").RoleResolvable} role1
 * @param {import("discord.js").RoleResolvable} role2
 * @param {Guild} guild
 * @returns {boolean}
 */
export function aboveEnd(role1, role2, guild) {
    const test = guild.roles.comparePositions(role1, role2);
    if (test > 0) return true;
    return false;
}

/**
 *
 * @param {import("discord.js").RoleResolvable} roleToTest
 * @param {import("discord.js").RoleResolvable} roleStart
 * @param {import("discord.js").RoleResolvable} roleEnd
 * @param {Guild} guild
 * @returns {import("discord.js").RoleResolvable | null}
 */
export function compare(roleToTest, roleStart, roleEnd, guild) {
    const start = belowStart(roleToTest, roleStart, guild);
    const end = aboveEnd(roleToTest, roleEnd, guild);

    if (start && end) return roleToTest;
    return null;
}