// Fresh browser profiles only; this script never creates a live account or handles recovery words.
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:process.env.SMOKE_CHROMIUM_EXECUTABLE,args:process.platform === 'linux' ? ['--enable-unsafe-webgpu','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-features=Vulkan','--use-vulkan=swiftshader','--disable-vulkan-surface'] : ['--enable-unsafe-webgpu']});
try{for(const mode of ['failure','slow']){
 const context=await browser.newContext();const page=await context.newPage();
 await page.route(/\/assets\/integration-.*\.js/,async r=>{if(mode==='slow')await new Promise(resolve=>setTimeout(resolve,17000));try{await r.abort();}catch{}});
 await page.goto(process.argv[2] ?? 'http://127.0.0.1:4175/');await page.getByRole('button',{name:'Start',exact:true}).click({timeout:60000});
 await page.getByRole('button',{name:'Open settings',exact:true}).click();await page.getByRole('button',{name:'⚡ Account',exact:true}).click();
 await page.getByText('Account is unavailable. Return to Settings and try again.',{exact:true}).waitFor({timeout:25000});
 await page.getByRole('button',{name:'Back to Settings',exact:true}).click();await page.getByRole('button',{name:'Close settings',exact:true}).last().click();
 assert.equal(await page.locator('.game-account-host').isVisible(),false);await page.waitForTimeout(2500);assert.equal(await page.locator('.game-account-host').isVisible(),false);
 console.log('PASS production '+mode+': guest startup, bounded failure, Back to Settings, close to gameplay, no late reopen');await context.close();
}}finally{await browser.close();}
