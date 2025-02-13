import React from 'react'
import { useNavigate } from 'react-router-dom'

const NavBar = ({ db, highlighted }) => {
  
  const navigate = useNavigate();

  return (
    <navbar>
      <div className={(highlighted === 'home' ? 'highlighted-nav' : '') + ' home-nav nav-item'} onClick={() => navigate('/')}>Home</div>
      {db && db.activity &&<><div>|</div>
        <div className={(highlighted === 'activity' ? 'highlighted-nav' : '') + ' nav-item'} onClick={() => navigate('/activity')}>Activity</div></>}
      {db && db.location &&<><div>|</div>
        <div className={(highlighted === 'location' ? 'highlighted-nav' : '') + ' nav-item'} onClick={() => navigate('/location')}>Location</div></>}
      {(db && (db.postedTopics || db.postedSentiment || db.messagedTopics || db.messagedSentiment || db.advertisers || db.recommendedTopics || db.searchedTopics || db.viewedTopics)) &&<><div>|</div>
        <div className={(highlighted === 'interests' ? 'highlighted-nav' : '') + ' nav-item'} onClick={() => navigate('/interests')}>Interests</div></>}
      {(db && (db.piPhone || db.piLocation || db.piIp || db.piDevice)) &&<><div>|</div>
        <div className={(highlighted === 'pi' ? 'highlighted-nav' : '') + ' nav-item'} onClick={() => navigate('/pi')}>Personal Information</div></>}
      {((db && ((db.activity && db.activity.find(({app}) => app.includes('instagram'))) || db.instagramCommentedAccounts || db.instagramViewedAccounts || db.instagramLikedAccounts || db.instagramStoryInteractedAccounts))) &&<><div>|</div>
        <div className={(highlighted === 'instagram' ? 'highlighted-nav' : '') + ' nav-item'} onClick={() => navigate('/instagram')}>Instagram</div></>}
      {((db && ((db.activity && db.activity.find(({app}) => app.includes('google'))) || db.sites || db.youtubeWatchedChannels || db.youtubeWatchedTopics))) &&<><div>|</div>
        <div className={(highlighted === 'google' ? 'highlighted-nav' : '') + ' nav-item'} onClick={() => navigate('/google')}>Google</div></>}
    </navbar>
  )
}

export default NavBar