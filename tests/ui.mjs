import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve('dist'), photos = process.env.UI_EVIDENCE_DIR;
if (photos) await mkdir(photos,{recursive:true});
const server=createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 const file=resolve(root,'.'+(path==='/'?'/index.html':path));
 if(!file.startsWith(root+sep))return res.writeHead(403).end();
 try{const data=await readFile(file);res.writeHead(200,{'content-type':{'.js':'text/javascript','.html':'text/html','.css':'text/css'}[extname(file)]||'application/octet-stream'}).end(data);}
 catch{res.writeHead(404).end();}
});
await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok);});
let browser;
try {
 browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||undefined});
 const page=await browser.newPage({viewport:{width:1280,height:850}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port);
 const shot=async name=>{if(photos)await page.screenshot({path:resolve(photos,name+'.png'),fullPage:true});};
 const y=true;
 const choose=(id,name)=>y?page.getByRole('combobox').selectOption(id):page.getByRole('button',{name:new RegExp(name)}).click();
 const check=()=>page.getByRole('button',{name:'Check Availability'}).click();
 const result=page.getByTestId('availability-result');
 const setTime=async (a,b)=>{await page.locator('#start-time').fill(a);await page.locator('#end-time').fill(b);};
 await setTime(y?'10:00':'600',y?'11:00':'660');
 await check();assert.match(await result.innerText(),/Unavailable/i);
 await choose(y?'room-204':'darwin-105',y?'Room 204':'Darwin 105');
 assert.equal(await result.count(),0);await check();assert.match(await result.innerText(),/\bAvailable\b/);await shot('01-room-switch');
 console.log('PASS F5: selecting another room cleared feedback and changed the result for the same interval.');
 const required=y?['Projector','Whiteboard']:['Display','Whiteboard'];
 await page.getByLabel('Attendees').fill(y?'30':'40');
 for(const item of required)await page.getByLabel(item,{exact:true}).check();
 if(y)assert.deepEqual(await page.getByRole('combobox').locator('option').evaluateAll(xs=>xs.map(x=>x.value)),['room-101']);
 else {assert.equal(await page.getByRole('button',{name:/Watson 101/}).count(),1);assert.equal(await page.getByRole('button',{name:/Einstein 330|Thoreau 015|Darwin 105|Kepler 220/}).count(),0);}
 assert.equal(await result.count(),0);await shot('02-exact-capacity-and-equipment');
 console.log('PASS F1/F2: exact capacity and both required items; only the matching room is shown.');
 await page.getByLabel('Attendees').fill('1000');
 assert.match(await page.getByRole('status').innerText(),/No rooms match/);
 const button=page.getByRole('button',{name:'Check Availability'});
 if(await button.count())assert.equal(await button.isEnabled(),false);
 assert.equal(await result.count(),0);await shot('03-empty-state');
 console.log('PASS F4: no matches, no old result, and no enabled check.');
 await page.getByLabel('Attendees').fill('1');
 for(const item of required)await page.getByLabel(item,{exact:true}).uncheck();
 await choose(y?'room-307':'kepler-220',y?'Room 307':'Kepler 220');
 await setTime(y?'15:00':'900',y?'16:00':'960');await check();
 assert.match(await result.innerText(),/blocked/i);await shot('04-blocked-room');
 console.log('PASS F3: blocked room rejected in an otherwise free interval.');
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
 assert.match(await result.innerText(),/blocked/i);assert.deepEqual(errors,[]);await shot('05-mobile');
 console.log('PASS AC6: 390 px layout with feedback, no horizontal overflow or uncaught errors.');
} finally {await browser?.close();await new Promise(ok=>server.close(ok));}
