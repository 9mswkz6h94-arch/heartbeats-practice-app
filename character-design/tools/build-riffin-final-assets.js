const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const sprites = path.join(root, 'concept-art', 'sprites');
const sourcePath = path.join(sprites, 'riffin-64x64-v2-candidate.svg');
const source = fs.readFileSync(sourcePath, 'utf8')
  .replace('Gate 2 candidate:', 'Riffin V2 production source:');

function save(name, svg) {
  fs.writeFileSync(path.join(sprites, name), svg, 'utf8');
}

function overlay(svg, markup) {
  return svg.replace('</svg>', `${markup}\n</svg>`);
}

function translate(svg, x, y) {
  const openEnd = svg.indexOf('>') + 1;
  const closeStart = svg.lastIndexOf('</svg>');
  return `${svg.slice(0, openEnd)}\n  <g transform="translate(${x} ${y})">${svg.slice(openEnd, closeStart)}</g>\n</svg>\n`;
}

const idle2 = source.replace(
  'M14 7h3v9h-3V7zm33 0h3v9h-3V7z',
  'M14 8h3v8h-3V8zm33-1h3v9h-3V7z'
);

const musicA = `
  <!-- Three bright music pixels for the celebrate pose. -->
  <g fill="#201923"><path d="M3 15h5v5H3v-5zm48-8h5v5h-5V7zM4 34h5v5H4v-5z"/></g>
  <g fill="#FFD27A"><path d="M4 16h3v3H4v-3zm48-8h3v3h-3V8zM5 35h3v3H5v-3z"/></g>`;

const musicB = `
  <!-- Second celebrate frame: music pixels rise by one grid step. -->
  <g fill="#201923"><path d="M3 13h5v5H3v-5zm49-8h5v5h-5V5zM4 32h5v5H4v-5z"/></g>
  <g fill="#FFD27A"><path d="M4 14h3v3H4v-3zm50-8h3v3h-3V6zM5 33h3v3H5v-3z"/></g>`;

const encouragePaw = `
  <!-- Gentle paw-forward silhouette. -->
  <g fill="#201923"><path d="M5 35h8v3h4v7h-3v3H7v-3H4v-7h1v-3z"/></g>
  <g fill="#E86F21"><path d="M7 37h5v3h3v4h-3v2H8v-2H6v-5h1v-2z"/></g>
  <g fill="#FFD27A"><path d="M8 38h3v3H8v-3z"/></g>`;

const connectPaw = `
  <!-- Raised high-five paw with open cream pad. -->
  <g fill="#201923"><path d="M4 24h8v3h4v9h-3v3H6v-3H3v-9h1v-3z"/></g>
  <g fill="#E86F21"><path d="M6 26h5v3h3v6h-3v2H7v-2H5v-7h1v-2z"/></g>
  <g fill="#FFD27A"><path d="M7 27h3v5H7v-5zm4 3h2v4h-2v-4z"/></g>`;

save('riffin-64x64-v2.svg', source);
save('riffin-idle-01-v2.svg', source);
save('riffin-idle-02-v2.svg', idle2);
save('riffin-dance-01-v2.svg', translate(source, 0, 1));
save('riffin-dance-02-v2.svg', translate(source, 0, -1));
save('riffin-celebrate-01-v2.svg', overlay(source, musicA));
save('riffin-celebrate-02-v2.svg', overlay(idle2, musicB));
save('riffin-sticker-celebrate-v2.svg', overlay(source, musicA));
save('riffin-sticker-encourage-v2.svg', overlay(source, encouragePaw));
save('riffin-sticker-connect-v2.svg', overlay(source, connectPaw));

console.log('Wrote Riffin V2 production SVG family.');
