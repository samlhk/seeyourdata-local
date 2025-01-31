import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLongArrowAltRight } from "react-icons/fa";
import ActivityTrend from './ActivityTrend';
import ActivityHeatMap from './ActivityHeatMap';
import { colorScheme } from '../../App';
import shuffleSeed from 'shuffle-seed';
import ActivityTimes from './ActivityTimes';
import Summary from '../ai/Summary';


const Activity = ({ db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ? 
      (db.activity ?
        <div className='explore-more-container' onClick={ () => navigate('/activity') }>
          <div className='explore-more-bar'>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <ActivityTrend db = { db } colors = { shuffleSeed.shuffle(colorScheme[0], 'a') } filterBar = { false }/>
        </div>: <></>) :
      <>
        <ActivityTrend db = { db } colors = { shuffleSeed.shuffle(colorScheme[0], 'a') }/>
        <Summary db = { db } category='Activity'/>
        <ActivityHeatMap db = { db }/>
        <ActivityTimes db = { db }/>
      </>
  )
}

export default Activity