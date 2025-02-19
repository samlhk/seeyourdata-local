# See Your Data

This is a desktop app that helps you download your data from online platforms, then explore it with visualisations and an LLM chatbot that runs locally on your machine.

# Getting Started

There are 2 ways to run the app

## 1. Install the packaged app

### Linux (x64)

1. Download the packaged app at [https://drive.google.com/file/d/1u64R1oHIU8W7Xiz_qTXvjBffkLAB0oA4/view?usp=sharing](https://drive.google.com/file/d/1u64R1oHIU8W7Xiz_qTXvjBffkLAB0oA4/view?usp=sharing)
2. Extract the folder `seeyourdata-local-linux-x64`
3. Execute the file `seeyourdata-local` to launch the app, you can click on the file or run `./seeyourdata-local` in the command line

### Windows (x64)

1. Download the packaged app at [https://drive.google.com/file/d/18M6ANPLHUYWjasfLvLZ2NT2mZIwnSlo9/view?usp=sharing](https://drive.google.com/file/d/18M6ANPLHUYWjasfLvLZ2NT2mZIwnSlo9/view?usp=sharing)
2. Extract the folder `seeyourdata-local-win32-x64`
3. (this step is to prevent a Windows error from preventing an unrecognised app from starting, if step 4 works, you may skip this step) Right click on `seeyourdata-local.exe`, select 'Properties', check 'Unblock' next to the security field 
4. Execute the file `seeyourdata-local.exe` to launch the app, you can click on the file or run `start seeyourdata-local.exe` in the command line

### MacOS

1. Download the packaged app at 
- x64: [https://mega.nz/file/biwklIRK#TC6N4D3VNZcYGU-8-xBUf4AlP5g4qVEm7-OydqVV6TQ](https://mega.nz/file/biwklIRK#TC6N4D3VNZcYGU-8-xBUf4AlP5g4qVEm7-OydqVV6TQ)
- arm: [https://mega.nz/file/nmAWlJ6S#9c6dzjvmvMCGi0yoo6AY2WKewWI9e8HZcr8rNnwO-qU](https://mega.nz/file/nmAWlJ6S#9c6dzjvmvMCGi0yoo6AY2WKewWI9e8HZcr8rNnwO-qU)
2. Extract the folder `seeyourdata-local-darwin-<x64/arm>`
3. Run `xattr -cr /path/to/seeyourdata-local.app` in the terminal
4. Launch the app by double clicking on `seeyourdata-local.app`

## 2. Run the node app directly

### Developer mode (recommended)

1. Download the LLM model and IP database at [https://drive.google.com/drive/folders/1P3Utffjin1a68gczwEG_yqMi_Why84bp?usp=sharing](https://drive.google.com/drive/folders/1P3Utffjin1a68gczwEG_yqMi_Why84bp?usp=sharing)
2. Copy `models` folder into the `public` folder
3. Run `npm install --legacy-peer-deps`
4. Run `npm start` in one terminal, then run `npm run electron` in another terminal

### Package mode

1. Download the LLM model and IP database at [https://drive.google.com/drive/folders/1P3Utffjin1a68gczwEG_yqMi_Why84bp?usp=sharing](https://drive.google.com/drive/folders/1P3Utffjin1a68gczwEG_yqMi_Why84bp?usp=sharing)
2. Copy `models` folder into the `public` folder
3. Run `npm install --legacy-peer-deps`
5. (Windows only) Run `npm install --platform=win32 --arch=x64 sharp --legacy-peer-deps`
4. Run `npm run build`
6. (Windows only) Change the package command in `package.json` to `electron-packager . --platform=win32 --arch=x64 --overwrite` and run `npm run package`
7. (Linux only) Run `npm run package`
8. Follow the steps of running a packaged app above

