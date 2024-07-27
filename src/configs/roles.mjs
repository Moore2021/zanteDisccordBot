export const rarities = [
  {
    "category": "MYTHIC",
    "weight": .05,
    "roles": ["1266829251982655528", "1266829337248796713", "1266829472523620445", "1266829431801122849", "1266829393880154235"],
    "roleType": "1266828973984317490"
  }, {
    "category": "LEGENDARY",
    "weight": .10,
    "roles": ["1266829623405314100", "1266829655093018725", "1266829681206755439", "1266829716690702458", "1266829758230958101", "1266829797653352582", "1266829832000503941", "1266829870055292988", "1266829902317879307"],
    "roleType": "1266829060902879283"
  }, {
    "category": "EPIC",
    "weight": .15,
    "roles": ["1266829936719696034", "1266830094131920906", "1266830126348501083", "1266830175363006515", "1266830204047986760", "1266830230937407572", "1266830266882592769", "1266830295311847444"],
    "roleType": "1266829099658117140"
  }, {
    "category": "UNCOMMON",
    "weight": .3,
    "roles": [],
    "roleType": "1266829175508041879"
  }, {
    "category": "COMMON",
    "weight": .4,
    "roles": [],
    "roleType": "1266829217966985278"
  }
]

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
    throw new Error('Items and weights must be of the same size');
  }

  if (!items.length) {
    throw new Error('Items must not be empty');
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
 * @returns {object} result
 */
export default function getRole() {
  const rare = rarities.map(e => e.category);
  const weight = rarities.map(e => e.weight);
  const weightsAdded = weight.reduce((partialSum, a) => partialSum + a, 0)
  if (weightsAdded>1) throw Error(`Weights are inconsistent and need to be adjusted`)
  const weights = weight.map(w=>w*100)
  const result = weightedRandom(rare, weights);
  const roles = rarities[result.index].roles;
  if (roles.length < 1) return { result: false, rarity: result.item }
  const randomRole = roles[Math.floor(Math.random() * roles.length)];
  return { result: true, randomRole: randomRole, roleType: rarities[result.index].roleType, rarity: result.item };
}