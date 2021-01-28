# Test Dapplet Registry

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Public Test Registry API
[API Documentation is here](https://github.com/dapplets/test-registry/blob/master/docs/REGISTRY-API.md)

### Solution Structure

```
$/
  build/
  data/
  docs/
  src/
  test/
  typings/
```

- `build` - Build bundles
- `data` - File storage of modules and account configs
- `docs` - Documentation
- `src` - Sources
- `test` - Mocha tests
- `typings` - TypeScript typings

### Building

1.  Clone repo
2.  `npm install`
3.  `npm start` or `npm run start:watch` to start development server.
4.  `npm run build` to build JS bundles to `/build` folder.
5.  `npm run test` or `npm run test:watch` to run tests.

## Built With

* [TypeScript](https://www.typescriptlang.org/)
* [Node.js](https://nodejs.org/)
* [Express](https://expressjs.com/)

## Authors

* **Dmitry Palchun** - *Initial work* - [ethernian](https://github.com/ethernian)
* **Alexander Sakhaev** - *Initial work* - [alsakhaev](https://github.com/alsakhaev)