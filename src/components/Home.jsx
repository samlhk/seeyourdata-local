import React, { useEffect, useState } from 'react'
import Activity from './Activity';
import Location from './Location';
import Interests from './Interests';
import JSZip from 'jszip';
const { parse } = require('node-html-parser');
const lda = require('lda');

const Home = () => {
  const [fileUploadStatus, setFileUploadStatus] = useState("");
  const [file, setFile] = useState();
  const [downloadFiles, setDownloadFiles] = useState([]);

  useEffect(() => {
    listFiles();
  }, []);

  const listFiles = async () => {
    // const res = await fetchApi("/list-files");
    // if (res.ok) {
    //   const files = await res.json();
    //   setDownloadFiles(files.uploads);
    // } 
  }

  const uploadFile = async () => {
    const db = await window.api.readDB();
    if (!db) db = {};

    if (file) {
      const zip  = new JSZip();
      await zip.loadAsync(file);

      let instagramActivityFile = zip.file('security_and_login_information/login_and_profile_creation/login_activity.html');
      if (instagramActivityFile) {
        console.log('Processing instagram activity');
        const data = await instagramActivityFile.async('text');
        const root = parse(data);
        const dateElements = root.querySelectorAll('._3-95._2pim._a6-h._a6-i');
        const timestamps = dateElements.map(element => element.innerText).map(timestamp => new Date(timestamp).toString());

        if (!db.activity) db.activity = [];
        if (db.activity.filter(activity => activity.app === 'instagram').length === 0) db.activity = db.activity.concat([{app: 'instagram', timestamps: []}]);
        const set = new Set(db.activity.filter(activity => activity.app === 'instagram')[0].timestamps).union(new Set(timestamps));
        db.activity.filter(activity => activity.app === 'instagram')[0].timestamps = Array.from(set);
      }

      
      let offMetaActivityFiles = [];
      zip.folder('apps_and_websites_off_of_instagram/apps_and_websites/your_activity_off_meta_technologies/')
        .forEach((relativePath, file) => {offMetaActivityFiles.push(file.name);})
      for await (const file of offMetaActivityFiles) {
        const data = await zip.file(file).async('text');
        const root = parse(data);
        const appName = root.querySelector('._38my').innerText.replace('Activity received from ', '');
        console.log(`Processing ${appName} activity`);
        const dateElements = root.querySelectorAll('._2pin._2piu._a6_r');
        const timestamps = dateElements.filter((_, id) => id % 3 === 2).map(element => element.innerText).map(timestamp => new Date(timestamp).toString());
        
        if (!db.activity) db.activity = [];
        if (db.activity.filter(activity => activity.app === appName).length === 0) db.activity = db.activity.concat([{app: appName, timestamps: []}]);
        const set = new Set(db.activity.filter(activity => activity.app === appName)[0].timestamps).union(new Set(timestamps));
        db.activity.filter(activity => activity.app === appName)[0].timestamps = Array.from(set);
      };


      let googleMapsFile = zip.file('Takeout/My Activity/Maps/My Activity.html');
      if (googleMapsFile) {
        console.log('Processing google maps');
        const data = await googleMapsFile.async('text');
        const root = parse(data);
        const linkElements = root.getElementsByTagName('a');
        const locations = [];
        linkElements.forEach(element => {
          const latlong = element.getAttribute('href').match(/@-?\d+.\d+,-?\d+.\d+/);
          if (latlong) {
            locations.push({
              latlong: latlong[0].replace('@', ''),
              label: element.innerText,
              source: 'Google Maps'
            })
          }
        })

        if (!db.location) db.location = [];
        const set = new Set(db.location).union(new Set(locations));
        db.location = Array.from(set);
      }


      const instagramCommentsFiles = [];
      zip.folder('your_instagram_activity/comments')
        .forEach((relativePath, file) => {instagramCommentsFiles.push(file.name);});
      for await (const file of instagramCommentsFiles) {
        console.log(`Processing instagram comments in file: ${file}`);
        const data = await zip.file(file).async('text');
        const root = parse(data);
        const commentElements = root.querySelectorAll('._2pin._a6_q').filter(element => element.innerText.includes('Comment'));
        const comments = commentElements.map(element => element.innerText.replace('Comment', ''));

        if (!db.documents) db.documents = [];
        if (db.documents.filter(document => document.source === `instagram.${file}`).length === 0) db.documents = db.documents.concat([{source: `instagram.${file}`, texts: []}]);
        const set = new Set(db.documents.filter(document => document.source === `instagram.${file}`)[0].texts).union(new Set(comments));
        db.documents.filter(document => document.source === `instagram.${file}`)[0].texts = Array.from(set);
      }
      
      if (instagramCommentsFiles.length > 0) {
        console.log(`Updating topic model`);
        const document = db.documents.reduce((allText, obj) => allText.concat(obj.texts), []);
        const numberOfTopics = 10;
        const topics = new lda(document, numberOfTopics, 5).map((topic, id) => {
          const arr = topic.map(({ term }) => ({ topic: term, weight: numberOfTopics - id}));
          return arr;
        }).flat();
        db.topics = topics;
      }
    


      const ok = await window.api.writeDB(db);
      setFileUploadStatus(ok ? "File processed successfully" : "File processing failed");
      // listFiles();
    }
  }

  return (
    <div>
      <nav>
        <h1>Home</h1>
      </nav>
      <div className='home-container'>
        <div className='upload-container'>
          <h4>Upload your data downloads</h4>
          <input type='file' formEncType='multipart/form-data' name='zipfile' onChange={ (e) => {setFile(e.target.files[0])}}></input>
          <div className='mt-2 mb-3'>
            <button onClick={ uploadFile }>Upload file</button>
            {fileUploadStatus && <span> {fileUploadStatus}</span>}
          </div>
          <div>
            Your data downloads:
            {downloadFiles.length > 0 ? <div>
              {downloadFiles.map((file, index) => (
                <div key={index}>{file}</div>
              ))}
              <button>Clear all my data</button></div>:
              <div>You do not have any data downloads</div>}
          </div>
        </div>
        <Activity/>
        <Location/>
        <Interests/>
        <div>Display2</div>
        <div>Display3</div>
        <div>Display4</div>
      </div>
    </div>
  )
}

export default Home