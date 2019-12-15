'use strict'
// ========== [ Dependencies ] ========== //
const path = require('path');
const fs = require('fs-extra');
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
    //headless: false,
    //userDataDir: './data',
    defaultViewport: null,
    args: [
      '--disable-audio-output',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--no-sandbox'],
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
  // ========== [ Go to Spotify ] ========== //
  await page.goto(`${spotify}`, { timeout: 0, waitUntil: "networkidle2" });
  // ========== [ Chek the login ] ========== //
  if (await page.$('button._2221af4e93029bedeab751d04fab4b8b-scss._1edf52628d509e6baded2387f6267588-scss') !== null) {
    await page.goto(login, { timeout: 0, waitUntil: "networkidle2" });
    await page.waitForSelector('#login-username');
    await page.type('#login-username', data.email, { delay: 100 });
    await page.waitForSelector('#login-password');
    await page.type('#login-password', data.password, { delay: 100 });
    await page.waitForSelector('#login-button');
    await page.$eval('#login-button', elem => elem.click());
    await page.waitFor(10000);
    if (await page.$('p.alert.alert-warning') !== null) {
      console.log('Correo o password incorrectos');
      await page.close();
    } else {
      await functions(page);
    }
  } else {
    await functions(page);
  }
}
const functions = async (page) => {
  // ========== [ Go randomly to a playlist. ] ========== //
  await page.goto(`${playlist}`, { timeout: 0, waitUntil: "networkidle2" });
  // ========== [ Wait for 5 seconst to the next function ] ========== //
  await page.waitFor(5000);
  // ========== [ Play the playlist. ] ========== //
  await page.$eval('button.btn.btn-green.false', elem => elem.click());
  // ========== [ Wait for 5 seconst to the next function ] ========== //
  await page.waitFor(5000);
  // ========== [ Add list to your library. ] ========== //
  if (await page.$('div.spoticon-heart-active-24') !== null) {
    console.log('ok')
  } else {
    await page.$eval('button.btn.btn-transparent.btn--narrow', elem => elem.click());
  }
  // ========== [ Wait for 5 seconst to the next function ] ========== //
  await page.waitFor(5000);
  // ========== [ Makes the songs play randomly. ] ========== /
  if (await page.$('button.control-button.spoticon-shuffle-16.control-button--active') !== null) {
    console.log('ok')
  } else {
    await page.$eval('button.control-button.spoticon-shuffle-16', elem => elem.click());
  }
}

module.exports = run;