import { app } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
const { BrowserWindow, Menu, globalShortcut } = require('electron');

const fs = require('fs');
var stopfocus_loop=false;

function wait_for_alert(m_w) {
  var filedata=fs.readFileSync('/Users/aaravdayal/work/delaymasterpro/alert').toString()
  if (filedata=="") {
    stopfocus_loop=true
    app.on("browser-window-focus", () => {
      globalShortcut.registerAll(
        ["CommandOrControl+Q","CommandOrControl+W"],
        () => {
          app.exit()
          return;
        }
      );
    });
  } else {
    stopfocus_loop=false
    dont_allow_exit()
    focus(m_w,1000)
    stopfocus_loop=false
  }
  setTimeout(()=>{
    wait_for_alert(m_w)
  },1000)
}

function dont_allow_exit() {
    console.log("yessurr")
    app.on("browser-window-focus", () => {
      globalShortcut.registerAll(
        ["CommandOrControl+Q","CommandOrControl+W"],
        () => {
          console.log("yes")
          return;
        }
      );
    });
    app.on("browser-window-blur", () => {
      globalShortcut.unregisterAll();
    });
}


app.setPath('userData', `${app.getPath('userData')} (development)`);

function focus(m_w,interval) {
  if (stopfocus_loop) {
    return
  }
  setTimeout(()=>{
    focus(m_w,interval)
  },interval)
  m_w.show()
  console.log("?")
}

(async () => {
  await app.whenReady();
  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
  });
  app.on("browser-window-focus", () => {
    globalShortcut.registerAll(
      ["Control+Command+I"],
      () => {
        mainWindow.webContents.openDevTools()
        return;
      }
    );
  });
  mainWindow.maximize()
  mainWindow.setMenu(null)
  // focus(mainWindow,1000);dont_allow_exit()
  wait_for_alert(mainWindow)
  const port = 8888;
  await mainWindow.loadURL(`http://localhost:${port}/home`);
})();

app.on('window-all-closed', () => {
  app.quit();
});
