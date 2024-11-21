import express from 'express';
import path from 'path';
import * as fs from 'fs';
import { createServer, loadEnv, type ViteDevServer } from 'vite';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

expand(config());

const app = express();

const NODE_ENV = process.env.NODE_ENV;
const PORT = Number.parseInt(process.env.PORT || '8000');
const isProduction = NODE_ENV === 'production';
const FRONTEND_PATH = process.env.FRONTEND_PATH as string;

let template: string;
let server: ViteDevServer;

const getHTMlTemplate = async () => {
  if (template) {
    return template;
  }

  if (isProduction) {
    template = fs.readFileSync(
      path.resolve(FRONTEND_PATH, 'dist/client/index.html'),
      'utf-8',
    );
    const compression = (await import('compression')).default;
    const sirv = (await import('sirv')).default;
    app.use(compression());
    // Server static files at `/static`
    app.use(
      '/static',
      sirv(path.resolve(FRONTEND_PATH, './dist/client'), { extensions: [] }),
    );
    return;
  }

  // Dev Server creation (includes Hot Module Replacement as well)
  loadEnv('development', process.cwd());

  server = await createServer({
    appType: 'custom',
    server: { middlewareMode: true },
    css: {
      transformer: 'postcss',
    },
    publicDir: path.join(FRONTEND_PATH, 'public'),
    define: {
      'process.env': JSON.stringify(process.env),
    },
    root: path.join(process.cwd(), '..', 'frontend'),
  });

  template = fs.readFileSync(
    path.resolve(FRONTEND_PATH, 'index.html'),
    'utf-8',
  );

  app.use(server.middlewares);
};

// Vite Related Code
app.use('/app', async (req, res) => {
  let render, transformedHTML;

  if (isProduction) {
    const serverFilePath = path.resolve(
      FRONTEND_PATH,
      'dist/server/entry-server.js',
    );
    render = (await import(serverFilePath)).render;
    transformedHTML = template;
  } else {
    transformedHTML = await server.transformIndexHtml(
      req.originalUrl,
      template,
    );
    const serverFile = path.resolve(FRONTEND_PATH, 'src/entry-server.tsx');
    render = (await server.ssrLoadModule(serverFile)).render;
  }

  const { html: appHtml } = await render();

  let html = transformedHTML.replace(`<!--ssr-outlet-->`, appHtml);

  res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
});

app.get('/', async (req, res) => {
  res.json({ message: 'Working Perfect!', status: true });
  return;
});

app.listen(PORT, '0.0.0.0', async () => {
  await getHTMlTemplate();
  console.log(`Server Running at http://localhost:${PORT}`);
});
