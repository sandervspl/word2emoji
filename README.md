<p align="center">
  <img src="https://github.com/LabelA/prime-monorepo/blob/main/prime-logo.png?raw=true" alt="prime-logo" width="250px" />
</p>

# React Web

## Quick start

Use [create-react-prime](https://www.npmjs.com/package/create-react-prime) for easy install.

```
npx create-react-prime@latest
cd <project name>
npm start
```

## Features

- [TypeScript](https://www.typescriptlang.org/)
- [NextJS](https://nextjs.org/)
- [React](https://reactjs.org/)
- [React Query](https://react-query.tanstack.com/overview)
- Refer to `package.json` for more details

## NPM Scripts

- Start develop server: `$ npm start` or `$ npm run dev`
- Create production build: `$ npm run build`
- Start server: `$ npm run server`
- Run Typechecker: `$ npm run typecheck`
- Run Tests: `$ npm run test` or `$ npm t`
- Generate bundle analysis: `$ npm run analyzer`

## Deployment

Make sure all modules are installed:
`npm install`

Create a build for production, this will add a `/.next` folder to the root of the project with the Next.js server and transpiled code.
`npm run build`

Run the server file to start server:
`npm run server`

### PM2

For production I recommend to use [PM2](http://pm2.keymetrics.io/) to run the server with advanced process management.

To start the Next.js server with PM2 you can use this json file

```json
{
  "apps": [
    {
      "name": "my-app",
      "script": "npm",
      "args": "start"
    }
  ]
}
```

or run:

`pm2 start npm --name "my-app" -- start`

## Development Workflow

### Components

The components are separated in `common`, `modules`, `layouts` and `pages`.

- The `common` folder includes components are self-contained and can be used through the entire app
- The `modules` folder includes bundled components which depend on each other.
- The `layouts` folder includes components that should be used with the `Page.layout` prop. See [documentation](https://nextjs.org/docs/basic-features/layouts#with-typescript) (**note:** we use `layout` instead of `getLayout`)
- The `pages` folder contain the routes of the application. See [documentation](https://nextjs.org/docs/basic-features/pages)

### Queries

🚧 WIP

### Static Assets

Any static assets, such as images and SVG, are now placed inside the `public` folder in their respective folder (i.e. `public/images` and `public/vectors`). Importing can be done simply by writing the relative URL (i.e. `/images/your-img.png`) in both CSS and JS. You can still import SVG files as a module

```ts
import PrimeIcon from 'vectors/icon.svg';
```
