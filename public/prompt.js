const jsonToMd = (json) => {
  const md = [];

  if (json.activity) {
    json.activity.forEach(({app, timestamps}) => {
      let summary = '';
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      summary = summary + `user accessed the service: ${app}: ${timestamps.length} times`;
      // months.forEach((month, index) => {
      //   const count = timestamps.filter(timestamp => (new Date(timestamp)).getMonth() == index).length;
      //   summary = summary + `,${count} times in ${month}`;
      // })
      // days.forEach((day, index) => {
      //   const count = timestamps.filter(timestamp => (new Date(timestamp)).getDay() == index).length;
      //   summary = summary + `,${count} times on ${day}`;
      // })
      md.push(summary);
    })
  }

  if (json.location) {
    json.location.forEach(({label, source}) => {
      md.push(`user accessed location: ${label} through source: ${source}`);
    })
  }

  if (json.postedTopics) { 
    md.push(`the content the user has posted include the following topics: ${json.postedTopics.map(({topic}) => topic)}`);
  }

  if (json.postedSentiment) {
    json.postedSentiment.forEach(({source, sentiments}) => {
      md.push(`the content the user has posted on ${source} has the average sentiment score: ${sentiments.reduce((a, b) => a + b, 0) / sentiments.length}`);
    })
  }

  if (json.messagedTopics) { 
    md.push(`the user's messages include the following topics: ${json.messagedTopics.map(({topic}) => topic)}`);
  }

  if (json.messagedSentiment) {
    json.messagedSentiment.forEach(({source, sentiments}) => {
      md.push(`the user's messages on ${source} has the average sentiment score: ${sentiments.reduce((a, b) => a + b, 0) / sentiments.length}`);
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

  return md.join('\n');
}

module.exports.jsonToMd = jsonToMd;