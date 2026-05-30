import { createJiti } from '../../node_modules/jiti/lib/jiti.mjs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const PI_CODING_AGENT = '/opt/homebrew/lib/node_modules/@earendil-works/pi-coding-agent';
const PI_AI = PI_CODING_AGENT + '/node_modules/@earendil-works/pi-ai';

const jiti = createJiti(import.meta.url, { 
  interop: true,
  alias: {
    '@earendil-works/pi-ai': PI_AI + '/dist/index.js',
    '@earendil-works/pi-coding-agent': PI_CODING_AGENT + '/dist/index.js'
  }
});

const extPath = path.join(__dirname, 'index.ts');
console.log('Loading extension from:', extPath);

// Create a mock ExtensionAPI
const mockPi = {
  registerProvider: (name, config) => {
    console.log('✅ Provider registered:', name);
    console.log('   Base URL:', config.baseUrl);
    console.log('   API Key env:', config.apiKey);
    console.log('   API type:', config.api);
    console.log('   Models:', config.models.length);
    console.log('   First model:', config.models[0]?.id);
  }
};

jiti.import(extPath)
  .then(m => {
    console.log('Running extension factory...');
    return m.default(mockPi);
  })
  .then(() => console.log('✅ Extension factory executed'))
  .catch(e => console.error('❌ Error:', e.message, e.stack));
