import React, { useEffect, useState } from 'react';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ReactWordCloud from 'react-wordcloud';

const Interests = ({ db, isHome }) => {
  
  const [topics, setTopics] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    renderInterests();
  }, [db])

  const renderInterests = async () => {
    if (db && db.topics) {
      setTopics(db.topics
        .map(({ topic, weight }) => topic.split(' ').map(text => ({ text, value: weight })))
        .reduce((allWords, words) => allWords.concat(words), []));
    } else {
      setTopics(null);
    }
  }

  return (
    isHome ?
      (topics ?
        <div className='explore-more-container interests-container' onClick={ () => navigate('/interests') }>
          <div className='explore-more-bar'>
            <h4>Interests</h4>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <ReactWordCloud 
            words={topics}
            options={{rotations: 1, rotationAngles: [0, 0]}} />
        </div> : <></>) :

      (topics ?
        <>
          <div className='interests-container'>
            <h4>Interests</h4>
            <ReactWordCloud 
              words={topics}
              options={{rotations: 1, rotationAngles: [0, 0]}} />
          </div>
          <div>Interests visualisation 2</div>
        </> :
        <></>)
  )
}

export default Interests