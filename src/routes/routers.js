'use strict'
// ========== [ Dependencies ] ========== //
const fs = require('fs-extra');
const uuid = require('uuid/v4');
const express = require('express');
const fetch = require('node-fetch');
const puppeteer = require("puppeteer-core");
const router = express.Router();
// ========== [ Utils ] ========== //
const { getExecutablePath } = require('../utils/utils');
// ========== [ load of existing list data ] ========== //
let list;
const listdata = './list';
if (fs.existsSync(listdata)) {
  const json_list_data = fs.readFileSync('./list/listdata.json', 'utf-8');
  list = JSON.parse(json_list_data);
} else {
  fs.mkdirSync(listdata);
  const listname = [];
  const json_list_data = JSON.stringify(listname);
  fs.writeFileSync('./list/listdata.json', json_list_data, 'utf-8');
  const open_list_data = fs.readFileSync('./list/listdata.json', 'utf-8');
  list = JSON.parse(open_list_data);
}
// ========== [ Routers ] ========== //
router.get('/lists', (req, res) => {
    res.render('../views/lists.ejs', {
        list
    });
});

router.get('/list', async (req, res) => {
  const obj = {
    name: req.query.name,
    url: req.query.url
  }
  const media = await (await fetch(obj.url)).json();
  res.render('../views/list.ejs', { media });

});

router.get('/addlist', (req, res) => {
  res.render('../views/addlist.ejs');
});

router.post('/addlist', (req, res) => {
  const { image, name, url } = req.body;
  if (!image || !name || !url) {
    res.status(400).send("Entries must have a title and body");
    return;
  }
  let listdata = {
    id: uuid(),
    image,
    name,
    url
  };
  list.push(listdata);
  const json_list_data = JSON.stringify(list)
  fs.writeFileSync('./list/listdata.json', json_list_data, 'utf-8');
  res.redirect('/lists');
});

router.get('/delete/:id', (req, res) => {
  list = list.filter(list => list.id != req.params.id)
  const json_users = JSON.stringify(list)
  fs.writeFileSync('./list/listdata.json', json_users, 'utf-8');
  res.redirect('/lists');
});

router.get('/video', (req, res) => {
  let obj;
  const object = {
    name: req.query.medianame,
    cover: req.query.mediacover,
    genre: req.query.genre,
    server: req.query.server,
    id: req.query.serverid,
    description: req.query.description
  }

  if (object.server == 'fembed') {
    // ========== [ Run program ] ========== //
    (async function run(object) {
      obj = object;
      const executablePath = await getExecutablePath({});
      await lauchpuppeteer({ executablePath });
    })(object);
    // ========== [ Program ] ========== //
    const lauchpuppeteer = async launchOptions => {
      const browser = await puppeteer.launch({
        // headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--block-new-web-contents"],
        ...launchOptions
      });
      const [page] = await browser.pages();
      await page.goto(`https://www.fembed.com/f/${obj.id}`, { timeout: 0, waitUntil: "networkidle2" });
      await page.waitForSelector('#download');
      await page.$eval('#download', elem => elem.click());
      await page.waitForSelector('.button.is-medium.is-success.clickdownload');
      const link = await page.$$eval('.button.is-medium.is-success.clickdownload', am => am.filter(e => e.href).map(e => e.href));
      await browser.close();

      const calidad = {
        link1: link[0],
        link2: link[1],
        link3: link[2]
      }
      res.render('../views/video.ejs', {
        calidad
      });
    };
  }

  if (object.server == 'gounlimited') {
    // ========== [ Run program ] ========== //
    let link;
    (async function run(object) {
      obj = object;
      const executablePath = await getExecutablePath({});
      await lauchpuppeteer({ executablePath });
    })(object);
    // ========== [ Program ] ========== //
    const lauchpuppeteer = async launchOptions => {
      const browser = await puppeteer.launch({
        //headless: false,
        args: [
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--no-sandbox'],
        ...launchOptions
      });
      const [page] = await browser.pages();
      page.setRequestInterception(true);
      page.on('request', (request) => {
        if (request.resourceType() === 'media') {
          link = request.url();
        }
        request.continue();
      });
      await page.goto(`https://gounlimited.to/${obj.id}.html`, { timeout: 0, waitUntil: "networkidle2" });
      await page.$eval('button.btn.btn-primary.btn-sm', elem => elem.click());
      await page.waitForSelector('a.btn.btn-primary.btn-sm');
      await page.$eval('a.btn.btn-primary.btn-sm', elem => elem.click());
      await page.waitForSelector('span a');
      link = await page.$$eval('span a', am => am.filter(e => e.href).map(e => e.href));
      browser.on('targetcreated', async (target) => {
        if (target.type() === 'page') {
          const page = await target.page();
          const url = page.url();
          if (url.search(`https://gounlimited.to/${obj.id}.html`) == -1) {
            await page.close();
          }
        }
      });
      await browser.close();
      const calidad = {
        link1: link
      }
      res.render('../views/video.ejs', {
        calidad
      });
    }
  }

  if (object.server == 'vidcloud') {
    // ========== [ Run program ] ========== //
    let link;
    (async function run(object) {
      obj = object;
      const executablePath = await getExecutablePath({});
      await lauchpuppeteer({ executablePath });
    })(object);
    // ========== [ Program ] ========== //
    const lauchpuppeteer = async launchOptions => {
      const browser = await puppeteer.launch({
        //headless: false,
        args: [
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--no-sandbox'],
        ...launchOptions
      });
      const [page] = await browser.pages();

      await page.goto(`https://vidcloud.co/v/${obj.id}`, { timeout: 0, waitUntil: "networkidle2" });
      await page.click('.btn.btn-lg.btn-success');
      await page.waitForSelector('.dropdown-menu li a');
      const link = await page.$$eval('.dropdown-menu li a', am => am.filter(e => e.href).map(e => e.href));
      await browser.close();
      const calidad = {
        link1: link
      }
      res.render('../views/video.ejs', {
        calidad
      });
    }
  }

  if (object.server == 'onlystream') {
    // ========== [ Run program ] ========== //
    let link;
    (async function run(object) {
      obj = object;
      const executablePath = await getExecutablePath({});
      await lauchpuppeteer({ executablePath });
    })(object);
    // ========== [ Program ] ========== //
    const lauchpuppeteer = async launchOptions => {
      const browser = await puppeteer.launch({
        //  headless: false,
        args: [
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--no-sandbox'],
        ...launchOptions
      });
      const [page] = await browser.pages();
      await page.goto(`https://onlystream.tv/${obj.id}`, { timeout: 0, waitUntil: "networkidle2" });
      await page.waitForSelector('a#download-tab');
      await page.click('a#download-tab');
      browser.on('targetcreated', async (target) => {
        if (target.type() === 'page') {
          const page = await target.page();
          const url = page.url();
          if (url.search(`https://onlystream.tv/${obj.id}`) == -1) {
            await page.close();
          }
        }
      });
      await page.click('a#download-tab');
      await page.waitForSelector('a.btn.btn-primary.btn-go');
      await page.$eval('a.btn.btn-primary.btn-go', elem => elem.click());
      await page.waitForSelector('a.btn.btn-primary.btn-go');
      const link = await page.$$eval('a.btn.btn-primary.btn-go', am => am.filter(e => e.href).map(e => e.href));
      await browser.close();
      const calidad = {
        link1: link
      }
      res.render('../views/video.ejs', {
        calidad
      });
    }
  }

  if (object.server == 'byter') {
    // ========== [ Run program ] ========== //
    let link;
    (async function run(object) {
      obj = object;
      const executablePath = await getExecutablePath({});
      await lauchpuppeteer({ executablePath });
    })(object);
    // ========== [ Program ] ========== //
    const lauchpuppeteer = async launchOptions => {
      //const loadExtension = path.join(os.homedir(), './Desktop/app/extension');
      const browser = await puppeteer.launch({
        //headless: false,
        args: [
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--no-sandbox'],
        ...launchOptions
      });
      const [page] = await browser.pages();
      await page.goto(`https://byter.tv/v/${obj.id}`, { timeout: 0, waitUntil: "networkidle2" });
      await page.waitForSelector('video');
      link = await page.$$eval('video', am => am.filter(e => e.src).map(e => e.src));
      await browser.close();
      const calidad = {
        link1: link
      }
      res.render('../views/video.ejs', {
        calidad
      });
    }
  }

  if (object.server == 'jetload') {
    // ========== [ Run program ] ========== //
    let url;
    (async function run(object) {
      obj = object;
      const executablePath = await getExecutablePath({});
      await lauchpuppeteer({ executablePath });
    })(object);
    // ========== [ Program ] ========== //
    const lauchpuppeteer = async launchOptions => {
      const browser = await puppeteer.launch({
        //headless: false,
        args: [
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--no-sandbox'],
        ...launchOptions
      });
      const [page] = await browser.pages();
         
      page.on('response', response => {
        const isXhr = ['xhr'].includes(response.request().resourceType())
        if (isXhr){
          const LinksNotSplitted = response.url()
          const ArrayWithLinks = LinksNotSplitted.match(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm);
          const link = ArrayWithLinks.filter(link => link.includes('.m3u8'));
          if(typeof link[0] === 'string' && link [0].length > 0) {
            url = link[0];
          }
        }
      });
      await page.goto(`https://jetload.net/e/${obj.id}`, { timeout: 0, waitUntil: "networkidle2" });
      await page.waitFor(5000);
      await browser.close();
      const calidad = {
        link1: url
      }
      res.render('../views/m3u8.ejs', {
        calidad,
      });
    }
  }

  if (object.server == 'jetloadmp4') {
    // ========== [ Run program ] ========== //
    let link;
    (async function run(object) {
      obj = object;
      const executablePath = await getExecutablePath({});
      await lauchpuppeteer({ executablePath });
    })(object);
    // ========== [ Program ] ========== //
    const lauchpuppeteer = async launchOptions => {
      //const loadExtension = path.join(os.homedir(), './Desktop/app/extension');
      const browser = await puppeteer.launch({
        //headless: false,
        args: [
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--no-sandbox'],
        ...launchOptions
      });
      const [page] = await browser.pages();
      await page.goto(`https://jetload.net/e/${obj.id}`, { timeout: 0, waitUntil: "networkidle2" });
      await page.waitForSelector('video');
      link = await page.$$eval('video', am => am.filter(e => e.src).map(e => e.src));
      await browser.close();
      const calidad = {
        link1: link
      }
      res.render('../views/video.ejs', {
        calidad
      });
    }
  }
});




module.exports = { router };