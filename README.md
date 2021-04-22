![pipeline](../../workflows/pipeline/badge.svg) ![Coverage](./badges/coverage.svg)

# ODI Generator

NodeJS project for ODI spreadsheet generation

## Requirements

-   [NodeJS](https://nodejs.org/en/download/)

## OpenAPI 3.0

[API Documentation](https://lmanerich.github.io/odi-generator/)

## How to deploy

```
npm install
npm run build
npm run prod
```

### Using PM2 to deploy a clustered environment

Install PM2 using npm:

```
npm install pm2 -g
```

Register the application as a service

```
pm2 start dist/odi-generator-bundle.js
```

Usefull PM2 commands

```
pm2 list
pm2 monit
pm2 delete odi-generator-bundle
```

## Available development commands

```
npm run test
npm run test:coverage
```
