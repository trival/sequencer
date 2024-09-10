# trival sequencer client

Web frontend for the little scetchbook for melodies and harmonies with a mobile
friendly interface. Implemented with Solid.js and Tone.js.

## Developmet

```bash
npm install
npm run dev
```

The client uses a cloudflare pages function to proxy the requests to the server.
In development this is not needed and the `VITE_TRPC_DEV_SERVER_URL` variable
can be used to communicate with the server. Create a `.env` file to set this env
var.

To test the pages function locally, run the build command and start the server
using wrangler. Set the required `REMOTE_API_URL` env var in the `.dev.vars`
file.

```bash
npm run build
npx wrangler pages dev dist
```

## License

This project is licensed under the MIT license. See the [LICENSE](../LICENSE)
file for more info.
