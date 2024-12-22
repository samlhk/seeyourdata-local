import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLongArrowAltRight } from "react-icons/fa";
import InstagramActivity from './InstagramActivity';
import InstagramAccounts from './InstagramAccounts';


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
        <InstagramAccounts db = { db } category='ViewedAccounts' medias={['ads', 'posts', 'suggested profiles', 'videos']} title='Views on accounts' colors={['rgba(75, 192, 192, 1)','rgba(255, 205, 86, 1)','rgba(54, 162, 235, 1)','rgba(153, 102, 255, 1)']}/>
        <InstagramAccounts db = { db } category='CommentedAccounts' medias={['posts', 'reels']} title='Comments on accounts' colors={['rgba(255, 99, 132, 1)','rgba(75, 192, 192, 1)']}/>
        <InstagramAccounts db = { db } category='LikedAccounts' medias={['posts', 'comments', 'stories']} title='Liked accounts' colors={['rgba(75, 192, 192, 1)','rgba(153, 102, 255, 1)','rgba(54, 162, 235, 1)']}/>
        <InstagramAccounts db = { db } category='StoryInteractedAccounts' medias={['emoji sliders', 'polls', 'questions', 'quizzes', 'countdowns']} title='Story interaction accounts' colors={['rgba(54, 162, 235, 1)','rgba(153, 102, 255, 1)','rgba(75, 192, 192, 1)','rgba(255, 99, 132, 1)','rgba(255, 205, 86, 1)']}/>
        <div>Instagram visualisation 2</div>
      </>
  )
}

export default Instagram