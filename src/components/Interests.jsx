import React, { useEffect, useState } from 'react';
import ReactWordCloud from 'react-wordcloud';

const Interests = ({ db, isHome }) => {
  
  const [topics, setTopics] = useState();

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
        <div className='interests-container'>
          <h4>Interests</h4>
          <ReactWordCloud 
            words={topics}
            options={{rotations: 3, rotationAngles: [-22.5, 22.5]}} />
        </div> : <></>) :

      (topics ?
        <>
          <div className='interests-container'>
            <h4>Interests</h4>
            <ReactWordCloud 
              words={topics}
              options={{rotations: 3, rotationAngles: [-22.5, 22.5]}} />
          </div>
          <div>Interests visualisation 2</div>
        </> :
        <></>)
  )
}

export default Interests