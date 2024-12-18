import React from 'react';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import InterestsWordCloud from './InterestsWordCloud';

const Interests = ({ db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ?
      (db.documents ?
        <div className='explore-more-container' onClick={ () => navigate('/interests') }>
          <div className='explore-more-bar'>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <InterestsWordCloud db={ db }/>
        </div> : <></>) :
      <>
        <InterestsWordCloud db={ db }/>
        <div>Interests visualisation 2</div>
      </>
  )
}

export default Interests