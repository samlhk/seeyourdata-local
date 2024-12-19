import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLongArrowAltRight } from "react-icons/fa";
import InstagramActivity from './InstagramActivity';
import InstagramCommentedAccounts from './InstagramCommentedAccounts';
import InstagramViewedAccounts from './InstagramViewedAccounts';


const Instagram = ({ db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ? 
      (db.instagramCommentedAccounts || db.instagramViewedAccounts ?
        <div className='explore-more-container' onClick={ () => navigate('/instagram') }>
          <div className='explore-more-bar'>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <InstagramActivity db = { db } filterBar = { false }/>
        </div>: <></>) :
      <>
        <InstagramActivity db = { db }/>
        <InstagramViewedAccounts db = { db }/>
        <InstagramCommentedAccounts db = { db }/>
        <div>Instagram visualisation 2</div>
      </>
  )
}

export default Instagram