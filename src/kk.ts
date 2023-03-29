#!/usr/bin/env node

import { Command } from 'commander';

import meta from './meta.json';
import { handler, defaultOutputPath, defaultMigrationPath } from './handler';

const program = new Command(meta.name);

program
	.name('kk')
	.description(meta.description)
	.version(meta.version)
	.usage("-m <migrations_path> -o <output_path>")
	.option('-o, --output <path>', 'directory where computed migrations should live', defaultOutputPath)
	.option('-m, --migrations_path <path>', 'directory containing knex migrations', defaultMigrationPath)
	.helpOption('-h, --help', 'output usage information')
	.action(handler)
	.parse();
