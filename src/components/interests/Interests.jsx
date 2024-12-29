import React from 'react';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import InterestsWordCloud from './InterestsWordCloud';
import InterestsWordCloudRefresh from './InterestsWordCloudRefresh';
import SentimentDistribution from './SentimentDistribution';

const Interests = ({ db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ?
      (db.postedTopics || db.postedSentiment || db.messagedTopics || db.messagedSentiment || db.advertisers || db.recommendedTopics ?
        <div className='explore-more-container' onClick={ () => navigate('/interests') }>
          <div className='explore-more-bar'>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <InterestsWordCloud db = { db } type='postedTopics' title='Topics from posted content' />
        </div> : <></>) :
      <>
        <InterestsWordCloud db = { db } type='postedTopics' title='Topics from posted content' />
        <SentimentDistribution db = { db } type='postedSentiment' title='Sentiment scores from posted content' />
        <InterestsWordCloud db = { db } type='messagedTopics' title='Topics from private messages' />
        <SentimentDistribution db = { db } type='messagedSentiment' title='Sentiment scores from private messages' />
        <InterestsWordCloudRefresh db = { db } type='advertisers' title='Your advertisers' />
        <InterestsWordCloudRefresh db = { db } type='recommendedTopics' title='Topics for content recommendations' />
        <div>Interests visualisation 2</div>
      </>
  )
}

export default Interests