# See Your Data

This is a desktop app that helps you download your data from online platforms, then explore it with visualisations and an LLM chatbot that runs locally on your machine.

# Getting Started

There are 2 ways to run the app

## 1. Install the packaged app

### Linux (x64)

1. Download the packaged app at [https://drive.google.com/file/d/10v8PfbdPxyTAySWpZaMPtK7DvAX-dUKQ/view?usp=sharing](https://drive.google.com/file/d/10v8PfbdPxyTAySWpZaMPtK7DvAX-dUKQ/view?usp=sharing)
2. Extract the folder `seeyourdata-local-linux-x64`
3. Execute the file `seeyourdata-local` to launch the app, you can click on the file or run `./seeyourdata-local` in the command line

### Windows (x64)

1. Download the packaged app at [https://drive.google.com/file/d/1gaG8OVRIph8TgdONRD0hgN-iVPybHW2w/view?usp=sharing](https://drive.google.com/file/d/1gaG8OVRIph8TgdONRD0hgN-iVPybHW2w/view?usp=sharing)
2. Extract the folder `seeyourdata-local-win32-x64`
3. (this step is to prevent a Windows error from preventing an unrecognised app from starting, if step 4 works, you may skip this step) Right click on `seeyourdata-local.exe`, select 'Properties', check 'Unblock' next to the security field 
4. Execute the file `seeyourdata-local.exe` to launch the app, you can click on the file or run `start seeyourdata-local.exe` in the command line

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
8. Go into the generated folder and find `resources/app/build/index.html`, change `"/static/js/main.<hash>.js"` and `"/static/css/main.<hash>.css"` to `"./static/js/main.<hash>.js"` and `"./static/css/main.<hash>.css"` (ignore if already have relative paths)
9. Follow the steps of running a packaged app above

