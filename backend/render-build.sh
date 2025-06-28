#!/usr/bin/env bash

# Run migration using npx with explicit path
./node_modules/.bin/sequelize-cli db:migrate

# Start server
npm start
