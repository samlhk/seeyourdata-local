# See Your Data

This is a desktop app that helps you download your data from online platforms, then explore it with visualisations and an LLM chatbot that runs locally on your machine.

# Getting Started

There are 2 ways to run the app

## 1. Install the packaged app

### Linux (x64)

1. Download the packaged app at [https://drive.google.com/file/d/1EdGwVEsceknq2VtmFaM2D1ITNhvsgzaL/view?usp=sharing](https://drive.google.com/file/d/1EdGwVEsceknq2VtmFaM2D1ITNhvsgzaL/view?usp=sharing)
2. Extract the folder `seeyourdata-local-linux-x64`
3. Execute the file `seeyourdata-local` to launch the app, you can click on the file or run `./seeyourdata-local` in the command line

### Windows (x64)

1. Download the packaged app at [https://drive.google.com/file/d/1fzMgGKIJs2rSgMXi7-WZ-S9FUaC53bg_/view?usp=sharing](https://drive.google.com/file/d/1fzMgGKIJs2rSgMXi7-WZ-S9FUaC53bg_/view?usp=sharing)
2. Extract the folder `seeyourdata-local-win32-x64`
3. (this step is to prevent a Windows error from preventing an unrecognised app from starting, if step 4 works, you may skip this step) Right click on `seeyourdata-local.exe`, select 'Properties', check 'Unblock' next to the security field 
4. Click on the executable `seeyourdata-local.exe` to launch the app

## 2. Run the node app directly

### Developer mode (recommended)

1. Download the LLM model and IP database at [https://drive.google.com/drive/folders/1P3Utffjin1a68gczwEG_yqMi_Why84bp?usp=sharing](https://drive.google.com/drive/folders/1P3Utffjin1a68gczwEG_yqMi_Why84bp?usp=sharing)
2. Copy `models` folder into the `public` folder
3. Run `npm install --legacy-peer-deps`
4. Run `npm start` in one terminal, then run `npm run electron` in another terminal

### Package mode

1. Download the LLM model and IP database at x
2. Copy `models` folder into the `public` folder
3. Run `npm install --legacy-peer-deps`
4. Run `npm run build`
5. Run `electron-packager . --platform=linux --arch=x64 --overwrite` with your desired platform to produce a packaged app
5. Follow the steps of running a packaged app above
