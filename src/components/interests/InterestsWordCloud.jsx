import React, { useEffect, useState } from 'react';
import ReactWordCloud from 'react-wordcloud';
import InfoCard from '../InfoCard';

const InterestsWordCloud = ({ db, type, title, description, benefits, harms, sources }) => {
  
  const [topics, setTopics] = useState();

  useEffect(() => {
    render();
  }, [db])

  const render = async () => {
    if (db && db[type]) {
      setTopics(db[type]
        .map(({ topic, weight }) => topic.split(' ').map(text => ({ text, value: weight })))
        .reduce((allWords, words) => allWords.concat(words), []));
    } else {
      setTopics(null);
    }
  }

  return (
    topics ?
    <div className='interests-container'>
      <InfoCard title={title} description={description} benefits={benefits} harms={harms} sources={sources}/>
      <ReactWordCloud 
        words={topics}
        options={{rotations: 1, rotationAngles: [0, 0]}} />
    </div>: <></>
  )
}

export default InterestsWordCloud