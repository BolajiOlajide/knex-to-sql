import {  Command, Flags } from '@oclif/core'
import packageJSON from '../meta.json';
import { defaultMigrationPath, defaultOutputPath, handler } from '../handler';

export default class Kk extends Command {
  static description = packageJSON.description;

  static examples = [
    "$ kk -m <migrations_path> -o <output_path>",
  ]

  static flags = {
    output: Flags.string({
		char: 'o',
		description: 'Directory where computed migrations should live',
		default: defaultOutputPath,
	}),
	migrations_path: Flags.string({
		char: 'm',
		description: 'Directory containing knex migrations',
		default: defaultMigrationPath,
	}),
	debug: Flags.boolean({
		char: 'd',
		description: 'Run command in debug mode',
		default: false,
	}),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Kk);

	await handler({
		output: flags.output,
		migrations_path: flags.migrations_path,
		debug: flags.debug,
	});
  }
}
