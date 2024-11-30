const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path')
const fs = require('fs')

let mPrompts, model, retriever;
const setUpLLM = async () => {
  // TODO improve RAG
  mPrompts = await import("@langchain/core/prompts");
  const mJson = await import("langchain/document_loaders/fs/json");
  const mText = await import("langchain/document_loaders/fs/text");
  const mTextSplitter = await import("langchain/text_splitter");
  const mMemory = await import("langchain/vectorstores/memory");
  const mHfTransformers = await import("@langchain/community/embeddings/hf_transformers");
  const mRetrieval = await import("langchain/chains/retrieval");
  const mCombineDocuments = await import("langchain/chains/combine_documents");
  const mLlamaCpp = await import("@langchain/community/llms/llama_cpp");

  const loader = new mText.TextLoader(path.join(app.getPath('userData'), '1 copy.md'));
  const docs = await loader.load();

  const splitter = new mTextSplitter.MarkdownTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0
  });
  const splitDocs = await splitter.splitDocuments(docs);

  const vectorStore = await mMemory.MemoryVectorStore.fromDocuments(
    splitDocs,
    new mHfTransformers.HuggingFaceTransformersEmbeddings()
  )
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
      fs.writeFileSync(path.join(app.getPath('userData'), 'db.json'), JSON.stringify(json));
      return true;
    } catch (err) {
      console.error(err);
    }
  })

  ipcMain.handle('get-db-path', async (event, arg) => {
    return path.join(app.getPath('userData'), 'db.json');
  })

  ipcMain.handle('load-rag', async (event, arg) => {
    return true;
  })

  ipcMain.handle('ask', async (event, query) => {
    try {
      // const prompt = mPrompts.ChatPromptTemplate.fromTemplate(`You are an AI chatbot, please give an answer to the following question even if you are unsure: {input}`);
      // const chain = prompt.pipe(model);
      // const result = await chain.invoke({ input: query });
      // return result;

      const mRetrieval = await import("langchain/chains/retrieval");
      const mCombineDocuments = await import("langchain/chains/combine_documents");
      const prompt = mPrompts.ChatPromptTemplate.fromTemplate(`You are an AI chatbot that have read through a user's activity data in the context tags below, please answer their question based on their activity data in the context tags
        <context>{context}</context>
        question: {input}
      `);
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
