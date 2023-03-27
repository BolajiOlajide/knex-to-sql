import { Knex } from 'knex';

export interface KKArgs {
	output: string;
	migrations_path: string;
	debug: boolean;
}

export interface Migration {
	up: (knex: Knex) => PromiseLike<any>;
	down?: (knex: Knex) => PromiseLike<any>;
}
