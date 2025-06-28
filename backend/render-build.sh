#!/usr/bin/env bash

# Run sequelize migrations safely using npx with no-install
npx --no-install sequelize-cli db:migrate

# Start the server
npm start
