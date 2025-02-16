import 'zone.js';  // Required for Angular testing
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
setupZoneTestEnv();
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;


// Polyfill ReadableStream for Firebase
if (typeof global.ReadableStream === 'undefined') {
  Object.defineProperty(global, 'ReadableStream', {
    value: require('stream/web').ReadableStream,
    writable: true,
  });
}