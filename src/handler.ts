import fs from 'fs';
import path from 'path';
import knex, { Knex } from 'knex';
import { format, FormatOptionsWithLanguage } from 'sql-formatter';

import { KKArgs, Migration } from './types';

// default values
export const defaultOutputPath = path.join(process.cwd(), 'kk-migrations');
export const defaultMigrationPath = path.join(process.cwd(), 'migrations');

export const handler = async (opts: KKArgs): Promise<void> => {
	let client: Knex | undefined

	try {
		const migrationsPath = path.resolve(opts.migrations_path)
		const outputPath = path.resolve(opts.output)

		validateDirectory(migrationsPath, 'migrations path', false);
		validateDirectory(outputPath, 'output path', true);

		client = createKnexClient();

		const filesInDirectory = fs.readdirSync(migrationsPath, {
			encoding: 'utf-8'
		})

		// if the output path already exists, let's delete all the files inside of it
		await deleteAllFilesInDirectory(outputPath)

		for (let i = 0; i < filesInDirectory.length; i++) {
			const filePath = filesInDirectory[i]
			const migrationFilePath = path.join(migrationsPath, filePath);
			const migration: Migration = require(path.resolve(migrationFilePath));

			const upQueries = migration.up(client).toString();
			let downQueries: string | undefined
			if (migration.down) {
				downQueries = migration.down(client).toString();
			}

			const newDirectoryName = stripExtensionFromPath(filePath);
			const directoryPath = path.resolve(path.join(outputPath, newDirectoryName));

			fs.mkdirSync(directoryPath);

			const formatterOptions: FormatOptionsWithLanguage = {
				language: 'postgresql',
				keywordCase: 'upper',
				tabWidth: 4,
				useTabs: true,
			}

			fs.writeFileSync(path.join(directoryPath, 'up.sql'), format(upQueries, formatterOptions));
			fs.writeFileSync(path.join(directoryPath, 'down.sql'), format(downQueries || '-- No down query.', formatterOptions));
			fs.writeFileSync(path.join(directoryPath, 'metadata.yaml'), extractMetatadata(newDirectoryName));
		}
	} catch (error: unknown) {
		console.log('an error occurred', (error as Error).message)
	}
};

/**
 * This method is used to validate a directory and can create it if it doesn't exist.
 *
 * @param directory The directory to be validated.
 * @param name The name of the directory. This is used for error formating.
 * @param createIfNotExist Boolean indicating whether the directory should be created if it doesn't exist.
 */
const validateDirectory = (directory: string, name: string, createIfNotExist: Boolean): void => {
	const doesPathExist = fs.existsSync(directory);
	if (!doesPathExist) {
		if (createIfNotExist) {
			fs.mkdirSync(directory, { recursive: true });
		} else {
			throw new Error(`${name} does not exist`);
		}
	}

	// next we validate that the path points to a directory
	const isDirectory = fs.lstatSync(directory).isDirectory();
	if (!isDirectory) {
		throw new Error(`${name} does not point to a directory. A directory is required for '${name}'`)
	}
};

const createKnexClient = (): Knex => knex({
	client: 'pg',
});

const stripExtensionFromPath = (filePath: string): string => {
	const extension = path.extname(filePath);
	return filePath.replace(extension, '');
}

const extractMetatadata = (filePath: string): string => {
	const lastUnderscoreIndex = filePath.lastIndexOf('_');
	const timestamp = filePath.slice(0, lastUnderscoreIndex);
	const name = filePath.slice(lastUnderscoreIndex + 1);

	return `name: ${name}
timestamp: ${timestamp}`;
};

async function deleteAllFilesInDirectory(directoryPath: string): Promise<void> {
	const files = await fs.promises.readdir(directoryPath);
	for (const file of files) {
		const filePath = path.join(directoryPath, file);
		await fs.promises.unlink(filePath);
	}
};
