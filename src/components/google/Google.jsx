import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLongArrowAltRight } from "react-icons/fa";
import { colorScheme } from '../../App';
import shuffleSeed from 'shuffle-seed';
import GoogleActivity from './GoogleActivity';
import GoogleRanking from './GoogleRanking';
import InterestsWordCloud from '../interests/InterestsWordCloud';
import Summary from '../ai/Summary';


const Google = ({ db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ? 
      ((db.activity && db.activity.find(({app}) => app.includes('google'))) || db.sites || db.youtubeWatchedChannels || db.youtubeWatchedTopics ?
        <div className='explore-more-container' onClick={ () => navigate('/google') }>
          <div className='blocker'></div>
          <div className='explore-more-bar'>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <GoogleActivity db = { db } colors = { colorScheme[2] } filterBar = { false }/>
        </div>: <></>) :
      <>
        <GoogleActivity db = { db } colors = { colorScheme[2] }/>
        <Summary db = { db } category='Google products usage' />
        <GoogleRanking db = { db } category='sites' title='Most visited sites'
          description='Your most visited websites on Google Chrome, sorted from most visited to least'
          benefits='Chrome keep your browsing history for your record and page recommendations in the future'
          harms='This data may be used for targetted marketing'
          sources={['Google activity: Chrome']}  
        />
        <GoogleRanking db = { db } category='youtubeWatchedChannels' title='YouTube most watched channels'
          description='Your most watched YouTube channels, sorted from most watched to least'
          benefits='YouTube keeps your watch history for your record and video recommendations in the future'
          harms='This data may be used for targetted marketing'
          sources={['Google activity: YouTube']}
        />
        <InterestsWordCloud db = { db } type='youtubeWatchedTopics' title='Topics you have watched on YouTube'
          description='Topics from things you have watched on YouTube, generated with LDA topic modelling'
          sources={['Google activity: YouTube videos watched']}
        />
      </>
  )
}

export default Google