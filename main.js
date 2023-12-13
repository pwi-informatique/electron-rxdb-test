const electron = require('electron');
const path = require('path');
const { Subject } = require('rxjs');

const { getRxStorageMemory } = require('rxdb/plugins/storage-memory');
const { exposeIpcMainRxStorage } = require('rxdb/plugins/electron');
const { exposeRxStorageRemote } = require('rxdb/plugins/storage-remote');

const { getDatabase } = require('./shared');

/**
 * @link https://github.com/electron/electron/issues/19775#issuecomment-834649057
 */
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

const args = process.argv.slice(1),
      custom = args.some(val => val === '--custom');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const windows = [];

const IPC_RENDERER_KEY_PREFIX = 'rxdb-ipc-renderer-storage'
function customExposeIpcMainRxStorage(args) {
    var channelId = [IPC_RENDERER_KEY_PREFIX, args.key].join('|');
    var messages$ = new Subject();
    var openRenderers = new Set();
    args.ipcMain.on(channelId, (event, message) => {
        addOpenRenderer(event.sender);
        if (message) {
            messages$.next(message);
        }
    });
    var addOpenRenderer = renderer => {
        if (openRenderers.has(renderer)) return;
        openRenderers.add(renderer);
        renderer.on('destroyed', () => openRenderers.delete(renderer));
    };
    var send = msg => {
        /**
         * TODO we could improve performance
         * by only sending the message to the 'correct' sender
         * and removing senders whose browser window is closed.
         */
        openRenderers.forEach(sender => {
            sender.send(channelId, msg);
        });
    };
    (0, exposeRxStorageRemote)({
        storage: args.storage,
        messages$,
        send
    });
}

function createWindow() {
    const width = 600;
    const height = 600;
    const w = new BrowserWindow({
        width,
        height,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    w.loadFile('index.html');

    const x = windows.length * width;
    const y = 0;
    w.setPosition(x, y);
    windows.push(w);

    // use this to debug by automatically opening the devtools.
    // w.webContents.openDevTools();
}


app.on('ready', async function () {
    const dbSuffix = new Date().getTime(); // we add a random timestamp in dev-mode to reset the database on each start

    electron.ipcMain.handle('getDBSuffix', () => dbSuffix);


    const storage = getRxStorageMemory();

    if (custom) {
        customExposeIpcMainRxStorage({
            key: 'main-storage',
            storage,
            ipcMain: electron.ipcMain
        });
    } else {
        exposeIpcMainRxStorage({
            key: 'main-storage',
            storage,
            ipcMain: electron.ipcMain
        });
    }

    // const db = await getDatabase(
    //     'heroesdb' + dbSuffix,
    //     storage
    // );

    // // show heroes table in console
    // db.heroes.find().sort('name').$.subscribe(heroDocs => {
    //     console.log('### got heroes(' + heroDocs.length + '):');
    //     heroDocs.forEach(doc => console.log(
    //         doc.name + '  |  ' + doc.color
    //     ));
    // });

    createWindow();
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit();
});