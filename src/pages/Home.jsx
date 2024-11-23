import React, { useEffect, useState } from 'react'
import Activity from '../components/Activity';
import Location from '../components/Location';
import Interests from '../components/Interests';
import JSZip from 'jszip';
import { FaInfoCircle } from "react-icons/fa";
import { Tooltip } from 'react-tooltip'
import Dialogue from '../components/Dialogue';
const { parse } = require('node-html-parser');
const lda = require('lda');

const Home = () => {
  const [fileUploadStatus, setFileUploadStatus] = useState("");
  const [file, setFile] = useState();
  const [downloadFiles, setDownloadFiles] = useState([]);
  const [dbPath, setDBPath] = useState('');
  const [instructions, setInstructions] = useState('');
  const [db, setDB] = useState();

  const warningStatusPrefix = 'Warning: ';
  const loadingStatus = 'Loading';

  useEffect(() => {
    fetchDB();
    findDBPath();
  }, []);
  
  useEffect(() => {
    listFiles();
  }, [db]);

  const fetchDB = async () => {
    const db = await window.api.readDB();
    setDB(db);
  }

  const findDBPath = async () => {
    const dbPath = await window.api.getDBPath();
    setDBPath(dbPath);
  }

  const listFiles = async () => {
    if (db && db.files) setDownloadFiles(db.files);
    else setDownloadFiles([]);
  }

  const uploadFile = async () => {
    setFileUploadStatus(loadingStatus);
    
    // TODO fix for first time loads
    if (!db) db = {};

    if (file) {

      if (!file.name.match(/.zip$/)) {
        alert('Please upload a zip file');
        setFileUploadStatus(warningStatusPrefix + 'File has to be zip file');
        return
      }

      const zip  = new JSZip();
      try {
        await zip.loadAsync(file);
      } catch {
        alert(`File size: ${Math.round(file.size * 9.3132257461548E-10 * 100) / 100}GB too large, please limit it below 2GB by removing some files in your zip file, for example, you can remove the "Drive" folder in a Google download`);
        setFileUploadStatus(warningStatusPrefix + 'File too large')
        return
      } 

      // records the first folder inside the zip file caused by rezipping
      const BreakException = {}
      let innerZipFolder = undefined;
      try {
        zip.forEach((relativePath, file) => {
          innerZipFolder = file.name;
          throw BreakException;
        });
      } catch(e) {
        if (e !== BreakException) throw e;
      }

      // record processed files
      if (!db.files) db.files =[];
      db.files = db.files.concat(file.name)

      let instagramActivityFile = zip.file('security_and_login_information/login_and_profile_creation/login_activity.html') ||
        zip.file(innerZipFolder + 'security_and_login_information/login_and_profile_creation/login_activity.html');
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
      zip.folder(innerZipFolder + 'apps_and_websites_off_of_instagram/apps_and_websites/your_activity_off_meta_technologies/')
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


      let googleMapsFile = zip.file('Takeout/My Activity/Maps/My Activity.html') || 
        zip.file(innerZipFolder + 'Takeout/My Activity/Maps/My Activity.html');
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
      zip.folder(innerZipFolder + 'your_instagram_activity/comments')
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
      setDB({...db});
      setFileUploadStatus(ok ? "File processed successfully" : warningStatusPrefix + "File processing failed");
    } else {
      setFileUploadStatus(warningStatusPrefix + "No file selected")
    }
  }

  const clearData = async () => {
    setFileUploadStatus(loadingStatus);
    const ok = await window.api.writeDB({});
    setDB({});
    setFileUploadStatus(ok ? "Successfully cleared all data" : warningStatusPrefix + "Failed to clear all data");
  }

  return (
    <div>
      <h1>Home</h1>
      <div className='home-container'>

        <div>
          <h4>How it Works</h4>
          <ol>
            <h5><li>Obtain data downloads from online platforms</li></h5>
            See below for instructions and supported platforms: <br/>
            <button onClick={() => {setInstructions(instructions === 'google' ? '' : 'google')}} className={instructions === 'google' && 'highlighted'}>Google</button>&nbsp;
            <button onClick={() => {setInstructions(instructions === 'facebook' ? '' : 'facebook')}} className={instructions === 'facebook' && 'highlighted'}>Facebook</button>&nbsp;
            <button onClick={() => {setInstructions(instructions === 'instagram' ? '' : 'instagram')}} className={instructions === 'instagram' && 'highlighted'}>Instagram</button>&nbsp;
            <button onClick={() => {setInstructions(instructions === 'x' ? '' : 'x')}} className={instructions === 'x' && 'highlighted'}>X (Twitter)</button>&nbsp;
            <button onClick={() => {setInstructions(instructions === 'linkedin' ? '' : 'linkedin')}} className={instructions === 'linkedin' && 'highlighted'}>LinkedIn</button>&nbsp;
            {instructions === 'google' && 
              <ol>
                <li>Visit <a href='https://takeout.google.com/' target='_blank'>Google Takeout (https://takeout.google.com/)</a> and log in to your Google account</li>
                <li>Select data to include and choose file type, frequency and destination (Select File type: .zip; File size: 1GB)</li>
                <li>Click Create Export</li>
                <li>Wait for Google to send you your data export (this may take a few days)</li>
                <li>Your data downloads should be files in the form of <strong>takeout-xxxx-xxx.zip</strong></li>
              </ol>}
            {instructions === 'facebook' &&
              <ol>
                <li>Follow the instructions on <a href='https://www.facebook.com/help/212802592074644' target='_blank'>https://www.facebook.com/help/212802592074644</a></li>
                <li>Select How much information do you want? Available Information; Format: JSON</li>
                <li>Wait for Meta to send you your data export (this may take a few days)</li>
                <li>Your data downloads should be files in the form of <strong>facebook-xxxx-xxx.zip</strong></li>
              </ol>}
            {instructions === 'instagram' &&
              <ol>
                <li>Follow the instructions on <a href='https://help.instagram.com/181231772500920' target='_blank'>https://help.instagram.com/181231772500920</a></li>
                <li>Select How much information do you want? Available Information; Format: JSON</li>
                <li>Wait for Meta to send you your data export (this may take a few days)</li>
                <li>Your data downloads should be files in the form of <strong>instagram-xxxx-xxx.zip</strong></li>
              </ol>}
            <h5><li>Upload the data download zip files to the app</li></h5>
            See Process your data downloads section for instructions
            <h5><li>The app processes the data downloads locally and presents you with insights derived from it</li></h5>
            All data is processed locally on your machine, that means the app works even without internet
            <h5><li>Explore your data!</li></h5>
            Explore data of different categories, for example Activity, Topics, Locations and different apps
          </ol>
        </div>

        <div className='upload-container'>
          <h4>Process your data downloads</h4>
          <div>Please upload a zip file</div>
          <input type='file' formEncType='multipart/form-data' name='zipfile' onChange={ (e) => {setFile(e.target.files[0]); setFileUploadStatus('')}}></input>
          <div className='mt-2 mb-3'>
            <button onClick={ uploadFile }>Upload file</button>
            {fileUploadStatus && 
              fileUploadStatus === loadingStatus ? <span className='loading-icon'></span>: 
              fileUploadStatus.includes(warningStatusPrefix) ? 
                <span className='warning'> {fileUploadStatus.replace(warningStatusPrefix, '')}</span> :
                <span className='success'> {fileUploadStatus}</span>}
          </div>
          <div>
            <strong>Your data downloads</strong>
            <a data-tooltip-id="downloads-info-tooltip" data-tooltip-content={`Useful info from your data downloads is parsed and stored in ${dbPath} and nowhere else`}>
              &nbsp;<sup><FaInfoCircle/></sup></a>
            <Tooltip id="downloads-info-tooltip" clickable />
            {downloadFiles.length > 0 ? <div>
              {downloadFiles.map((file, index) => (
                <div key={index}>{file}</div>
              ))}
              <button onClick={ clearData }>Clear all my data</button></div>:
              <div>You do not have any data downloads</div>}
          </div>
        </div>

        <Activity db={ db } isHome={ true }/>
        <Dialogue db={ db } isHome={ true }/>
        <Location db={ db } isHome={ true }/>
        <Interests db={ db } isHome={ true }/>
        <div>Google</div>
        <div>Instagram</div>
        <div>Dialogue</div>
      </div>
    </div>
  )
}

export default Home