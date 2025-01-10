import React from 'react';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PiInformation from './PiInformation';

const Pi = ({ db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ?
      (db.piPhone || db.piLocation || db.piIp || db.piDevice ?
        <div className='explore-more-container' onClick={ () => navigate('/pi') }>
          <div className='explore-more-bar'>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <PiInformation db = { db }/>
        </div> : <></>) :
      <>
        <PiInformation db = { db }/>
      </>
  )
}

export default Pi