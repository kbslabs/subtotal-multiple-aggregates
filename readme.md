# Subtotal multiple aggregates
This is a fork from  [4mile](https://github.com/4mile/subtotal-multiple-aggregates) version of the subtotal plugin for [PivotTable.js](https://pivottable.js.org/examples/), this has a specific collapse behavior for summarizing rows.

## Development
In order to test this locally you must run:

1.- `npm ci`

2.- `npm run build:dev`

3.- `npm run start:dev` 

This will launch the project into the port 8080 (or another depending on availability) of the localhost.

## Deploy
This project uses circle CI environment to deploy, every push to master publish a new version into the package repo.