const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path')
const fs = require('fs')

let prompts, model;
const setUpLLM = async () => {
  prompts = await import("@langchain/core/prompts");
  const modelPath = path.join(__dirname, "models", "llama-3.2-1b-instruct-q8_0.gguf")
  const llama_cpp = await import("@langchain/community/llms/llama_cpp");
  model = new llama_cpp.LlamaCpp({ modelPath: modelPath});
}

const isDev = process.env.NODE_ENV === 'dev';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  win.loadURL(isDev ? 'http://localhost:3000' : `file://${__dirname}/../build/index.html`);
}

app.on("ready", async () => {
  await setUpLLM();

  ipcMain.handle('read-db', async (event, arg) => {
    try {
      const data = fs.readFileSync(path.join(app.getPath('userData'), 'db.json'), 'utf8');
      return data ? JSON.parse(data) : {};
    } catch (err) {
      console.error(err);
    }
  })

  ipcMain.handle('write-db', async (event, json) => {
    try {
      fs.writeFileSync(path.join(app.getPath('userData'), 'db.json'), JSON.stringify(json));
      return true;
    } catch (err) {
      console.error(err);
    }
  })

  ipcMain.handle('get-db-path', async (event, arg) => {
    return path.join(app.getPath('userData'), 'db.json');
  })

  ipcMain.handle('ask', async (event, query) => {
    try {
      const prompt =
      prompts.ChatPromptTemplate.fromTemplate(`You are an AI chatbot, please give an answer to the following question even if you are unsure: {input}`);

      const chain = prompt.pipe(model);

      let result = await chain.invoke({ input: query });
      return result;
    } catch (err) {
      console.error(err);
    }
  })

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
