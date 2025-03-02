import React, { useEffect, useState } from 'react';
import ReactWordCloud from 'react-wordcloud';
import _ from 'underscore';
import InfoCard from '../InfoCard';

const LinkedinProfile = ({ db }) => {
  
  const [profile, setProfile] = useState();
  const [selectedField, setSelectedField] = useState(null);

  useEffect(() => {
    render();
  }, [db])

  const render = async () => {
    if (db && db.linkedinProfile) {
      setProfile(db.linkedinProfile);
    } else {
      setProfile(null);
    }
  }

  return (
    profile ?
    <div className='linkedin-container'>
      <InfoCard 
        title='LinkedIn profile'
        description='Your profile according to LinkedIn for ad targetting purposes'
        benefits='This information can help LinkedIn deliver suitable recommendations for jobs or posts to you'
        harms='There may be privacy concerns with this data and incorrect inferences'
        sources={['LinkedIn Ad_Targeting.csv']}
      />
      
      <div className='profile-container'>
        <div className='buttons-container'>
          { profile.sort((item1, item2) => item1.field.localeCompare(item2.field)).map(({field}) => <button onClick={() => {setSelectedField(field)}}>{field}</button>) }
        </div>
        {
          profile.find(({field}) => field === selectedField) ? 
          <ReactWordCloud 
          words={profile.find(({field}) => field === selectedField).values.map(text => ({ text, value: 100 }))}
          options={{rotations: 1, rotationAngles: [0, 0], enableTooltip: false}} />
          : <div></div>
        }
      </div>
      
      
      
      
    </div>: <></>
  )
}

export default LinkedinProfile