'use strict'
// ========== [ Dependencies ] ========== //
const path = require('path');
const fs = require('fs-extra');
const fkill = require('fkill');
const fetch = require('node-fetch');
const puppeteer = require('puppeteer-core');
// ========== [ Settings ] ========== //
const spotify = "https://open.spotify.com";
const login = "https://accounts.spotify.com/login";
const playlist = 'https://pastebin.com/raw/DyeRx5fD';
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
  page.on('close', async () => {
    await fkill('vitalplayer.exe');
    console.log('se cierro chrome')
  })
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
    await fs.rmdirSync('./userdata/userdata.json');
    await fkill('vitalplayer.exe');
  } else {
    await functions(page);
  }
}

const functions = async (page) => {
  let link;
  const links = await (await fetch(playlist)).json();
  const values = await Object.values(links);
  link = await values[parseInt(Math.random() * values.length)];
  // ========== [ Go randomly to a playlist. ] ========== //
  await page.goto(`${link}`, { timeout: 0, waitUntil: "networkidle2" });

  await page.waitFor(5000);

/*   _2221af4e93029bedeab751d04fab4b8b-scss _8fec0262e00c11513faad732021ed012-scss
  _2221af4e93029bedeab751d04fab4b8b-scss _8fec0262e00c11513faad732021ed012-scss */

  // ========== [ Play the playlist. ] ========== //
  if (await page.$('button._2221af4e93029bedeab751d04fab4b8b-scss._8fec0262e00c11513faad732021ed012-scss') !== null) {
    await page.$eval('button._2221af4e93029bedeab751d04fab4b8b-scss._8fec0262e00c11513faad732021ed012-scss', elem => elem.click());
    console.log('ok you r playing the list.')
  }

  await page.waitFor(5000);

  // ========== [ Add list to your library. ] ========== //
  if (await page.$('button.control-button.spoticon-heart-active-16.control-button--active') !== null) {
    console.log('You have already added this list to your collection.')
  } else {
    await page.$eval('button.control-button.spoticon-heart-16', elem => elem.click());
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
