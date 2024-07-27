import { Collection } from "discord.js";
import { readdirSync } from "node:fs";

export const commands = async () => {
  const commandSet = new Collection();
  const path = './src/commands/';
  /**
   * Recursively pull available categories in command's root directory
   * @example user/system/social/shop/etc
   */
  const directories = readdirSync(path).filter(file => !file.includes(`.`))
  for (const index in directories) {
    const dir = directories[index]
    /**
     * Recursively pull files from a category
     * @example user/system/social/shop/etc
     */
    const files = readdirSync(path + dir)
    const jsfile = files.filter(f => f.split(`.`).pop() === `mjs`)
    for (let i = 0; i < jsfile.length; i++) {
      const file = jsfile[i]
      const src = await import(`./${dir}/${file}`)
      commandSet.set(src.data.name, src)
    }
  }
  return commandSet
}
