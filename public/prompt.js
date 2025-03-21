const jsonToMd = (json) => {
  const md = [];

  if (json.activity || json.spotify) {
    const activities = json.activity || [];
    if (json.spotify) {
      for (const media of ['music', 'audiobook', 'podcast']) {
        if (json.spotify[media]) {
          activities.push({ app: `spotify ${media}`, timestamps: json.spotify[media].map(({timestamp}) => timestamp) })
        }
      }
    }
    activities.forEach(({app, timestamps}) => {
      if (!app.includes('instagram: chats with')) {
        let summary = '';
        summary = summary + `user accessed the service: ${app}: ${timestamps.length} times`;
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        months.forEach((month, index) => {
          const count = timestamps.filter(timestamp => (new Date(timestamp)).getMonth() == index).length;
          if (count > 0) summary = summary + `,${count} times in ${month}`;
        })
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        days.forEach((day, index) => {
          const count = timestamps.filter(timestamp => (new Date(timestamp)).getDay() == index).length;
          if (count > 0) summary = summary + `,${count} times on ${day}`;
        })
        md.push(summary);
      }
    })
  }

  if (json.location) {
    json.location.forEach(({label, source}) => {
      if (!label.includes('IP: ')) md.push(`user accessed location: ${label} through source: ${source}`);
    })
  }

  if (json.postedContent) { 
    json.postedContent.forEach(({source, texts}) => {
      md.push(`the user has posted the following content thorugh ${source}: ${texts}`);
    })
  }
  
  // if (json.postedTopics) { 
  //   md.push(`the content the user has posted include the following topics: ${json.postedTopics.map(({topic}) => topic)}`);
  // }

  if (json.postedSentiment) {
    json.postedSentiment.forEach(({source, sentiments}) => {
      md.push(`the content the user has posted on ${source} has the average sentiment score (lowest: -5, highest: 5): ${sentiments.reduce((a, b) => a + b, 0) / sentiments.length}`);
    })
  }

  if (json.messagedContent) { 
    json.messagedContent.forEach(({source, texts}) => {
      md.push(`the user has made the following messages thorugh ${source}: ${texts}`);
    })
  }

  // if (json.messagedTopics) { 
  //   md.push(`the user's messages include the following topics: ${json.messagedTopics.map(({topic}) => topic)}`);
  // }

  if (json.messagedSentiment) {
    json.messagedSentiment.forEach(({source, sentiments}) => {
      md.push(`the user's messages on ${source} has the average sentiment score (lowest: -5, highest: 5): ${sentiments.reduce((a, b) => a + b, 0) / sentiments.length}`);
    })
  }

  if (json.advertisers) {
    json.advertisers.forEach(({source, list}) => {
      md.push(`the user has the following advertisers on ${source}: ${list}`);
    })
  }

  if (json.recommendedTopics) {
    json.recommendedTopics.forEach(({source, list}) => {
      md.push(`the user has the following recommendedTopics on ${source}: ${list}`);
    })
  }

  if (json.searchedContent) { 
    json.searchedContent.forEach(({source, texts}) => {
      md.push(`the user has searched the following information through ${source}: ${texts}`);
    })
  }

  // if (json.searchedTopics) { 
  //   md.push(`the user has searched for the following topics: ${json.searchedTopics.map(({topic}) => topic)}`);
  // }

  if (json.viewedContent) { 
    json.viewedContent.forEach(({source, texts}) => {
      md.push(`the user has viewed the following content through ${source}: ${texts}`);
    })
  }

  // if (json.viewedTopics) { 
  //   md.push(`the user has viewed content related the following topics: ${json.viewedTopics.map(({topic}) => topic)}`);
  // }

  if (json.piDemographic) {
    json.piDemographic.forEach(({source, list}) => {
      md.push(`the user has the following demographics inferred by ${source}: ${list}`);
    })
  }

  if (json.piPhone) {
    json.piPhone.forEach(({source, list}) => {
      md.push(`the user has the following phone numbers on ${source}: ${list}`);
    })
  }

  if (json.piLocation) {
    json.piLocation.forEach(({source, list}) => {
      md.push(`the user has used ${source} from these locations: ${list}`);
    })
  }

  if (json.piZipcode) {
    json.piZipcode.forEach(({source, list}) => {
      md.push(`the user has used ${source} from these zip codes: ${list}`);
    })
  }

  // if (json.piPayment) {
  //   json.piPayment.forEach(({source, list}) => {
  //     md.push(`the user has these payment methods from ${source}: ${list}`);
  //   })
  // }

  // if (json.piIp) {
  //   json.piIp.forEach(({source, list}) => {
  //     md.push(`the user has used ${source} from these IP addresses: ${list}`);
  //   })
  // }

  // if (json.piDevice) {
  //   json.piDevice.forEach(({source, list}) => {
  //     md.push(`the user has used ${source} with these devices: ${list}`);
  //   })
  // }

  // if (json.instagramCommentedAccounts) {
  //   let accounts = [];
  //   accounts = accounts.concat(json.instagramCommentedAccounts.posts || []);
  //   accounts = accounts.concat(json.instagramCommentedAccounts.reels || []);
  //   md.push(`the user has commented on the following accounts on instagram: ${[...new Set(accounts)]}`);
  // }

  // if (json.instagramViewedAccounts) {
  //   let accounts = [];
  //   accounts = accounts.concat(json.instagramViewedAccounts.ads || []);
  //   accounts = accounts.concat(json.instagramViewedAccounts.posts || []);
  //   accounts = accounts.concat(json.instagramViewedAccounts.suggestedProfiles || []);
  //   accounts = accounts.concat(json.instagramViewedAccounts.videos || []);
  //   md.push(`the user has viewed the following accounts on instagram: ${[...new Set(accounts)]}`);
  // }

  // if (json.instagramLikedAccounts) {
  //   let accounts = [];
  //   accounts = accounts.concat(json.instagramLikedAccounts.posts || []);
  //   accounts = accounts.concat(json.instagramLikedAccounts.comments || []);
  //   accounts = accounts.concat(json.instagramLikedAccounts.stories || []);
  //   md.push(`the user has liked the following accounts on instagram: ${[...new Set(accounts)]}`);
  // }

  // if (json.instagramStoryInteractedAccounts) {
  //   let accounts = [];
  //   accounts = accounts.concat(json.instagramStoryInteractedAccounts.emojiSliders || []);
  //   accounts = accounts.concat(json.instagramStoryInteractedAccounts.polls || []);
  //   accounts = accounts.concat(json.instagramStoryInteractedAccounts.questions || []);
  //   accounts = accounts.concat(json.instagramStoryInteractedAccounts.quizzes || []);
  //   accounts = accounts.concat(json.instagramStoryInteractedAccounts.countdowns || []);
  //   md.push(`the user has interacted with stories from the following accounts on instagram: ${[...new Set(accounts)]}`);
  // }

  // if (json.sites) {
  //   md.push(`the user has visited these websites: ${[...new Set(json.sites)]}`);
  // }

  // if (json.youtubeWatchedChannels) {
  //   md.push(`the user has watched these channels on YouTube: ${[...new Set(json.youtubeWatchedChannels)]}`);
  // }

  if (json.youtubeWatchedTopics) { 
    md.push(`the user has watched video content related the following topics on YouTube: ${json.youtubeWatchedTopics.map(({topic}) => topic)}`);
  }

  if (json.connectedCompanies) {
    md.push(`the user has connected with people from these companies on LinkedIn: ${[...new Set(json.connectedCompanies)]}`);
  }

  if (json.connectedPositions) {
    md.push(`the user has connected with people in these roles on LinkedIn: ${[...new Set(json.connectedPositions)]}`);
  }

  // if (json.connections) { 
  //   md.push(`the user has connected with these people on LinkedIn: ${json.connections.map(({name}) => name)}`);
  // }

  if (json.linkedinProfile) {
    json.linkedinProfile.forEach(({field, values}) => {
      md.push(`LinkedIn has inferred that the user's ${field} is: ${values}`);
    })
  }

  if (json.spotify) {
    if (json.spotify.music) {
      let songRecord = {};
      let artistRecord = {};
      for (const item of json.spotify.music) {
        songRecord[item.name] = (songRecord[item.name] || 0) + 1;
        artistRecord[item.artist] = (artistRecord[item.artist] || 0) + 1;
      }
      md.push(`The user has listened most to these songs on Spotify: ${Object.keys(songRecord).sort((item1, item2) => songRecord[item2] - songRecord[item1]).slice(0, 10)}`);
      md.push(`The user has listened most to these artists on Spotify: ${Object.keys(artistRecord).sort((item1, item2) => artistRecord[item2] - artistRecord[item1]).slice(0, 10)}`);
    }
    if (json.spotify.audiobook) {
      let record = {};
      for (const item of json.spotify.audiobook) {
        record[item.name] = (record[item.name] || 0) + 1;
      }
      md.push(`The user has listened most to these audiobooks on Spotify: ${Object.keys(record).sort((item1, item2) => record[item2] - record[item1]).slice(0, 10)}`);
    }
    if (json.spotify.podcast) {
      let record = {};
      for (const item of json.spotify.podcast) {
        record[item.name] = (record[item.name] || 0) + 1;
      }
      md.push(`The user has listened most to these podcasts on Spotify: ${Object.keys(record).sort((item1, item2) => record[item2] - record[item1]).slice(0, 10)}`);
    }
  }

  if (json.spotifyProfile) {
    let inferences = [];
    json.spotifyProfile.forEach(({values}) => {
      inferences = inferences.concat(values);
    })
    md.push(`Spotify has inferred the following about the user: ${inferences}`);
  }

  return md.join('\n');
}

module.exports.jsonToMd = jsonToMd;