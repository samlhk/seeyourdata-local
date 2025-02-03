import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLongArrowAltRight } from "react-icons/fa";
import InstagramActivity from './InstagramActivity';
import InstagramAccounts from './InstagramAccounts';
import InstagramMessageActivity from './InstagramMessageActivity';
import InstagramMessageHeatMap from './InstagramMessageHeatMap';
import { colorScheme } from '../../App';
import shuffleSeed from 'shuffle-seed';
import InstagramMessageTimes from './InstagramMessageTimes';
import Summary from '../ai/Summary';


const Instagram = ({ db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ? 
      ((db.activity && db.activity.find(({app}) => app.includes('instagram'))) || db.instagramCommentedAccounts || db.instagramViewedAccounts || db.instagramLikedAccounts || db.instagramStoryInteractedAccounts ?
        <div className='explore-more-container' onClick={ () => navigate('/instagram') }>
          <div className='explore-more-bar'>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <InstagramActivity db = { db } colors = { shuffleSeed.shuffle(colorScheme[1], 'k') } filterBar = { false }/>
        </div>: <></>) :
      <>
        <InstagramActivity db = { db } colors = { shuffleSeed.shuffle(colorScheme[1], 'k') }/>
        <Summary db = { db } category='Instagram usage'/>
        <InstagramAccounts db = { db } category='ViewedAccounts' medias={['ads', 'posts', 'suggested profiles', 'videos']} title='Views on accounts' description='Instagram accounts you have viewed' colors={ shuffleSeed.shuffle(colorScheme[0], 'l') }/>
        <InstagramAccounts db = { db } category='CommentedAccounts' medias={['posts', 'reels']} title='Comments on accounts' description='Instagram accounts you have commented on' colors={ shuffleSeed.shuffle(colorScheme[0], 't') }/>
        <InstagramAccounts db = { db } category='LikedAccounts' medias={['posts', 'comments', 'stories']} title='Liked accounts' description='Instagram accounts you have liked' colors={ shuffleSeed.shuffle(colorScheme[0], 'p') }/>
        <InstagramAccounts db = { db } category='StoryInteractedAccounts' medias={['emoji sliders', 'polls', 'questions', 'quizzes', 'countdowns']} title='Story interaction accounts' description='Instagram accounts which stories you have interacted with' colors={ shuffleSeed.shuffle(colorScheme[0], 'e') }/>
        <InstagramMessageActivity db = { db } colors = { shuffleSeed.shuffle(colorScheme[1], 'p') }/>
        <InstagramMessageHeatMap db = { db }/>
        <InstagramMessageTimes db = { db }/>
      </>
  )
}

export default Instagram