const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { jsonToMd } = require('./prompt');

let mPrompts, model, retriever;
const setUpLLM = async () => {
  mPrompts = await import("@langchain/core/prompts");
  const mText = await import("langchain/document_loaders/fs/text");
  const mTextSplitter = await import("langchain/text_splitter");
  const mMemory = await import("langchain/vectorstores/memory");
  const mHfTransformers = await import("@langchain/community/embeddings/hf_transformers");
  const mLlamaCpp = await import("@langchain/community/llms/llama_cpp");

  const markdownFilePath = path.join(app.getPath('userData'), 'db.md');
  if (!fs.existsSync(markdownFilePath)) fs.writeFileSync(markdownFilePath, '');
  const loader = new mText.TextLoader(markdownFilePath);
  const docs = await loader.load();
  const splitter = new mTextSplitter.MarkdownTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50
  });
  const splitDocs = await splitter.splitDocuments(docs);

  const embeddings = new mHfTransformers.HuggingFaceTransformersEmbeddings();
  const vectorStore = await mMemory.MemoryVectorStore.fromDocuments([], embeddings);
  for (const doc of splitDocs) {
    await vectorStore.addDocuments([doc]);
  }
  retriever = vectorStore.asRetriever();

  const modelPath = path.join(__dirname, "models", "llama-3.2-1b-instruct-q8_0.gguf")
  
  model = new mLlamaCpp.LlamaCpp({ modelPath: modelPath});
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
      const md = jsonToMd(json);
      fs.writeFileSync(path.join(app.getPath('userData'), 'db.json'), JSON.stringify(json));
      fs.writeFileSync(path.join(app.getPath('userData'), 'db.md'), md);
      await setUpLLM();
      return true;
    } catch (err) {
      console.error(err);
    }
  })

  ipcMain.handle('read-chats', async (event, arg) => {
    try {
      const data = fs.readFileSync(path.join(app.getPath('userData'), 'chats.json'), 'utf8');
      return data ? JSON.parse(data) : {chats: [], summaries: {}};
    } catch (err) {
      console.error(err);
      return {chats: [], summaries: {}}
    }
  })

  ipcMain.handle('write-chats', async (event, json) => {
    try {
      fs.writeFileSync(path.join(app.getPath('userData'), 'chats.json'), JSON.stringify(json));
      return true;
    } catch (err) {
      console.error(err);
    }
  })

  ipcMain.handle('get-db-path', async (event, arg) => {
    return path.join(app.getPath('userData'), 'db.json');
  })

  ipcMain.handle('ips-to-latlong', async (event, ips) => {
    try {
      const maxmind = await import('maxmind');
      const lookup = await maxmind.open(path.join(__dirname, "models", "GeoLite2-City.mmdb"));
      return ips.map(ip => {
        const location = lookup.get(ip);
        return `${location.location.latitude},${location.location.longitude}`
      });
    } catch (err) {
      console.error(err);
    }
  })

  ipcMain.handle('ask', async (event, query) => {
    try {
      console.log('Answering question');
      const promptText = 
      `You are an AI chatbot in an application that discovers for users what online platforms know about them, you have read through a user's data downloads from online platforms in the context tags below, please answer their question based on their data summary in the context tags, please try your best to give a specific answer and useful insights for the user
        <context>{context}</context>
        question: {input}
      `;
      const mRetrieval = await import("langchain/chains/retrieval");
      const mCombineDocuments = await import("langchain/chains/combine_documents");
      const prompt = mPrompts.ChatPromptTemplate.fromTemplate(promptText);
      const documentChain = await mCombineDocuments.createStuffDocumentsChain({
        llm: model,
        prompt
      });
      const retrievalChain = await mRetrieval.createRetrievalChain({
        combineDocsChain: documentChain,
        retriever
      })
      const result = await retrievalChain.invoke({ input: query });
      console.log(result);
      return result.answer;

    } catch (err) {
      console.error(err);
    }
  })

  ipcMain.handle('summarise', async (event, category) => {
    try {
      console.log(`Summarising ${category}`);
      const promptText = 
      `Please produce a summary of a user's data based on their data summary in the context tags, on the category provided in the question, please try your best to give a comprehensive and specific summary and useful insights for the user
        <context>{context}</context>
        question: {input}
      `;
      const mRetrieval = await import("langchain/chains/retrieval");
      const mCombineDocuments = await import("langchain/chains/combine_documents");
      const prompt = mPrompts.ChatPromptTemplate.fromTemplate(promptText);
      const documentChain = await mCombineDocuments.createStuffDocumentsChain({
        llm: model,
        prompt
      });
      const retrievalChain = await mRetrieval.createRetrievalChain({
        combineDocsChain: documentChain,
        retriever
      })
      const result = await retrievalChain.invoke({ input: category });
      console.log(result);
      return result.answer;

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
