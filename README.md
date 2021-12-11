# Getting Started with Fastify-CLI [Fastify-CLI](https://www.npmjs.com/package/fastify-cli)
This project was bootstrapped with Fastify-CLI.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm start`

For production mode

### `npm run test`

Run the test cases.

## Learn More

To learn Fastify, check out the [Fastify documentation](https://www.fastify.io/docs/latest/).

## Nginx
```
	server {
	  listen 80;

	  server_name faucet.lucq.fun;

	  root /var/www/nelo-faucet-web/build;
	  index index.html;

	  location / {
		try_files $uri $uri/ =404;
	  }
	  location /faucet {
		proxy_pass http://127.0.0.1:4001;
		proxy_set_header Host $http_host;
		proxy_set_header X-Real-IP $remote_addr;
	  }
	}
```
