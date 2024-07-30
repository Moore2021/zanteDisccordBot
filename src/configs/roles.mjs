// eslint-disable-next-line no-unused-vars
import { Role } from "discord.js";
import { getRoles } from "../libs/getRoles.mjs";

export function getRarities(guild) {

  const rarities = [
    {
      "category": `MYTHIC`,
      "weight": .05,
      "roles": getRoles(`MYTHIC`, guild),
      "roleType": `1266828973984317490`
    }, {
      "category": `LEGENDARY`,
      "weight": .10,
      "roles": getRoles(`LEGENDARY`, guild),
      "roleType": `1266829060902879283`
    }, {
      "category": `EPIC`,
      "weight": .15,
      "roles": getRoles(`EPIC`, guild),
      "roleType": `1266829099658117140`
    }, {
      "category": `UNCOMMON`,
      "weight": .3,
      "roles": getRoles(`UNCOMMON`, guild),
      "roleType": `1266829175508041879`
    }, {
      "category": `COMMON`,
      "weight": .4,
      "roles": getRoles(`COMMON`, guild),
      "roleType": `1266829217966985278`
    }
  ];
  return rarities;
}

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
export default function getRole(guild) {

  const rarities = getRarities(guild);
  const rare = rarities.map(e => e.category);
  const weight = rarities.map(e => e.weight);
  const weightsAdded = weight.reduce((partialSum, a) => partialSum + a, 0);
  if (weightsAdded > 1) throw Error(`Weights are inconsistent and need to be adjusted`);
  const weights = weight.map(w => w * 100);
  const result = weightedRandom(rare, weights);
  const roles = getRoles(result.item, guild);
  if (roles.size < 1) return { result: false, rarity: result.item };
  const role = Array.from(roles);
  const randomRole = role[Math.floor(Math.random() * role.length)];
  return { result: true, randomRole: randomRole[0], roleType: rarities[result.index].roleType, rarity: result.item };
}