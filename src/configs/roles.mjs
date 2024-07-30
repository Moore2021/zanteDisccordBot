// eslint-disable-next-line no-unused-vars
import { Collection, Role } from "discord.js";
import client from "../index.mjs";

export function getRarities() {
  const rarities = [
    {
      "category": `MYTHIC`,
      "weight": .05,
      "roles": getRoles(`MYTHIC`),
      "roleType": `1266828973984317490`
    }, {
      "category": `LEGENDARY`,
      "weight": .10,
      "roles": getRoles(`LEGENDARY`),
      "roleType": `1266829060902879283`
    }, {
      "category": `EPIC`,
      "weight": .15,
      "roles": getRoles(`EPIC`),
      "roleType": `1266829099658117140`
    }, {
      "category": `UNCOMMON`,
      "weight": .3,
      "roles": getRoles(`UNCOMMON`),
      "roleType": `1266829175508041879`
    }, {
      "category": `COMMON`,
      "weight": .4,
      "roles": getRoles(`COMMON`),
      "roleType": `1266829217966985278`
    }
  ];
  return rarities;
}

/**
 * 
 * @param {string} rarity 
 * @returns {Collection<string,Role>}
 */
export function getRoles(rarity) {
  const guild = client.guilds.cache.get(`1266504446943297690`);

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

  /**
   *
   * @param {import("discord.js").RoleResolvable} roleToTest
   * @param {import("discord.js").RoleResolvable} roleStart
   * @param {import("discord.js").RoleResolvable} roleEnd
   * @returns {import("discord.js").RoleResolvable | null}
   */
  const compare = (roleToTest, roleStart, roleEnd) => {
    const start = belowStart(roleToTest, roleStart);
    const end = aboveEnd(roleToTest, roleEnd);
    if (start && end) return roleToTest;
    return null;
  };

  const section = { start: `${rarity}_START`, end: `${rarity}_END` };

  return guild.roles.cache.filter(role => compare(role, roleSections[section.start], roleSections[section.end]));
}

/**
   * Negative number if the first role's position is lower (second role's is higher)
   * @param {import("discord.js").RoleResolvable} role1
   * @param {import("discord.js").RoleResolvable} role2
   * @returns {boolean}
   */
export const belowStart = (role1, role2) => {
  const guild = client.guilds.cache.get(`1266504446943297690`);
  const test = guild.roles.comparePositions(role1, role2);
  if (test < 0) return true;
  return false;
};

/**
   * Positive number if the first's is higher (second's is lower), 0 if equal
   * @param {import("discord.js").RoleResolvable} role1
   * @param {import("discord.js").RoleResolvable} role2
   * @returns {boolean}
   */
export const aboveEnd = (role1, role2) => {
  const guild = client.guilds.cache.get(`1266504446943297690`);
  const test = guild.roles.comparePositions(role1, role2);
  if (test > 0) return true;
  return false;
};

/**
 * Picks the random item based on its weight.
 * The items with higher weight will be picked more often (with a higher probability).
 *
 * For example:
 * - items = ['banana', 'orange', 'apple']
 * - weights = [0, 0.2, 0.8]
 * - weightedRandom(items, weights) in 80% of cases will return 'apple', in 20% of cases will return
 * 'orange' and it will never return 'banana' (because probability of picking the banana is 0%)
 *
 * @param {any[]} items
 * @param {number[]} weights
 * @returns {{item: any, index: number}}
 */
export function weightedRandom(items, weights) {
  if (items.length !== weights.length) {
    throw new Error(`Items and weights must be of the same size`);
  }

  if (!items.length) {
    throw new Error(`Items must not be empty`);
  }

  // Preparing the cumulative weights array.
  // For example:
  // - weights = [1, 4, 3]
  // - cumulativeWeights = [1, 5, 8]
  const cumulativeWeights = [];
  for (let i = 0; i < weights.length; i += 1) {
    cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);
  }

  // Getting the random number in a range of [0...sum(weights)]
  // For example:
  // - weights = [1, 4, 3]
  // - maxCumulativeWeight = 8
  // - range for the random number is [0...8]
  const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
  const randomNumber = maxCumulativeWeight * Math.random();

  // Picking the random item based on its weight.
  // The items with higher weight will be picked more often. 
  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
    if (cumulativeWeights[itemIndex] >= randomNumber) {
      return {
        item: items[itemIndex],
        index: itemIndex,
      };
    }
  }
}

/**
 * @param {boolean} result
 * @param {import("discord.js").RoleResolvable} randomRole
 * Return a random role id based on weights
 * @returns {{result:boolean,randomRole:Role,roleType:import("discord.js").RoleResolvable,rarity:string}} result
 */
export default function getRole() {
  const rarities = getRarities();
  const rare = rarities.map(e => e.category);
  const weight = rarities.map(e => e.weight);
  const weightsAdded = weight.reduce((partialSum, a) => partialSum + a, 0);
  if (weightsAdded > 1) throw Error(`Weights are inconsistent and need to be adjusted`);
  const weights = weight.map(w => w * 100);
  const result = weightedRandom(rare, weights);
  const roles = getRoles(result.item);
  if (roles.size < 1) return { result: false, rarity: result.item };
  const role = Array.from(roles);
  const randomRole = role[Math.floor(Math.random() * role.length)];
  return { result: true, randomRole: randomRole[0], roleType: rarities[result.index].roleType, rarity: result.item };
}