import path from 'node:path';
import { Config } from '@remotion/cli/config';
import { enableTailwind } from '@remotion/tailwind-v4';
import webpack from './node_modules/@remotion/bundler/node_modules/webpack/lib/index.js';

// The promo renders the frontend's own components with its own CSS. One React copy (this project's),
// everything else (Mantine, router, query) resolves from frontend/node_modules.
const frontend = path.resolve(process.cwd(), '../frontend');
Config.setVideoImageFormat('jpeg');
Config.setConcurrency(6);
Config.overrideWebpackConfig((config) => {
  const withTailwind = enableTailwind(config);
  return {
    ...withTailwind,
    resolve: {
      ...withTailwind.resolve,
      alias: {
        ...(withTailwind.resolve?.alias as Record<string, string>),
        react: path.resolve(process.cwd(), 'node_modules/react'),
        'react-dom': path.resolve(process.cwd(), 'node_modules/react-dom'),
      },
      modules: [...(withTailwind.resolve?.modules ?? ['node_modules']), path.join(frontend, 'node_modules')],
    },
    plugins: [
      ...(withTailwind.plugins ?? []),
      new webpack.DefinePlugin({
        'process.env.PROMO_RECTS': JSON.stringify(process.env.PROMO_RECTS ?? ''),
        'import.meta.env': JSON.stringify({ BASE_URL: '/', VITE_API_BASE_URL: '', VITE_SOCIAL_ENABLED: 'true', MODE: 'production', DEV: false, PROD: true }),
      }),
    ],
  };
});
