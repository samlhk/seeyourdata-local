import React from 'react';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PostedTopicsWordCloud from './PostedTopicsWordCloud';
import AdvertisersWordCloud from './AdvertisersWordCloud';
import RecommendedTopicsWordCloud from './RecommendedTopicsWordCloud';

const Interests = ({ db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ?
      (db.postedTopics || db.advertisers || db.recommendedTopics ?
        <div className='explore-more-container' onClick={ () => navigate('/interests') }>
          <div className='explore-more-bar'>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <PostedTopicsWordCloud db = { db }/>
        </div> : <></>) :
      <>
        <PostedTopicsWordCloud db = { db }/>
        <AdvertisersWordCloud db = { db }/>
        <RecommendedTopicsWordCloud db = { db }/>
        <div>Interests visualisation 2</div>
      </>
  )
}

export default Interests