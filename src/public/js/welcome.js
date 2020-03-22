'use strict'

const { ipcRenderer } = require('electron');
// ========== [ Execute Follow ] ========== //
ipcRenderer.send('execute-follow');
// ========== [ Update ] ========== //
const lists = () => {
  ipcRenderer.send('internet-lists');
}
// ========== [ Another Functions ] ========== //
const ad = () => {
  const x = document.querySelector('.add');
  x.innerHTML = `<div class="card"><img src="https://image.flaticon.com/icons/png/512/28/28850.png" alt="" width="100" height="100"><h2>Coming Soon</h2></div>`;
}
const showmore = () => {
  var dots = document.getElementById("dots");
  var moreText = document.getElementById("more");
  var btnText = document.getElementById("myBtn");

  if (dots.style.display === "none") {
    dots.style.display = "inline";
    btnText.innerHTML = "Read more";
    moreText.style.display = "none";
  } else {
    dots.style.display = "none";
    btnText.innerHTML = "Read less";
    moreText.style.display = "inline";
  }
}
// ========== [ Update ] ========== //
const version = document.getElementById('version');
const notification = document.getElementById('notification');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');

ipcRenderer.send('app_version');
ipcRenderer.on('app_version', (event, arg) => {
  ipcRenderer.removeAllListeners('app_version');
  version.innerText = 'Version ' + arg.version;
});
ipcRenderer.on('update_available', () => {
  ipcRenderer.removeAllListeners('update_available');
  message.innerText = 'A new update is available. Downloading now...';
  notification.classList.remove('hidden');
});
ipcRenderer.on('update_downloaded', () => {
  ipcRenderer.removeAllListeners('update_downloaded');
  message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
  restartButton.classList.remove('hidden');
  notification.classList.remove('hidden');
});
function closeNotification() {
  notification.classList.add('hidden');
}

function restartApp() {
  ipcRenderer.send('restart_app');
}
