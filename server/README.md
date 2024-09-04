# trival-sequencer-server

This is the server for the trival-sequencer project. It is deployed as Worker on
Cloudflare Workers. Data is stored in Cloudflare D1.

To install dependencies:

```bash
npm install
```

To run:

```bash
npm run dev
```

## Deployment

First check apply migrations locally:

```bash
npx wrangler d1 migrations list sequencer-db --local
npx wrangler d1 migrations apply sequencer-db --local
```

Then check the same remote on Cloudflare D1:

```bash
npx wrangler d1 info sequencer-db
npx wrangler d1 migrations list sequencer-db --remote
npx wrangler d1 migrations apply sequencer-db --remote
```

Set the secret in the Worker: SESSION_SECRET="<my-secret>"

Finally, deploy the Worker:

```bash
npm run deploy
```

## License

This project is licensed under the MIT license. See the [LICENSE](../LICENSE)
file for more info.
