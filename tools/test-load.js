const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const path = require('path');

const vc = new VirtualConsole();
vc.on('error', (e) => console.log('JS_ERROR:', typeof e === 'string' ? e : e.message || e));
vc.on('warn', (e) => console.log('JS_WARN:', e));

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const dom = new JSDOM(html, {
  url: 'http://localhost:8080/',
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  virtualConsole: vc,
});

setTimeout(() => {
  const w = dom.window;
  console.log('\n=== MODULE CHECK ===');
  ['Chapter1','Items','Enemies','Player','Skills','Inventory','Shops','Pets','Quests','Dialogue','Relationships','Audio','Battle','Exploration','Dungeon','Save','UI','World','Main'].forEach(m => {
    console.log(m + ': ' + typeof w[m]);
  });
  const gc = w.document.getElementById('game-container');
  const st = w.document.getElementById('screen-title');
  console.log('\n=== DOM CHECK ===');
  console.log('game-container classes:', gc ? gc.className : 'NOT FOUND');
  console.log('screen-title classes:', st ? st.className : 'NOT FOUND');
  
  w.close();
  process.exit(0);
}, 8000);
