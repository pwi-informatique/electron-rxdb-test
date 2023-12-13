# RxDB Electron test

This is an example usage of RxDB with the [Electron RxStorage](https://rxdb.info/electron.html). It implements a simple heroes-list which can be filled by the user.

# Installation

1. clone the repo
2. go into project `cd electron-rxdb-test`
3. run `npm install`

# Reproduce the bug

1. run `npm start`
2. close one of the two electron windows
3. try to add a hero in the remaining window

The following bug should appear in the console / in an error popup :

`(node:35380) UnhandledPromiseRejectionWarning: TypeError: Object has been destroyed
    at WebContents.send (node:electron/js2c/browser_init:2:79151)
    at XXXXXXXXXXXXXXXXXXXX\electron-rxdb-test\node_modules\rxdb\dist\lib\plugins\electron\rx-storage-ipc-main.js:32:14
    at Set.forEach (<anonymous>)
    at Object.send (XXXXXXXXXXXXXXXXXXXX\electron-rxdb-test\node_modules\rxdb\dist\lib\plugins\electron\rx-storage-ipc-main.js:31:19)
    at Object.next (XXXXXXXXXXXXXXXXXXXX\electron-rxdb-test\node_modules\rxdb\dist\lib\plugins\storage-remote\remote.js:185:18)
(Use 'electron --trace-warnings ...' to show where the warning was created)
(node:35380) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag '--unhandled-rejections=strict' (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 1)`


# Run the custom XXX

1. run `npm start:custom`
2. close one of the two electron windows
3. try to add a hero in the remaining window

The bug no longer appears

## Related

-   [Comparison of Electron Databases](https://rxdb.info/electron-database.html)
-   [RxStorage Electron IpcRenderer & IpcMain](https://rxdb.info/electron.html)