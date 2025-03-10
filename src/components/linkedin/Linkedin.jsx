import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLongArrowAltRight } from "react-icons/fa";
import { colorScheme } from '../../App';
import shuffleSeed from 'shuffle-seed';
import Summary from '../ai/Summary';
import LinkedinActivity from './LinkedinActivity';
import GoogleRanking from '../google/GoogleRanking';
import LinkedinConnections from './LinkedinConnections';
import Profile from './Profile';


const Linkedin = ({ db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ? 
      ((db.activity && db.activity.find(({app}) => app.includes('linkedin'))) || db.connectedCompanies || db.connectedPositions || db.connections || db.linkedinProfile ?
        <div className='explore-more-container' onClick={ () => navigate('/linkedin') }>
          <div className='blocker'></div>
          <div className='explore-more-bar'>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <LinkedinConnections db = { db }/>
        </div>: <></>) :
      <>
        <LinkedinConnections db = { db }/>
        <Summary db = { db } category='LinkedIn usage'/>
        <Profile db = { db } category='linkedinProfile' basic={true} title='LinkedIn profile'
          description='Your profile according to LinkedIn for ad targetting purposes'
          benefits='This information can help LinkedIn deliver suitable recommendations for jobs or posts to you'
          harms='There may be privacy concerns with this data and incorrect inferences'
          sources={['LinkedIn Ad_Targeting.csv']}
        />
        <LinkedinActivity db = { db } colors = { shuffleSeed.shuffle(colorScheme[1], 'z') }/>
        <GoogleRanking db = { db } category='connectedCompanies' title='Top companies your connections work for'
          description='The top companies your connections work for'
          benefits='LinkedIn may keep track of this information to give you appropriate recommendations for new connections'
          harms='This data may be used for targetted marketing'
          sources={['LinkedIn: Connections.csv']}  
        />
        <GoogleRanking db = { db } category='connectedPositions' title="Your connections' roles"
          description='The roles your connections are currently working as, sorted from most common to least'
          benefits='LinkedIn may keep track of this information to give you appropriate recommendations for new connections or jobs'
          harms='This data may be used for targetted marketing'
          sources={['LinkedIn: Connections.csv']}  
        />
      </>
  )
}

export default Linkedin