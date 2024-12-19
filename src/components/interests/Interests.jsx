import React from 'react';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PostedTopicsWordCloud from './PostedTopicsWordCloud';

const Interests = ({ db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ?
      (db.postedTopics ?
        <div className='explore-more-container' onClick={ () => navigate('/interests') }>
          <div className='explore-more-bar'>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <PostedTopicsWordCloud db={ db }/>
        </div> : <></>) :
      <>
        <PostedTopicsWordCloud db={ db }/>
        <div>Interests visualisation 2</div>
      </>
  )
}

export default Interests