---
title: How to create a rails app with docker
pubDate: 2022-12-08
tags:
  - docker
---

|> This repository use [Ruby on Rails](https://rubyonrails.org/)

- In your repository, create the `.github/workflows/` directory to store your workflow files.
- In the `.github/workflows/` directory, create a new file called `rubyonrails-ci.yml` and add the following code.

This workflow will install a prebuilt Ruby version and Chrome, install dependencies, and run tests and linters.

```yaml
name: "Ruby on Rails CI"
on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:11-alpine
        ports:
          - "5432:5432"
        env:
          POSTGRES_DB: rails_test
          POSTGRES_USER: rails
          POSTGRES_PASSWORD: password
    env:
      RAILS_ENV: test
      DATABASE_URL: "postgres://rails:password@localhost:5432/rails_test"
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      - name: Setup Chrome
        run: |
          wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
          sudo apt install ./google-chrome-stable_current_amd64.deb
      - name: Install Ruby and gems
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: 3.1.2
      - name: Set up dependencies
        run: bundle install
      - name: Set up database schema
        run: bin/rails db:schema:load
      - name: Precompile assets
        run: bundle exec rake assets:precompile
      - name: Run tests
        run: bundle exec rspec
```