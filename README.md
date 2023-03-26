# Knex-To-Kat

The motivation for building [kat](https://github.com/BolajiOlajide/kat) is to have a migration tool in Golang that works similar to Knex. I love the way knex migration file names are a combination of timestamps with the description of the migration.

While playing around with Go, I find it increasing easier and safer (*subjective opinion here*) to write raw SQLs instead of using ORMs like Gorm/Knex e.t.c

This tool which is run as a CLI with a `kk` command is used to convert migrations created with knex in a directory into a format compatible with Kat.

The format used by kat is to have a directory for each migration, named similar to how Knex names it's migration files, then creates a `.sql` file for the `up` and `down` SQL commands for a given migration.

## Installation

-- TODO

### Usage

To convert migrations in a directory `migrations` to the raw SQL equivalent:

```sh
kk <input_path> -o <output_path>
```

`input_path` is required, it can be a file or a directory. Output file is optional, if not provided, it'll create a `kat_migrations` directory in the current working directory.
