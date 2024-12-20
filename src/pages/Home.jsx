import React, { useEffect, useState } from 'react'
import Activity from '../components/activity/Activity';
import Location from '../components/location/Location';
import Interests from '../components/interests/Interests';
import JSZip from 'jszip';
import { FaInfoCircle } from "react-icons/fa";
import { Tooltip } from 'react-tooltip'
import Dialogue from '../components/Dialogue';
import Instagram from '../components/instagram/Instagram';
import Pi from '../components/pi/Pi';
const { parse } = require('node-html-parser');
const lda = require('lda');

const Home = () => {
  const [fileUploadStatus, setFileUploadStatus] = useState("");
  const [file, setFile] = useState();
  const [downloadFiles, setDownloadFiles] = useState([]);
  const [dbPath, setDBPath] = useState('');
  const [instructions, setInstructions] = useState('');
  const [db, setDB] = useState({});

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
    setDB(db || {});
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
      if (!db.files) db.files = [];
      db.files = db.files.concat(`${file.name} (${new Date().toLocaleString()})`)

      
      const addActivity = (app, timestamps) => {
        if (!db.activity) db.activity = [];
        if (!db.activity.find(activity => activity.app === app)) db.activity = db.activity.concat([{app, timestamps: []}]);
        const set = new Set(db.activity.find(activity => activity.app === app).timestamps).union(new Set(timestamps));
        db.activity.find(activity => activity.app === app).timestamps = Array.from(set);
      }

      const addLocations = (locations) => {
        if (!db.location) db.location = [];
        const set = new Set(db.location).union(new Set(locations));
        db.location = Array.from(set);
      }

      const addPostedTexts = (source, texts) => {
        if (!db.postedContent) db.postedContent = [];
        if (!db.postedContent.find(content => content.source === source)) db.postedContent = db.postedContent.concat([{source, texts: []}]);
        const set = new Set(db.postedContent.find(content => content.source === source).texts).union(new Set(texts));
        db.postedContent.find(content => content.source === source).texts = Array.from(set);
      }

      const addAdvertisers = (source, advertisers) => {
        if (!db.advertisers) db.advertisers = [];
        if (!db.advertisers.find(advertisers => advertisers.source === source)) db.advertisers = db.advertisers.concat([{source, advertisers: []}]);
        const set = new Set(db.advertisers.find(advertisers => advertisers.source === source).advertisers).union(new Set(advertisers));
        db.advertisers.find(advertisers => advertisers.source === source).advertisers = Array.from(set);
      }

      const addRecommendedTopics = (source, topics) => {
        if (!db.recommendedTopics) db.recommendedTopics = [];
        if (!db.recommendedTopics.find(topics => topics.source === source)) db.recommendedTopics = db.recommendedTopics.concat([{source, topics: []}]);
        const set = new Set(db.recommendedTopics.find(topics => topics.source === source).topics).union(new Set(topics));
        db.recommendedTopics.find(topics => topics.source === source).topics = Array.from(set);
      }

      const addPhone = (source, phone) => {
        if (!db.piPhone) db.piPhone = [];
        if (!db.piPhone.find(phone => phone.source === source)) db.piPhone = db.piPhone.concat([{source, phone: []}]);
        const set = new Set(db.piPhone.find(phone => phone.source === source).phone).union(new Set(phone));
        db.piPhone.find(phone => phone.source === source).phone = Array.from(set);
      }

      const addLocation = (source, location) => {
        if (!db.piLocation) db.piLocation = [];
        if (!db.piLocation.find(location => location.source === source)) db.piLocation = db.piLocation.concat([{source, location: []}]);
        const set = new Set(db.piLocation.find(location => location.source === source).location).union(new Set(location));
        db.piLocation.find(location => location.source === source).location = Array.from(set);
      }

      const addIp = (source, ip) => {
        if (!db.piIp) db.piIp = [];
        if (!db.piIp.find(ip => ip.source === source)) db.piIp = db.piIp.concat([{source, ip: []}]);
        const set = new Set(db.piIp.find(ip => ip.source === source).ip).union(new Set(ip));
        db.piIp.find(ip => ip.source === source).ip = Array.from(set);
      }

      const addDevice = (source, device) => {
        if (!db.piDevice) db.piDevice = [];
        if (!db.piDevice.find(device => device.source === source)) db.piDevice = db.piDevice.concat([{source, device: []}]);
        const set = new Set(db.piDevice.find(device => device.source === source).device).union(new Set(device));
        db.piDevice.find(device => device.source === source).device = Array.from(set);
      }

      try {

        // ---------------------------------
        // ------------Instagram------------
        // ---------------------------------

        let instagramViewedAdsFile = zip.file('ads_information/ads_and_topics/ads_viewed.json') ||
          zip.file(innerZipFolder + 'ads_information/ads_and_topics/ads_viewed.json');
        if (instagramViewedAdsFile) {
          console.log('Processing instagram viewed ads');
          const data = await instagramViewedAdsFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.impressions_history_ads_seen.map(obj => new Date(obj.string_map_data.Time.timestamp * 1000).toString());
          addActivity('instagram: ad views', timestamps);
          const accounts = json.impressions_history_ads_seen.filter(obj => obj.string_map_data.Author).map(obj => obj.string_map_data.Author.value);
          if (!db.instagramViewedAccounts) db.instagramViewedAccounts = {};
          db.instagramViewedAccounts.ads = accounts;
        }

        let instagramViewedPostsFile = zip.file('ads_information/ads_and_topics/posts_viewed.json') ||
          zip.file(innerZipFolder + 'ads_information/ads_and_topics/posts_viewed.json');
        if (instagramViewedPostsFile) {
          console.log('Processing instagram viewed posts');
          const data = await instagramViewedPostsFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.impressions_history_posts_seen.map(obj => new Date(obj.string_map_data.Time.timestamp * 1000).toString());
          addActivity('instagram: post views', timestamps);
          const accounts = json.impressions_history_posts_seen.filter(obj => obj.string_map_data.Author).map(obj => obj.string_map_data.Author.value);
          if (!db.instagramViewedAccounts) db.instagramViewedAccounts = {};
          db.instagramViewedAccounts.posts = accounts;
        }

        let instagramViewedSuggestedProfilesFile = zip.file('ads_information/ads_and_topics/suggested_profiles_viewed.json') ||
          zip.file(innerZipFolder + 'ads_information/ads_and_topics/suggested_profiles_viewed.json');
        if (instagramViewedSuggestedProfilesFile) {
          console.log('Processing instagram viewed suggested profiles');
          const data = await instagramViewedSuggestedProfilesFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.impressions_history_chaining_seen.map(obj => new Date(obj.string_map_data.Time.timestamp * 1000).toString());
          addActivity('instagram: suggested profile views', timestamps);
          const accounts = json.impressions_history_chaining_seen.filter(obj => obj.string_map_data.Username).map(obj => obj.string_map_data.Username.value);
          if (!db.instagramViewedAccounts) db.instagramViewedAccounts = {};
          db.instagramViewedAccounts.suggestedProfiles = accounts;
        }

        let instagramViewedVideosFile = zip.file('ads_information/ads_and_topics/videos_watched.json') ||
          zip.file(innerZipFolder + 'ads_information/ads_and_topics/videos_watched.json');
        if (instagramViewedVideosFile) {
          console.log('Processing instagram viewed videos');
          const data = await instagramViewedVideosFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.impressions_history_videos_watched.map(obj => new Date(obj.string_map_data.Time.timestamp * 1000).toString());
          addActivity('instagram: video views', timestamps);
          const accounts = json.impressions_history_videos_watched.filter(obj => obj.string_map_data.Author).map(obj => obj.string_map_data.Author.value);
          if (!db.instagramViewedAccounts) db.instagramViewedAccounts = {};
          db.instagramViewedAccounts.videos = accounts;
        }

        let instagramAdvertisersFile = zip.file('ads_information/instagram_ads_and_businesses/advertisers_using_your_activity_or_information.json') ||
          zip.file(innerZipFolder + 'ads_information/instagram_ads_and_businesses/advertisers_using_your_activity_or_information.json');
        if (instagramAdvertisersFile) {
          console.log('Processing instagram advertisers');
          const data = await instagramAdvertisersFile.async('text');
          const json = JSON.parse(data);
          const advertisers = json.ig_custom_audiences_all_types.map(obj => obj.advertiser_name);
          addAdvertisers('instagram', advertisers);
        }

        let instagramPhoneFile = zip.file('personal_information/information_about_you/possible_phone_numbers.json') ||
          zip.file(innerZipFolder + 'personal_information/information_about_you/possible_phone_numbers.json');
        if (instagramPhoneFile) {
          console.log('Processing instagram phone number');
          const data = await instagramPhoneFile.async('text');
          const json = JSON.parse(data);
          const phones = [];
          if (json.inferred_data_inferred_phone_numbers) {
            json.inferred_data_inferred_phone_numbers.forEach(obj => {
              if (obj && obj.string_list_data) { obj.string_list_data.forEach(obj => { if (obj && obj.value) {
                phones.push(obj.value);}})}})}
          if (phones.length > 0) addPhone('instagram', phones);
        }

        let instagramLocationFile = zip.file('personal_information/information_about_you/profile_based_in.json') ||
          zip.file(innerZipFolder + 'personal_information/information_about_you/profile_based_in.json');
        if (instagramLocationFile) {
          console.log('Processing instagram location');
          const data = await instagramLocationFile.async('text');
          const json = JSON.parse(data);
          const locations = [];
          if (json.inferred_data_primary_location) { json.inferred_data_primary_location.forEach((obj) => {
              if (obj && obj.string_map_data?.['Town/city name']) { 
                locations.push(obj.string_map_data['Town/city name'].value);}})}
          if (locations.length > 0) addLocation('instagram', locations);
        }

        let instagramRecommendedTopicsFile = zip.file('preferences/your_topics/recommended_topics.json') ||
          zip.file(innerZipFolder + 'preferences/your_topics/recommended_topics.json');
        if (instagramRecommendedTopicsFile) {
          console.log('Processing instagram recommended topics');
          const data = await instagramRecommendedTopicsFile.async('text');
          const json = JSON.parse(data);
          const topics = json.topics_your_topics.map(obj => obj.string_map_data.Name.value);
          addRecommendedTopics('instagram', topics);
        }

        let instagramOffMetaActivityFile = zip.file('apps_and_websites_off_of_instagram/apps_and_websites/your_activity_off_meta_technologies.json') ||
          zip.file(innerZipFolder + 'apps_and_websites_off_of_instagram/apps_and_websites/your_activity_off_meta_technologies.json');
        if (instagramOffMetaActivityFile) {
          console.log(`Processing instagram off meta activity`);
          const data = await instagramOffMetaActivityFile.async('text');
          const json = JSON.parse(data);
          json.apps_and_websites_off_meta_activity.forEach(({ name, events }) => {
            const timestamps = events.map(({ timestamp}) => new Date(timestamp * 1000).toString());
            addActivity(name, timestamps);
          })
        };

        let instagramActivityFile = zip.file('security_and_login_information/login_and_profile_creation/login_activity.json') ||
          zip.file(innerZipFolder + 'security_and_login_information/login_and_profile_creation/login_activity.json');
        if (instagramActivityFile) {
          console.log('Processing instagram log in activity');
          const data = await instagramActivityFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.account_history_login_history.map(({ title }) => title);
          addActivity('instagram: log in', timestamps);
          const ips = json.account_history_login_history.map(obj => obj.string_map_data['IP address'].value);
          const latlongs = await window.api.ipsToLatlong(ips);
          const locations = latlongs.map((latlong, index) => ({
              latlong,
              label: ips[index],
              source: 'Instagram log in'
            }))
          addLocations(locations);
          addIp('instagram', ips);
          const devices = json.account_history_login_history.map(obj => obj.string_map_data['User agent'].value);
          addDevice('instagram', devices);
        }

        let instagramPostCommentsFile = zip.file('your_instagram_activity/comments/post_comments_1.json') ||
          zip.file(innerZipFolder + 'your_instagram_activity/comments/post_comments_1.json');
        if (instagramPostCommentsFile) {
          console.log(`Processing instagram post comments`);
          const data = await instagramPostCommentsFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.map(obj => new Date(obj.string_map_data.Time.timestamp * 1000).toString());
          addActivity('instagram: post comments', timestamps);
          const comments = json.map(obj => obj.string_map_data?.Comment?.value);
          addPostedTexts('instagram post comments', comments);
          const accounts = json.filter(obj => obj.string_map_data['Media Owner']).map(obj => obj.string_map_data['Media Owner'].value);
          if (!db.instagramCommentedAccounts) db.instagramCommentedAccounts = {};
          db.instagramCommentedAccounts.posts = accounts;
        }

        let instagramReelsCommentsFile = zip.file('your_instagram_activity/comments/reels_comments.json') ||
          zip.file(innerZipFolder + 'your_instagram_activity/comments/reels_comments.json');
        if (instagramReelsCommentsFile) {
          console.log(`Processing instagram reels comments`);
          const data = await instagramReelsCommentsFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.comments_reels_comments.map(obj => new Date(obj.string_map_data.Time.timestamp * 1000).toString());
          addActivity('instagram: reel comments', timestamps);
          const comments = json.comments_reels_comments.map(obj => obj.string_map_data?.Comment?.value);
          addPostedTexts('instagram reel comments', comments);
          const accounts = json.comments_reels_comments.filter(obj => obj.string_map_data['Media Owner']).map(obj => obj.string_map_data['Media Owner'].value);
          if (!db.instagramCommentedAccounts) db.instagramCommentedAccounts = {};
          db.instagramCommentedAccounts.reels = accounts;
        }


        // ---------------------------------
        // ------------Google---------------
        // ---------------------------------
        
        let googleMapsFile = zip.file('Takeout/My Activity/Maps/My Activity.html') || 
          zip.file(innerZipFolder + 'Takeout/My Activity/Maps/My Activity.html');
        if (googleMapsFile) {
          // TODO add access timestamps to activity and google
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
          addLocations(locations);
        }

        // loop example
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
        
        // ---------------------------------
        // ------------Misc-----------------
        // ---------------------------------

        // update topic model
        if (db.postedContent) {
          console.log(`Updating posted topics`);
          const document = db.postedContent.reduce((allText, obj) => allText.concat(obj.texts), []);
          const numberOfTopics = 10;
          const topics = new lda(document, numberOfTopics, 5).map((topic, id) => {
            const arr = topic.map(({ term }) => ({ topic: term, weight: numberOfTopics - id}));
            return arr;
          }).flat();
          db.postedTopics = topics;
        }

      } catch(e) {
        console.error('Unexpected error processing file: ' + e.message);
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
            <button onClick={() => {setInstructions(instructions === 'google' ? '' : 'google')}} className={instructions === 'google' ? 'highlighted' : ''}>Google</button>&nbsp;
            <button onClick={() => {setInstructions(instructions === 'facebook' ? '' : 'facebook')}} className={instructions === 'facebook' ? 'highlighted' : ''}>Facebook</button>&nbsp;
            <button onClick={() => {setInstructions(instructions === 'instagram' ? '' : 'instagram')}} className={instructions === 'instagram' ? 'highlighted' : ''}>Instagram</button>&nbsp;
            <button onClick={() => {setInstructions(instructions === 'x' ? '' : 'x')}} className={instructions === 'x' ? 'highlighted' : ''}>X (Twitter)</button>&nbsp;
            <button onClick={() => {setInstructions(instructions === 'linkedin' ? '' : 'linkedin')}} className={instructions === 'linkedin' ? 'highlighted' : ''}>LinkedIn</button>&nbsp;
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
            <a data-tooltip-id="downloads-info-tooltip" data-tooltip-content={`Useful info from your data downloads is parsed and stored in ${dbPath},db.md and nowhere else`}>
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
        <Pi db={ db } isHome={ true }/>
        <Instagram db={ db } isHome={ true }/>
        <div>Google</div>
      </div>
    </div>
  )
}

export default Home