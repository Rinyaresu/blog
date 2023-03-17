---
title: How to create a rails app with docker
pubDate: 2022-12-05
tags:
  - docker
  - rails
---

## Define the project

Create a directory and define a `Dockerfile`. To begin with, the `Dockerfile` consists of:

```docker
# syntax=docker/dockerfile:1
FROM ruby:3.1.2
RUN apt-get update -qq && apt-get install -y nodejs postgresql-client
WORKDIR /myapp
COPY Gemfile /myapp/Gemfile
COPY Gemfile.lock /myapp/Gemfile.lock
RUN bundle install

# Configure the main process to run when running the image
CMD ["rails", "server", "-b", "0.0.0.0"]
```

Create a bootstrap `Gemfile` and write this:

```ruby
source 'https://rubygems.org'
gem 'rails'
```

Create an empty `Gemfile.lock` file to build our Dockerfile.

```fish
touch Gemfile.lock
```

Finally,`docker-compose.yml` is where the magic happens. This file describes the services that comprise your app (a database and a web app), how to get each one's Docker image (the database just runs on a pre-made [PostgreSQL](https://www.postgresql.org/) image, and the web app is built from the current directory), and the configuration needed to link them together and expose the web app's port.

```yaml
services:
  db:
    image: postgres
    volumes:
      - ./tmp/db:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: password
  web:
    build: .
    command: bash -c "rm -f tmp/pids/server.pid && bundle exec rails s -p 3000 -b '0.0.0.0'"
    volumes:
      - .:/myapp
    ports:
      - "3000:3000"
    depends_on:
      - db
```

## Build the project

With those files in place, you can now generate the [Rails](https://rubyonrails.org/) skeleton app using [docker compose run](https://docs.docker.com/engine/reference/commandline/compose_run/):

```fish
docker compose run --no-deps web rails new . --force --database=postgresql
```

**_if you receive this error `(defined?(@source) && @source) || Gem::Source::Installed.new`, use the command `docker compose build`_**

If you are running Docker on Linux, the files `rails new` created are owned by root. This happens because the Container runs as the root user. If this is the case, change the ownership of the new files.

```fish
sudo chown -R $USER:$USER .
```

Now that you’ve got a new `Gemfile`, you need to build the image again.

```fish
docker compose build
```

## Connect the database

The app is now bootable, but you're not quite there yet. By default, [Rails](https://rubyonrails.org/) expects a database to be running on `localhost` - so you need to point it at the `db` Container instead. You also need to change the database and username to align with the defaults set by the `postgres` image.

Replace the contents of `config/database.yml` with the following:

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  host: db
  username: postgres
  password: password
  pool: 5

development:
  <<: *default
  database: myapp_development

test:
  <<: *default
  database: myapp_test
```

You can now boot the app with [docker compose up](https://docs.docker.com/engine/reference/commandline/compose_up/). If all is well, you should see some PostgreSQL output:

```fish
docker compose up
```

Finally, you need to create the database. In another terminal, run:

```fish
docker compose run web rake db:create
```

## Stop the application

```fish
docker compose down
```

---

## References

- [Quickstart: Compose and Rails](https://github.com/docker/awesome-compose/tree/master/official-documentation-samples/rails/)