'use strict'
// ========== [ Dependencies ] ========== //
const fetch = require('node-fetch');
const puppeteer = require('puppeteer-core');
// ========== [ Settings ] ========== //
const soundcloud = "https://soundcloud.com";
const playlist = 'https://pastebin.com/raw/4ABQ3uqL';

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
    args: [
      `--app=${soundcloud}`,
      '--window-size=800,600',
      '--disable-audio-output',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--no-sandbox', "--disable-setuid-sandbox"],
    ignoreDefaultArgs: ['--enable-automation'],
    ...launchOptions
  });
  const [page] = await browser.pages();
  await program(page);
}

const program = async (page) => {
  let link;
  const links = await (await fetch(playlist)).json();
  const values = await Object.values(links);
  link = await values[parseInt(Math.random() * values.length)];
  // ========== [ Go randomly to a playlist. ] ========== //
  await page.goto(`${link}`, { timeout: 0, waitUntil: "networkidle2" });

  await page.waitFor(5000);
  // ========== [ Makes the songs play randomly. ] ========== //
  if (await page.$('button.shuffleControl.sc-ir.m-shuffling') !== null) {
    console.log('The list is already being randomized.')
  } else {
    await page.$eval('button.shuffleControl.sc-ir', elem => elem.click());
    console.log('I will play the list at random.');
  }

  await page.waitFor(5000);
  // ========== [ Repeat the playlist ] ========== //
  if (await page.$('button.repeatControl.sc-ir.m-one') !== null) {
    console.log('The list is already being randomized.')
  } else {
    await page.$eval('button.repeatControl.sc-ir.m-none', elem => elem.click());
    await page.waitFor(5000);
    await page.waitForSelector('button.repeatControl.sc-ir.m-one');
    await page.$eval('button.repeatControl.sc-ir.m-one', elem => elem.click());
    console.log('I will repeat this playlist.');
  }

  await page.waitFor(5000);
  // ========== [ Play the playlist ] ========== //
  await page.$eval('a.sc-button-play.playButton.sc-button.m-stretch', elem => elem.click());

  await page.waitFor(5000);

  await console.log('soundcloud program started.');
}

module.exports = run