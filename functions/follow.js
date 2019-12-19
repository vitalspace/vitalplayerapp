'use strict'
// ========== [ Dependencies ] ========== //
const path = require('path');
const fs = require('fs-extra');
const fkill = require('fkill');
const puppeteer = require('puppeteer-core');
// ========== [ Settings ] ========== //
const spotify = "https://open.spotify.com";
const login = "https://accounts.spotify.com/login";
const playlist = "https://open.spotify.com/playlist/3ux7PjJXjJpZY44cnvwRUP";
// ========== [ Utils ] ========== //
const { getExecutablePath } = require('../src/utils/utils');
// ========== [ Run Program ] ========== //
const run = async () => {
  const executablePath = await getExecutablePath({});
  await lauchpuppeteer({ executablePath });
}
// ========== [ Program ] ========== //
const lauchpuppeteer = async launchOptions => {
  const browser = await puppeteer.launch({
    headless: false,
    //userDataDir: './data',
    defaultViewport: null,
    args: [
      `--app=${spotify}`,
      '--window-size=1,1',
      '--disable-audio-output',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--no-sandbox', "--disable-setuid-sandbox"],
    ignoreDefaultArgs: ['--enable-automation'],
    ...launchOptions
  });
  // ========== [ Load user data ] ========== //
  let data;
  const pathdata = await './userdata/userdata.json';
  if (await fs.existsSync(pathdata)) {
    const json = await fs.readFileSync('./userdata/userdata.json', 'utf-8');
    data = await JSON.parse(json);
  }
  const [page] = await browser.pages();
  browser.on('targetdestroyed', async () => {
    await fkill('vitalplayer.exe');
  });

  await page.setViewport({width: 1, height: 1});
  // ========== [ Chek the login ] ========== //
  await page.goto(login, { timeout: 0, waitUntil: "networkidle2" });
  await page.waitForSelector('#login-username');
  await page.type('#login-username', data.email, { delay: 100 });
  await page.waitForSelector('#login-password');
  await page.type('#login-password', data.password, { delay: 100 });
  await page.waitForSelector('#login-button');
  await page.$eval('#login-button', elem => elem.click());
  await page.waitFor(10000);
  if (await page.$('p.alert.alert-warning') !== null) {
    fs.rmdirSync('../userdata/userdata.json');
  } else {
    await functions(page);
  }
}
const functions = async (page) => {
  // ========== [ Go randomly to a playlist. ] ========== //
  await page.goto(`${playlist}`, { timeout: 0, waitUntil: "networkidle2" });

  await page.waitFor(5000);

  // ========== [ Play the playlist. ] ========== //
  if (await page.$('button.btn.btn-green.false') !== null) {
    await page.$eval('button.btn.btn-green.false', elem => elem.click());
    console.log('ok you r playing the list.')
  }

  await page.waitFor(5000);

  // ========== [ Add list to your library. ] ========== //
  if (await page.$('div.spoticon-heart-active-24') !== null) {
    console.log('You have already added this list to your collection.')
  } else {
    await page.$eval('button.btn.btn-transparent.btn--narrow', elem => elem.click());
    console.log('Adding this list to your collection.')
  }

  await page.waitFor(5000);

  // ========== [ Makes the songs play randomly. ] ========== /
  if (await page.$('button.control-button.spoticon-shuffle-16.control-button--active') !== null) {
    console.log('The list is already being randomized.');
  } else {
    await page.$eval('button.control-button.spoticon-shuffle-16', elem => elem.click());
    console.log('I will play the list at random.');
  }

  await page.waitFor(5000);

  // ========== [ Repeat the playlist ] ========== //
  if (await page.$('button.control-button.spoticon-repeat-16.control-button--active')) {
    console.log('This playlist is already being repeated.');
  } else {
    await page.$eval('button.control-button.spoticon-repeat-16', elem => elem.click());
    console.log('I will repeat this playlist.');
  }
}

module.exports = run;