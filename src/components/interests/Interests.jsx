import React from 'react';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import InterestsWordCloud from './InterestsWordCloud';
import InterestsWordCloudRefresh from './InterestsWordCloudRefresh';
import SentimentDistribution from './SentimentDistribution';
import Summary from '../ai/Summary';

const Interests = ({ db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ?
      (db.postedTopics || db.postedSentiment || db.messagedTopics || db.messagedSentiment || db.advertisers || db.recommendedTopics || db.searchedTopics || db.viewedTopics ?
        <div className='explore-more-container' onClick={ () => navigate('/interests') }>
          <div className='explore-more-bar'>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <InterestsWordCloud db = { db } type='postedTopics' title='Topics from posted content' />
        </div> : <></>) :
      <>
        <InterestsWordCloud db = { db } type='postedTopics' title='Topics from posted content' 
          description='Topics from content you have posted publicly, generated with LDA topic modelling'
          benefits='Platforms may use this to understand your views and recommend content that you are more interested in'
          sources={['Instagram post and reel comments']}
        />
        <SentimentDistribution db = { db } type='postedSentiment' title='Sentiment scores from posted content'
          description='Sentiment scores from content you have posted publicly, generated with AFINN-based sentiment analysis, ranges from -5 to 5, you can select what posted content you want to view'
          sources={['Instagram post and reel comments']}  
        />
        <InterestsWordCloud db = { db } type='messagedTopics' title='Topics from private messages'
          description='Topics from your private messages, generated with LDA topic modelling'
        />
        <SentimentDistribution db = { db } type='messagedSentiment' title='Sentiment scores from private messages'
          description='Sentiment scores from your private messages, generated with AFINN-based sentiment analysis, ragnes from -5 to 5, you can select what messages you want to view'
        />
        <InterestsWordCloudRefresh db = { db } type='advertisers' title='Your advertisers'
          description='Advertisers using your activity or information, refresh to see more advertisers'
          sources={['Instagram advertisers']}
        />
        <InterestsWordCloudRefresh db = { db } type='recommendedTopics' title='Topics for content recommendations' 
          description='Your topics, determined by online platforms, refresh to see more topics'
          sources={['Instagram topics: "A collection of topics determined by your activity on Instagram that is used to create recommendations for you in different areas of Instagram, such as Reels, feed recommendations, and Shopping"']}
        />
        <Summary db = { db } category='Interests'/>
        <InterestsWordCloud db = { db } type='searchedTopics' title='Topics you have searched for'
          description='Topics from your searches through the online platforms, generated with LDA topic modelling'
          sources={['Searches on Google products: YouTube, Chrome, Flights, Hotels, Image Search, Search, Shopping']}
        />
        <InterestsWordCloud db = { db } type='viewedTopics' title='Topics you have viewed' 
          description={'Topics from things you have viewed through online platforms, generated with LDA topic modelling'}
          sources={['Views through Google products: Ads, Chrome']}
        />
      </>
  )
}

export default Interests