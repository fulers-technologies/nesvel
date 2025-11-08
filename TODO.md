- console theme system how it works and also some prompts have static colors and
  ymanic from the theme

- refactor all stubs files as some need camelcase and some need different params
  we need an interface for all passed vars to the ejs file,

fileName.replace(/-/g, ' ')

- refactor nesvel/mail/resources/componenets to add docblocks and detailed
  comments all over the code and files file for each
- refactor all database commands

  ```bash
  Commands:
  mikro-orm debug                   Debug CLI configuration

  mikro-orm cache:clear             Clear metadata cache
  mikro-orm cache:generate          Generate metadata cache

  mikro-orm database:create         Create your database if it does not exist
  mikro-orm database:import <file>  Imports the SQL file to the database

                                      schema
  mikro-orm seeder:run              Seed the database using the seeder class
  mikro-orm seeder:create <seeder>  Create a new seeder class

  mikro-orm generate-entities       Generate entities based on current database

  mikro-orm schema:create           Create database schema based on current metadata
  mikro-orm schema:drop             Drop database schema based on current metadata
  mikro-orm schema:update           Update database schema based on current metadata
  mikro-orm schema:fresh            Drop and recreate database schema based on
                                      current metadata
  mikro-orm migration:create        Create new migration with current schema diff
  mikro-orm migration:up            Migrate up to the latest version
  mikro-orm migration:down          Migrate one step down
  mikro-orm migration:list          List all executed migrations
  mikro-orm migration:check         Check if migrations are needed. Useful for bash scripts.
  mikro-orm migration:pending       List all pending migrations
  mikro-orm migration:fresh         Clear the database and rerun all migrations
  ```

-
