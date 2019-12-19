'use strict'
// ==========  [ Dependencies ] ========== // 
const path = require('path');
const fs = require('fs-extra');
const delay = require('delay');
const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const puppeteer = require('puppeteer-core');
// ========== [ Set Icon ] ========== //
const nativeImage = require('electron').nativeImage;
let image = nativeImage.createFromPath(__dirname + '/src/public/icon/logo1.png'); 
image.setTemplateImage(true);
// ==========  [ Utils ] ========== // 
const { getExecutablePath } = require('./src/utils/utils');
const run = require('./functions/follow');
// ==========  [ Sever ] ========== // 
require('./src/app');
// ==========  [ Create userdata ] ========== // 
let userdata = './userdata';
if (!fs.existsSync(userdata)) {
  fs.mkdirSync(userdata);
} 

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    maximizable: false,  
    icon: image, 
    webPreferences: {
      nodeIntegration: true
    },
  })
  validatedata(mainWindow);  
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});


// ========== [ Validate Data ] ========== //

const validatedata = (mainWindow) => {
  
  const data = './userdata/userdata.json';
  if (fs.existsSync(data)) {
    mainWindow.setMenuBarVisibility(false)
    mainWindow.loadURL(`file://${__dirname}/src/welcome.html`);
  }else {
    mainWindow.setMenuBarVisibility(false)
    mainWindow.loadURL(`file://${__dirname}/src/index.html`);    
  }
}

// ========== [ Update ] ========== //

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

// ========== [ Routers ] ========== //

ipcMain.on('asynchronous-message', (event, arg) => { // ========== Go to Welcome

  const obj = { email: arg.email, password: arg.pass };

  const spotify = "https://open.spotify.com";
  // ========== [ Run program ] ========== //
  (async function run() {
    const executablePath = await getExecutablePath({});
    await lauchpuppeteer({ executablePath });
  })();

  const lauchpuppeteer = async launchOptions => {
    const browser = await puppeteer.launch({
      defaultViewport: null,
      //headless: false,
      //userDataDir: './data',
      args: [`--app=${spotify}`,
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--no-sandbox'],
      ignoreDefaultArgs: ['--enable-automation'],
      ...launchOptions
    });
    const [page] = await browser.pages();
    await page.goto('https://accounts.spotify.com/login');
    await page.waitForSelector('#login-username');
    await page.type('#login-username', arg.email, { delay: 100 });
    await page.waitForSelector('#login-password');
    await page.type('#login-password', arg.pass, { delay: 100 });
    await page.waitForSelector('#login-button');
    await page.$eval('#login-button', elem => elem.click());

    await page.waitFor(5000);

    if (await page.$('p.alert.alert-warning') !== null) {
      event.sender.send('asynchronous-reply', '<div class="colorb-youtube fontsize-12 colort-white paddingt-15 paddingb-15 borderr-5 text-center">Incorrect email or password.</div>');
      await delay(4000);
      mainWindow.loadURL(`file://${__dirname}/src/index.html`);    
      await page.close();
    } else {
      const json_use_data = JSON.stringify(obj);
      fs.writeFileSync('./userdata/userdata.json', json_use_data, 'utf-8');
      event.sender.send('asynchronous-reply', '<div class="colorb-qepal fontsize-12 colort-white paddingt-20 paddingb-20 borderr-5 text-center">Welcome right away you will be redirected.</div>');
      await delay(5000);
      mainWindow.loadURL(`file://${__dirname}/src/welcome.html`);
      await page.close();
    }
  }
});

ipcMain.on('internet-lists', (event, arg) => { // ========== Go to list
  mainWindow.loadURL(`http://localhost:4000/lists`); 
});

ipcMain.on('execute-follow', (e, a) => {
  run();
});