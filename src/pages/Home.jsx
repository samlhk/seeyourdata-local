import React, { useEffect, useState } from 'react'
import Activity from '../components/activity/Activity';
import Location from '../components/location/Location';
import Interests from '../components/interests/Interests';
import JSZip from 'jszip';
import { FaInfoCircle } from "react-icons/fa";
import { Tooltip } from 'react-tooltip'
import Dialogue from '../components/ai/Dialogue';
import Instagram from '../components/instagram/Instagram';
import Pi from '../components/pi/Pi';
import Card from '../components/Card';
import Google from '../components/google/Google';
import InfoCard from '../components/InfoCard';
import NavBar from '../components/NavBar';
const { parse } = require('node-html-parser');
const lda = require('lda');
const Sentiment = require('sentiment');

const Home = () => {
  const [fileUploadStatus, setFileUploadStatus] = useState("");
  const [file, setFile] = useState();
  const [downloadFiles, setDownloadFiles] = useState([]);
  const [dbPath, setDBPath] = useState('');
  const [instructionCard, setInstructionCard] = useState('');
  const [deleteCard, setDeleteCard] = useState('');
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

      // ---------------------------------
      // ------------Utilities------------
      // ---------------------------------

      // counter a double encoding issue with json and unicode, should be applied to all textual output
      const encodeUnicode = (str) => { 
        try { return decodeURIComponent(escape(str)); } 
        catch { return str; }}
      const encodeUnicodes = (lst) => { return lst.map(str => encodeUnicode(str)); }

      // Activity
      
      const addActivity = (app, timestamps) => {
        app = encodeUnicode(app);
        timestamps = encodeUnicodes(timestamps);
        if (!db.activity) db.activity = [];
        if (!db.activity.find(activity => activity.app === app)) db.activity = db.activity.concat([{app, timestamps: []}]);
        const set = new Set(db.activity.find(activity => activity.app === app).timestamps).union(new Set(timestamps));
        db.activity.find(activity => activity.app === app).timestamps = Array.from(set);
      }

      // Location
      
      const addLocations = (locations) => {
        locations = locations.map(obj => ({...obj, label: encodeUnicode(obj.label)}))
        if (!db.location) db.location = [];
        const set = new Set(db.location).union(new Set(locations));
        db.location = Array.from(set);
      }

      // Interests
      
      const addContent = (type, source, list) => {
        source = encodeUnicode(source);
        list = encodeUnicodes(list);
        const key = type + 'Content';
        if (!db[key]) db[key] = [];
        if (!db[key].find(content => content.source === source)) db[key] = db[key].concat([{source, texts: []}]);
        const set = new Set(db[key].find(content => content.source === source).texts).union(new Set(list));
        db[key].find(content => content.source === source).texts = Array.from(set);
      }

      const addTopics = (type, source, list) => {
        source = encodeUnicode(source);
        list = encodeUnicodes(list);
        if (!db[type]) db[type] = [];
        if (!db[type].find(item => item.soruce === source)) db[type] = db[type] = db[type].concat([{source, list: []}]);
        const set = new Set(db[type].find(item => item.source === source).list).union(new Set(list));
        db[type].find(item => item.source === source).list = Array.from(set);
      }

      // PI

      const addPi = (type, source, list) => {
        const piType = 'pi' + type;
        if (!db[piType]) db[piType] = [];
        if (!db[piType].find(item => item.soruce === source)) db[piType] = db[piType] = db[piType].concat([{source, list: []}]);
        const set = new Set(db[piType].find(item => item.source === source).list).union(new Set(list));
        db[piType].find(item => item.source === source).list = Array.from(set);
      }

      // Instagram

      const addInstagram = (category, media, list) => {
        const instagramCategory = 'instagram' + category;
        if (!db[instagramCategory]) db[instagramCategory] = {};
        db[instagramCategory][media] = list;
      }

      // Google
      
      const addGoogle = (category, list) => {
        list = encodeUnicodes(list);
        if (!new Set(list).isSubsetOf(new Set(db[category] || []))) db[category] = (db[category] || []).concat(list);
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
          addActivity('instagram: view ads', timestamps);
          const accounts = json.impressions_history_ads_seen.filter(obj => obj.string_map_data.Author).map(obj => obj.string_map_data.Author.value);
          addInstagram('ViewedAccounts', 'ads', accounts);
        }

        let instagramViewedPostsFile = zip.file('ads_information/ads_and_topics/posts_viewed.json') ||
          zip.file(innerZipFolder + 'ads_information/ads_and_topics/posts_viewed.json');
        if (instagramViewedPostsFile) {
          console.log('Processing instagram viewed posts');
          const data = await instagramViewedPostsFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.impressions_history_posts_seen.map(obj => new Date(obj.string_map_data.Time.timestamp * 1000).toString());
          addActivity('instagram: view posts', timestamps);
          const accounts = json.impressions_history_posts_seen.filter(obj => obj.string_map_data.Author).map(obj => obj.string_map_data.Author.value);
          addInstagram('ViewedAccounts', 'posts', accounts);
        }

        let instagramViewedSuggestedProfilesFile = zip.file('ads_information/ads_and_topics/suggested_profiles_viewed.json') ||
          zip.file(innerZipFolder + 'ads_information/ads_and_topics/suggested_profiles_viewed.json');
        if (instagramViewedSuggestedProfilesFile) {
          console.log('Processing instagram viewed suggested profiles');
          const data = await instagramViewedSuggestedProfilesFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.impressions_history_chaining_seen.map(obj => new Date(obj.string_map_data.Time.timestamp * 1000).toString());
          addActivity('instagram: view suggested profiles', timestamps);
          const accounts = json.impressions_history_chaining_seen.filter(obj => obj.string_map_data.Username).map(obj => obj.string_map_data.Username.value);
          addInstagram('ViewedAccounts', 'suggested profiles', accounts);
        }

        let instagramViewedVideosFile = zip.file('ads_information/ads_and_topics/videos_watched.json') ||
          zip.file(innerZipFolder + 'ads_information/ads_and_topics/videos_watched.json');
        if (instagramViewedVideosFile) {
          console.log('Processing instagram viewed videos');
          const data = await instagramViewedVideosFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.impressions_history_videos_watched.map(obj => new Date(obj.string_map_data.Time.timestamp * 1000).toString());
          addActivity('instagram: view videos', timestamps);
          const accounts = json.impressions_history_videos_watched.filter(obj => obj.string_map_data.Author).map(obj => obj.string_map_data.Author.value);
          addInstagram('ViewedAccounts', 'videos', accounts);
        }

        let instagramAdvertisersFile = zip.file('ads_information/instagram_ads_and_businesses/advertisers_using_your_activity_or_information.json') ||
          zip.file(innerZipFolder + 'ads_information/instagram_ads_and_businesses/advertisers_using_your_activity_or_information.json');
        if (instagramAdvertisersFile) {
          console.log('Processing instagram advertisers');
          const data = await instagramAdvertisersFile.async('text');
          const json = JSON.parse(data);
          const advertisers = json.ig_custom_audiences_all_types.map(obj => obj.advertiser_name);
          addTopics('advertisers', 'instagram', advertisers);
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
          if (phones.length > 0) addPi('Phone', 'instagram', phones);
        }

        let instagramLocationFile = zip.file('personal_information/information_about_you/profile_based_in.json') ||
          zip.file(innerZipFolder + 'personal_information/information_about_you/profile_based_in.json');
        if (instagramLocationFile) {
          console.log('Processing instagram location');
          const data = await instagramLocationFile.async('text');
          const json = JSON.parse(data);
          const locations = [];
          if (json.inferred_data_primary_location) { json.inferred_data_primary_location.forEach((obj) => {
              if (obj && obj.string_map_data?.['City Name']) { 
                locations.push(obj.string_map_data['City Name'].value);}})}
          if (locations.length > 0) addPi('Location', 'instagram', locations);
        }

        let instagramRecommendedTopicsFile = zip.file('preferences/your_topics/recommended_topics.json') ||
          zip.file(innerZipFolder + 'preferences/your_topics/recommended_topics.json');
        if (instagramRecommendedTopicsFile) {
          console.log('Processing instagram recommended topics');
          const data = await instagramRecommendedTopicsFile.async('text');
          const json = JSON.parse(data);
          const topics = json.topics_your_topics.map(obj => obj.string_map_data.Name.value);
          addTopics('recommendedTopics', 'instagram', topics);
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
          const ips = json.account_history_login_history.map(obj => obj.string_map_data['IP Address'].value);
          const latlongs = await window.api.ipsToLatlong(ips);
          const locations = latlongs.map((latlong, index) => ({
              latlong,
              label: 'IP: ' + ips[index],
              source: 'Instagram log in'
            }))
          addLocations(locations);
          addPi('Ip', 'instagram', ips);
          const devices = json.account_history_login_history.map(obj => obj.string_map_data['User Agent'].value);
          addPi('Device', 'instagram', devices);
        }

        let instagramPostCommentsFile = zip.file('your_instagram_activity/comments/post_comments_1.json') ||
          zip.file(innerZipFolder + 'your_instagram_activity/comments/post_comments_1.json');
        if (instagramPostCommentsFile) {
          console.log(`Processing instagram post comments`);
          const data = await instagramPostCommentsFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.map(obj => new Date(obj.string_map_data.Time.timestamp * 1000).toString());
          addActivity('instagram: comment on posts', timestamps);
          const comments = json.map(obj => obj.string_map_data?.Comment?.value);
          addContent('posted', 'instagram post comments', comments);
          const accounts = json.filter(obj => obj.string_map_data['Media Owner']).map(obj => obj.string_map_data['Media Owner'].value);
          addInstagram('CommentedAccounts', 'posts', accounts);
        }

        let instagramReelsCommentsFile = zip.file('your_instagram_activity/comments/reels_comments.json') ||
          zip.file(innerZipFolder + 'your_instagram_activity/comments/reels_comments.json');
        if (instagramReelsCommentsFile) {
          console.log(`Processing instagram reels comments`);
          const data = await instagramReelsCommentsFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.comments_reels_comments.map(obj => new Date(obj.string_map_data.Time.timestamp * 1000).toString());
          addActivity('instagram: comment on reels', timestamps);
          const comments = json.comments_reels_comments.map(obj => obj.string_map_data?.Comment?.value);
          addContent('posted', 'instagram reel comments', comments);
          const accounts = json.comments_reels_comments.filter(obj => obj.string_map_data['Media Owner']).map(obj => obj.string_map_data['Media Owner'].value);
          addInstagram('CommentedAccounts', 'reels', accounts);
        }

        let instagramLikedPostsFile = zip.file('your_instagram_activity/likes/liked_posts.json') ||
          zip.file(innerZipFolder + 'your_instagram_activity/likes/liked_posts.json');
        if (instagramLikedPostsFile) {
          console.log('Processing instagram liked posts');
          const data = await instagramLikedPostsFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.likes_media_likes.map(obj => new Date(obj.string_list_data[0].timestamp * 1000).toString());
          addActivity('instagram: like posts', timestamps);
          const accounts = json.likes_media_likes.map(obj => obj.title);
          addInstagram('LikedAccounts', 'posts', accounts);
        }

        let instagramLikedCommentsFile = zip.file('your_instagram_activity/likes/liked_comments.json') ||
          zip.file(innerZipFolder + 'your_instagram_activity/likes/liked_comments.json');
        if (instagramLikedCommentsFile) {
          console.log('Processing instagram liked comments');
          const data = await instagramLikedCommentsFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.likes_comment_likes.map(obj => new Date(obj.string_list_data[0].timestamp * 1000).toString());
          addActivity('instagram: like comments', timestamps);
          const accounts = json.likes_comment_likes.map(obj => obj.title);
          addInstagram('LikedAccounts', 'comments', accounts);
        }

        let instagramLikedStoriesFile = zip.file('your_instagram_activity/story_sticker_interactions/story_likes.json') ||
          zip.file(innerZipFolder + 'your_instagram_activity/story_sticker_interactions/story_likes.json');
        if (instagramLikedStoriesFile) {
          console.log('Processing instagram liked stories');
          const data = await instagramLikedStoriesFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.story_activities_story_likes.map(obj => new Date(obj.string_list_data[0].timestamp * 1000).toString());
          addActivity('instagram: like stories', timestamps);
          const accounts = json.story_activities_story_likes.map(obj => obj.title);
          addInstagram('LikedAccounts', 'stories', accounts);
        }

        const instagramMessagesFiles = [];
        zip.folder('your_instagram_activity/messages/inbox')
          .forEach((relativePath, file) => {{if (relativePath.match(/\/message_1.json$/)) instagramMessagesFiles.push(file);}});
        zip.folder(innerZipFolder + 'your_instagram_activity/messages/inbox')
          .forEach((relativePath, file) => {{if (relativePath.match(/\/message_1.json$/)) instagramMessagesFiles.push(file);}});
        let allMessageTimestamps = [];
        for await (const file of instagramMessagesFiles) {
          console.log(`Processing instagram messages in file: ${file.name}`);
          const data = await file.async('text');
          const json = JSON.parse(data);
          const participants = json.participants;
          if (participants.length < 2) continue;
          const chatName = participants.length === 2 ? participants[0].name : `${file.name.match(/.+\/(.*)_\d*\/message_1.json$/).pop()} (group chat)`;
          const you = participants[participants.length === 2 ? 1 : 0].name;
          const timestamps = json.messages.map(obj => new Date(obj.timestamp_ms).toString());
          allMessageTimestamps = allMessageTimestamps.concat(timestamps);
          addActivity(`instagram: chats with ${chatName}`, timestamps);
          const messages = json.messages.filter(obj => obj.sender_name === you).map(obj => obj.content);
          addContent('messaged', 'instagram messages', messages);
        }
        if (allMessageTimestamps.length > 0) addActivity('instagram: chats and messages', allMessageTimestamps);

        let instagramStoryEmojiSlidersFile = zip.file('your_instagram_activity/story_sticker_interactions/emoji_sliders.json') ||
          zip.file(innerZipFolder + 'your_instagram_activity/story_sticker_interactions/emoji_sliders.json');
        if (instagramStoryEmojiSlidersFile) {
          console.log('Processing instagram story emoji sliders');
          const data = await instagramStoryEmojiSlidersFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.story_activities_emoji_sliders.map(obj => new Date(obj.string_list_data[0].timestamp * 1000).toString());
          addActivity('instagram: story emoji sliders', timestamps);
          const accounts = json.story_activities_emoji_sliders.map(obj => obj.title);
          addInstagram('StoryInteractedAccounts', 'emoji sliders', accounts);
        }

        let instagramStoryPollsFile = zip.file('your_instagram_activity/story_sticker_interactions/polls.json') ||
          zip.file(innerZipFolder + 'your_instagram_activity/story_sticker_interactions/polls.json');
        if (instagramStoryPollsFile) {
          console.log('Processing instagram story polls');
          const data = await instagramStoryPollsFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.story_activities_polls.map(obj => new Date(obj.string_list_data[0].timestamp * 1000).toString());
          addActivity('instagram: story polls', timestamps);
          const accounts = json.story_activities_polls.map(obj => obj.title);
          addInstagram('StoryInteractedAccounts', 'polls', accounts);
        }

        let instagramStoryQuestionsFile = zip.file('your_instagram_activity/story_sticker_interactions/questions.json') ||
          zip.file(innerZipFolder + 'your_instagram_activity/story_sticker_interactions/questions.json');
        if (instagramStoryQuestionsFile) {
          console.log('Processing instagram story questions');
          const data = await instagramStoryQuestionsFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.story_activities_questions.map(obj => new Date(obj.string_list_data[0].timestamp * 1000).toString());
          addActivity('instagram: story questions', timestamps);
          const accounts = json.story_activities_questions.map(obj => obj.title);
          addInstagram('StoryInteractedAccounts', 'questions', accounts);
        }

        let instagramStoryQuizzesFile = zip.file('your_instagram_activity/story_sticker_interactions/quizzes.json') ||
          zip.file(innerZipFolder + 'your_instagram_activity/story_sticker_interactions/quizzes.json');
        if (instagramStoryQuizzesFile) {
          console.log('Processing instagram story quizzes');
          const data = await instagramStoryQuizzesFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.story_activities_quizzes.map(obj => new Date(obj.string_list_data[0].timestamp * 1000).toString());
          addActivity('instagram: story quizzes', timestamps);
          const accounts = json.story_activities_quizzes.map(obj => obj.title);
          addInstagram('StoryInteractedAccounts', 'quizzes', accounts);
        }

        let instagramStoryCountdownsFile = zip.file('your_instagram_activity/story_sticker_interactions/countdowns.json') ||
          zip.file(innerZipFolder + 'your_instagram_activity/story_sticker_interactions/countdowns.json');
        if (instagramStoryCountdownsFile) {
          console.log('Processing instagram story countdowns');
          const data = await instagramStoryCountdownsFile.async('text');
          const json = JSON.parse(data);
          const timestamps = json.story_activities_countdowns.map(obj => new Date(obj.string_list_data[0].timestamp * 1000).toString());
          addActivity('instagram: story countdowns', timestamps);
          const accounts = json.story_activities_countdowns.map(obj => obj.title);
          addInstagram('StoryInteractedAccounts', 'countdowns', accounts);
        }

        // ---------------------------------
        // ------------Google---------------
        // ---------------------------------

        // Google Utilities
        
        const formatTimestamp = (timestamp) => {
          if (timestamp.includes('BST')) return timestamp.replace('BST', '');
          return timestamp;
        }

        const activityApps = ['Ads', 'Chrome', 'Developers', 'Drive', 'Flights', 'Help', 'Hotels', 'Image Search', 'Search', 'Shopping', 'Takeout'];
        for await (const app of activityApps) {
          let file = zip.file(`Takeout/My Activity/${app}/My Activity.html`) || zip.file(`Takeout/My Activity/${app}/MyActivity.html`) ||
            zip.file(innerZipFolder + `Takeout/My Activity/${app}/My Activity.html`) || zip.file(innerZipFolder + `Takeout/My Activity/${app}/MyActivity.html`);
          if (file) {
            console.log(`Processing google ${app}`);
            const data = await file.async('text');
            const root = parse(data);
            const divElements = root.getElementsByTagName('div');
            const timestamps = [];
            const searches = [];
            const views = [];
            const sites = [];
            for (const element of divElements) {
              const description = element.innerText.split('\n');
              if (element.innerText.match(/^Searched\sfor\s/)) searches.push(description[0].slice(13));
              else if (element.innerText.match(/^Viewed\simage\sfrom\s/)) views.push(description[0].slice(18));
              else if (element.innerText.match(/^Viewed\s/)) views.push(description[0].slice(7));
              else if (element.innerText.match(/^Visited\s/)) sites.push(description[0].slice(8));
              else if (element.innerText.match(/^(Initiated|Used)\s/)) {}
              else continue;
              timestamps.push(new Date(formatTimestamp(description[description.length - 1])));
            }
            if (timestamps.length > 0) addActivity(`google: Google ${app}`, timestamps);
            if (searches.length > 0) addContent('searched', `Google ${app}`, searches);
            if (views.length > 0) addContent('viewed', `Google ${app}`, views);
            if (sites.length > 0) addGoogle('sites', sites);
          }
        }

        let googlePlayStoreFile = zip.file('Takeout/My Activity/Google Play Store/My Activity.html') || zip.file('Takeout/My Activity/Google Play Store/MyActivity.html') || 
          zip.file(innerZipFolder + 'Takeout/My Activity/Google Play Store/My Activity.html') || zip.file(innerZipFolder + 'Takeout/My Activity/Google Play Store/MyActivity.html') ;
        if (googlePlayStoreFile) {
          console.log('Processing google play store');
          const data = await googlePlayStoreFile.async('text');
          const root = parse(data);
          const divElements = root.getElementsByTagName('div');
          divElements.forEach(element => {
            if (element.innerText.match(/^Used\s/)) {
              const description = element.innerText.split('\n');
              const app = description[0].slice(5);
              const timestamp = new Date(formatTimestamp(description[description.length - 1]));
              addActivity(app, [timestamp]);
            }
          })
        }
        
        let googleMapsFile = zip.file('Takeout/My Activity/Maps/My Activity.html') || zip.file('Takeout/My Activity/Maps/MyActivity.html') || 
          zip.file(innerZipFolder + 'Takeout/My Activity/Maps/My Activity.html') || zip.file(innerZipFolder + 'Takeout/My Activity/Maps/MyActivity.html');
        if (googleMapsFile) {
          console.log('Processing google maps');
          const data = await googleMapsFile.async('text');
          const root = parse(data);
          const linkElements = root.getElementsByTagName('a');
          const timestamps = [];
          const locations = [];
          linkElements.forEach(element => {
            const latlong = element.getAttribute('href').match(/@-?\d+.\d+,-?\d+.\d+/);
            if (latlong) {
              const description = element.parentNode.innerText.split('\n');
              timestamps.push(new Date(formatTimestamp(description[description.length - 1])))
              locations.push({
                latlong: latlong[0].replace('@', ''),
                label: element.innerText,
                source: 'Google Maps'
              })
            }
          })
          addActivity('google: Google Maps', timestamps);
          addLocations(locations);
        }
        
        let googleYoutubeFile = zip.file(`Takeout/My Activity/YouTube/My Activity.html`) || zip.file(`Takeout/My Activity/YouTube/MyActivity.html`) || 
            zip.file(innerZipFolder + `Takeout/My Activity/YouTube/My Activity.html`) || zip.file(innerZipFolder + `Takeout/My Activity/YouTube/MyActivity.html`);
          if (googleYoutubeFile) {
            console.log(`Processing Youtube`);
            const data = await googleYoutubeFile.async('text');
            const root = parse(data);
            const divElements = root.getElementsByTagName('div');
            const timestamps = [];
            const searches = [];
            const watched = [];
            const watchedChannels = [];
            for (const element of divElements) {
              const description = element.innerText.split('\n');
              if (element.innerText.match(/^Searched\sfor\s/)) searches.push(description[0].slice(13));
              else if (element.innerText.match(/^Watched\s/)) {
                watched.push(description[0].slice(8));
                if (description.length > 1 && !description[1].includes('Watched at') && isNaN(new Date(description[1]))) watchedChannels.push(description[1]);
              }
              else continue;
              timestamps.push(new Date(formatTimestamp(description[description.length - 1])));
            }
            if (timestamps.length > 0) addActivity('google: YouTube', timestamps);
            if (searches.length > 0) addContent('searched', 'YouTube', searches);
            if (watched.length > 0) addContent('youtubeWatched', 'YouTube', watched);
            if (watchedChannels.length > 0) addGoogle('youtubeWatchedChannels', watchedChannels);
          }
        
        // ---------------------------------
        // ------------Misc-----------------
        // ---------------------------------

        // update topic model and sentiments

        const types = ['posted', 'messaged', 'searched', 'viewed', 'youtubeWatched'];
        for (const type of types) {
          if (db[type + 'Content']) {
            console.log(`Updating ${type} topics`);
            const document = db[type + 'Content'].reduce((allText, obj) => allText.concat(obj.texts), []);
            const numberOfTopics = 20;
            const topics = new lda(document, numberOfTopics, 5).map((topic, id) => {
              const arr = topic.map(({ term }) => ({ topic: term, weight: numberOfTopics - id}));
              return arr;
            }).flat();
            db[type + 'Topics'] = topics;
  
            console.log(`Updating ${type} sentiment`);
            const sentiment = new Sentiment();
            const result = db[type + 'Content'].map(({source, texts}) => 
              ({source, sentiments: texts.map(text => sentiment.analyze(text).comparative)}));
            db[type + 'Sentiment'] = result;
          }
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
      <NavBar db = { db } highlighted='home'/>
      <div className='home-container'>
        <div className='panel-container'>
          <div>
            <InfoCard 
              title='How it Works'
              content={
                <>
                  <h5>Local App</h5>
                    <div>
                      <strong>Your data is processed completely locally and does not leave your computer</strong><br/>
                      This is a desktop app run directly on your computer and can be run completely offline, with the exception of the map component<br/>
                      When scrolling through the map, the app fetches the tile (background) from OpenStreetMap through the URL "https://s.tile.openstreetmap.org/z/x/y.png"<br/>
                      Below is a sample of a fetched tile, which only contains information about where you are currently zoomed in on the map and <strong>none of your locations</strong> (markers)<br/>
                      You may verify there is no other internet access through the network tab in dev tools (Ctrl + Shift + I)<br/>
                      <img className='sample-tile' src={require('../img/sample-tile.png')} />
                    </div>
                  <h5>Data Accuracy</h5>
                    <div>
                      While we aim to interpret your data downloads accurately, its lack of documentation and evolving format has made this difficult<br/>
                      Therefore, information presented in this app, including any description of the data, may not be entirely accurate or interpreted accurately and should not be taken completely at face value<br/>
                    </div>
                  <h5>Bugs and Issues</h5>
                    <div>
                      This app is developed for research purposes with limited resources, so there are likely bugs present, if you encounter any issues or have any suggestions, feel free to message us at s2157573@ed.ac.uk<br/>
                      We apologies for any inconvenience caused and wll be grateful for your contribution to improve the app
                    </div>
                </>
              }
            />
            <ol>
              <h5><li>Obtain data downloads from online platforms</li></h5>
              See below for instructions and supported platforms: <br/>
              <button onClick={() => {setInstructionCard(instructionCard === 'google' ? '' : 'google')}} className={instructionCard === 'google' ? 'highlighted' : ''}>Google</button>&nbsp;
              <button onClick={() => {setInstructionCard(instructionCard === 'instagram' ? '' : 'instagram')}} className={instructionCard === 'instagram' ? 'highlighted' : ''}>Instagram</button>&nbsp;
              <button onClick={() => {setInstructionCard(instructionCard === 'linkedin' ? '' : 'linkedin')}} className={instructionCard === 'linkedin' ? 'highlighted' : ''}>LinkedIn</button>&nbsp;
              <button disabled onClick={() => {setInstructionCard(instructionCard === 'facebook' ? '' : 'facebook')}} className={instructionCard === 'facebook' ? 'highlighted' : ''}>Facebook (coming soon)</button>&nbsp;
              <button disabled onClick={() => {setInstructionCard(instructionCard === 'x' ? '' : 'x')}} className={instructionCard === 'x' ? 'highlighted' : ''}>X (Twitter) (coming soon)</button>&nbsp;
              {
                instructionCard === 'google' &&
                <Card toggleCard={() => {setInstructionCard('')}} title='Download your data from Google' content=
                {
                  <ol>
                    <li>Go to <a href='https://takeout.google.com/' target='_blank'>Google Takeout (https://takeout.google.com/)</a> while logged in to your Google account</li>

                    <li>Select data you want to download (please select all if possible for a comprehensive review), then deselect <strong>Drive</strong> to reduce download size<br/><img src={require('../img/google1.png')} /></li>
                    <li>Click <strong>Next Step</strong><br/><img src={require('../img/google2.png')} /></li>
                    <li>Select <strong>Transfer to: Send download link via email</strong> and <strong>Frequency: Export once</strong><br/><img src={require('../img/google3.png')} /></li>
                    <li>Select <strong>File type: .zip</strong>, <strong>File size: 1 GB</strong> and click <strong>Create export</strong><br/><img src={require('../img/google4.png')} /></li>
                    <li>Your request has been sent and it might take a couple of hours or days<br/><img src={require('../img/google5.png')} /></li>
                    <li>Download your data when you have received this email from Google, your data downloads should be (multiple) files in the form of <strong>takeout-xxxx-xxx.zip</strong><br/><img src={require('../img/google6.png')} /></li>
                  </ol>
                }/>
              }
              {
                instructionCard === 'instagram' &&
                <Card toggleCard={() => {setInstructionCard('')}} title='Download your data from Instagram' content=
                {
                  <ol>
                    <li>Follow the instructions on <a href='https://help.instagram.com/181231772500920' target='_blank'>https://help.instagram.com/181231772500920</a>, these steps are written with reference to it</li>
                    <li>Go to <a href='https://accountscenter.instagram.com/info_and_permissions/' target='_blank'>https://accountscenter.instagram.com/info_and_permissions/</a> while logged in to your Instagram/Meta account</li>
                    <li>Click <strong>Download your information</strong><br/><img src={require('../img/instagram1.png')} /></li>
                    <li>Click <strong>Download or transfer information</strong><br/><img src={require('../img/instagram2.png')} /></li>
                    <li>Select your Instagram account<br/><img src={require('../img/instagram3.png')} /></li>
                    <li>Click <strong>All available information</strong><br/><img src={require('../img/instagram4.png')} /></li>
                    <li>Click <strong>Download to device</strong><br/><img src={require('../img/instagram5.png')} /></li>
                    <li>Select <strong>Format: JSON</strong> and the <strong>Date range</strong> and <strong>Media quality</strong> you desire<br/><img src={require('../img/instagram6.png')} /></li>
                    <li>Your request has been sent and it might take a couple of hours or days<br/><img src={require('../img/instagram7.png')} /></li>
                    <li>Download your data when you have received this email from Instagram, your data downloads should be files in the form of <strong>instagram-xxxx-xxx.zip</strong><br/><img src={require('../img/instagram8.png')} /></li>
                </ol>
                }/>
              }
              {
                instructionCard === 'linkedin' &&
                <Card toggleCard={() => {setInstructionCard('')}} title='Download your data from LinkedIn' content=
                {
                  <ol>
                    <li>Follow the instructions on <a href='https://www.linkedin.com/help/linkedin/answer/a1339364/downloading-your-account-data' target='_blank'>https://www.linkedin.com/help/linkedin/answer/a1339364/downloading-your-account-data</a>, these steps are written with reference to it</li>
                    <li>Go to your LinkedIn homepage: <a href='https://www.linkedin.com/feed/' target='_blank'>https://www.linkedin.com/feed/</a></li>
                    <li>Click <strong>Me</strong> below your profile picture and select <strong>Settings and Privacy</strong> from the dropdown<br/><img src={require('../img/linkedin1.png')}/></li>
                    <li>Select <strong>Data Privacy</strong> and click <strong>Get a copy of your data</strong><br/><img src={require('../img/linkedin2.png')}/></li>
                    <li>Select the data you want to include and click <strong>Request archive</strong><br/><img src={require('../img/linkedin3.png')}/></li>
                    <li>Your request has been sent and it might take a couple of hours or days<br/><img src={require('../img/linkedin4.png')}/></li>
                    <li>Download your data when you have received the corresponding email from LinkedIn</li>
                </ol>
                }/>
              }
              <h5><li>Upload the data download zip files to the app</li></h5>
              Use the <strong>Process your data downloads</strong> section on the right
              <h5><li>The app processes the data downloads locally and presents you with insights derived from it</li></h5>
              All data is processed locally on your machine, that means the app works even without internet
              <h5><li>Explore your data!</li></h5>
              Explore data of different categories, for example Activity, Topics, Locations and different apps
              <h5><li>Want to take control of your data?</li></h5>
              <u><strong>Take action</strong></u> to inspect all your data, set your data preferences and delete data you don't want online platforms to keep:<br/>
              <button onClick={() => {setDeleteCard(deleteCard === 'google' ? '' : 'google')}} className={deleteCard === 'google' ? 'highlighted' : ''}>Google</button>&nbsp;
              <button onClick={() => {setDeleteCard(deleteCard === 'instagram' ? '' : 'instagram')}} className={deleteCard === 'instagram' ? 'highlighted' : ''}>Instagram</button>&nbsp;
              {
                deleteCard === 'google' &&
                <Card toggleCard={() => {setDeleteCard('')}} title='Inspect and delete your google data' content=
                {
                  <ul>
                    <li>Google data and privacy dashboard: <a href='https://myaccount.google.com/data-and-privacy' target='_blank'>https://myaccount.google.com/data-and-privacy</a></li>
                    <li>Chrome privacy and security centre: <a href='chrome://settings/privacy' target='_blank'>chrome://settings/privacy</a></li>
                    <li>Delete browsing data: <a href='chrome://settings/clearBrowserData' target='_blank'>chrome://settings/clearBrowserData</a></li>
                  </ul>
                }/>
              }
              {
                deleteCard === 'instagram' &&
                <Card toggleCard={() => {setDeleteCard('')}} title='Inspect and delete your Instagram (Meta) data' content=
                {
                  <ul>
                    <li>High level overview of your data at Meta accounts centre: <a href='https://accountscenter.facebook.com/info_and_permissions' target='_blank'>https://accountscenter.facebook.com/info_and_permissions</a></li>
                    <li>Detailed information portal: <a href='https://www.facebook.com/your_information/' target='_blank'>https://www.facebook.com/your_information/</a></li>
                    <li>Manage Off-meta activities: <a href='https://accountscenter.instagram.com/info_and_permissions/off_facebook_activity/' target='_blank'>https://accountscenter.instagram.com/info_and_permissions/off_facebook_activity/</a></li>
                  </ul>
                }/>
              }
            </ol>
          </div>

          <div className='upload-container'>
            <h4>Process your data downloads</h4>
            <div>Please upload a zip file</div>
            <input type='file' formEncType='multipart/form-data' name='zipfile' onChange={ (e) => {setFile(e.target.files[0]); setFileUploadStatus('')}}></input>
            <div className='mt-2 mb-3'>
              <button onClick={ uploadFile }>Upload file</button>
              {fileUploadStatus && 
                fileUploadStatus === loadingStatus ? <span><span className='loading-icon'></span> Please wait and do not refresh or close the window, this might take a while depending on file size and your computer</span>: 
                fileUploadStatus.includes(warningStatusPrefix) ? 
                  <span className='warning'> {fileUploadStatus.replace(warningStatusPrefix, '')}</span> :
                  <span className='success'> {fileUploadStatus}</span>}
            </div>
            <div>
              <strong>Your data downloads</strong>
              <a data-tooltip-id="downloads-info-tooltip" data-tooltip-content={`Useful info from your data downloads is parsed and stored in ${dbPath},db.md,chat.json and nowhere else`}>
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

          <Dialogue db={ db } isHome={ true }/>
          <Activity db={ db } isHome={ true }/>
          <Location db={ db } isHome={ true }/>
          <Interests db={ db } isHome={ true }/>
          <Pi db={ db } isHome={ true }/>
          <Instagram db={ db } isHome={ true }/>
          <Google db={ db } isHome={ true }/>
        </div>
      </div>
    </div>
  )
}

export default Home