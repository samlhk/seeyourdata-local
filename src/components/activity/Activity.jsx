import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLongArrowAltRight } from "react-icons/fa";
import ActivityTrend from './ActivityTrend';


const Activity = ({ db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ? 
      (db.activity ?
        <div className='explore-more-container' onClick={ () => navigate('/activity') }>
          <div className='explore-more-bar'>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <ActivityTrend db = { db } filterBar = { false }/>
        </div>: <></>) :
      <>
        <ActivityTrend db = { db }/>
        <div>Activity visualisation 2</div>
      </>
  )
}

export default Activity