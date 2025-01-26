import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLongArrowAltRight } from "react-icons/fa";
import { colorScheme } from '../../App';
import shuffleSeed from 'shuffle-seed';
import GoogleActivity from './GoogleActivity';
import GoogleRanking from './GoogleRanking';
import InterestsWordCloud from '../interests/InterestsWordCloud';


const Google = ({ db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ? 
      ((db.activity && db.activity.find(({app}) => app.includes('google'))) || db.sites || db.youtubeWatchedChannels || db.youtubeWatchedTopics ?
        <div className='explore-more-container' onClick={ () => navigate('/google') }>
          <div className='explore-more-bar'>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <GoogleActivity db = { db } colors = { colorScheme[2] } filterBar = { false }/>
        </div>: <></>) :
      <>
        <GoogleActivity db = { db } colors = { colorScheme[2] }/>
        <GoogleRanking db = { db } category='sites' title='Most visited sites'/>
        <GoogleRanking db = { db } category='youtubeWatchedChannels' title='YouTube most watched channels'/>
        <InterestsWordCloud db = { db } type='youtubeWatchedTopics' title='Topics you have watched on YouTube' />
      </>
  )
}

export default Google