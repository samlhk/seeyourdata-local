import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLongArrowAltRight } from "react-icons/fa";
import { colorScheme } from '../../App';
import shuffleSeed from 'shuffle-seed';
import Summary from '../ai/Summary';
import LinkedinActivity from './LinkedinActivity';
import GoogleRanking from '../google/GoogleRanking';
import LinkedinConnections from './LinkedinConnections';
import LinkedinProfile from './LinkedinProfile';


const Linkedin = ({ db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ? 
      ((db.activity && db.activity.find(({app}) => app.includes('linkedin'))) ?
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
        <LinkedinProfile db = { db }/>
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