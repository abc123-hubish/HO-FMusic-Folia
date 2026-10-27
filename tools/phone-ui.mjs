import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// Inspect and operate only Folia's accessibility nodes on the explicitly selected test phone.
const hdc = 'D:/dev26/DevEco Studio/sdk/default/openharmony/toolchains/hdc.exe';
const device = '8BBUT26909010371';
const evidence = path.resolve('verification');
const run = (...args) => execFileSync(hdc, ['-t', device, ...args], { encoding: 'utf8' });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function layout() {
  run('shell', 'uitest', 'dumpLayout', '-b', 'com.bogdan.folia', '-p', '/data/local/tmp/folia-ui.json');
  run('file', 'recv', '/data/local/tmp/folia-ui.json', path.join(evidence, 'phone-ui.json'));
  const tree = JSON.parse(fs.readFileSync(path.join(evidence, 'phone-ui.json'), 'utf8'));
  const nodes = [];
  const visit = node => { if (node.attributes) nodes.push(node.attributes); (node.children || []).forEach(visit); };
  visit(tree);
  return nodes;
}
const [action = 'dump', label = '', name = 'phone-settings'] = process.argv.slice(2);
let nodes = layout();
if (action === 'tap') {
  const node = nodes.find(item => item.text === label && ['button', 'switch', 'toggleButton'].includes(item.type));
  if (!node) throw new Error(`No visible Folia control: ${label}`);
  const rect = node.bounds.match(/\d+/g).map(Number);
  console.log(`Tapped ${label} at ${node.bounds}`);
  run('shell', 'uitest', 'uiInput', 'click', String(Math.round((rect[0] + rect[2]) / 2)), String(Math.round((rect[1] + rect[3]) / 2)));
  await delay(1000);
  nodes = layout();
}
if (action === 'shot') {
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) throw new Error('Invalid evidence name');
  run('shell', 'uitest', 'screenCap', '-p', '/data/local/tmp/folia-ui.png');
  run('file', 'recv', '/data/local/tmp/folia-ui.png', path.join(evidence, `${name}.png`));
}
console.log(JSON.stringify(nodes.filter(item => ['Web', 'button', 'switch', 'toggleButton'].includes(item.type))
  .map(item => ({ type: item.type, text: item.text, checked: item.checked, bounds: item.bounds })), null, 2));
