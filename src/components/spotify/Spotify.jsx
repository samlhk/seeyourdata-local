import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLongArrowAltRight } from "react-icons/fa";
import { colorScheme } from '../../App';
import shuffleSeed from 'shuffle-seed';
import Summary from '../ai/Summary';
import SpotifyStreaming from './SpotifyStreaming';
import SpotifyHeatMap from './SpotifyHeatMap';
import SpotifyTimes from './SpotifyTimes';
import SpotifyRanking from './SpotifyRanking';
import Profile from '../linkedin/Profile';


const Spotify = ({ db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ? 
      (db.spotify || db.spotifyProfile ?
        <div className='explore-more-container' onClick={ () => navigate('/spotify') }>
          <div className='blocker'></div>
          <div className='explore-more-bar'>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <SpotifyStreaming db = { db } colors = { colorScheme[4] } filterBar = { false }/>
        </div>: <></>) :
      <>
        <SpotifyStreaming db = { db } colors = { colorScheme[4] }/>
        <Summary db = { db } category='Spotify usage'/>
        <SpotifyRanking db = { db } category='name' display='songs'/>
        <SpotifyRanking db = { db } category='artist' display='artists'/>
        <Profile db = { db } category='spotifyProfile' basic={false} title='Spotify inferences'
          description='From Spotify: "We draw certain inferences about your interests and preferences based on your usage of the Spotify service and using data obtained from our advertisers and other advertising partners. This includes a list of market segments with which you are currently associated. Depending on your settings, this data may be used to serve interest-based advertising to you within the Spotify service."'
          benefits='This information can help Spotify deliver suitable content recommendations to you'
          harms='There may be privacy concerns with this data and incorrect inferences'
          sources={['Spotify inferences']}
        />
        <SpotifyHeatMap db = { db }/>
        <SpotifyTimes db = { db }/>
      </>
  )
}

export default Spotify