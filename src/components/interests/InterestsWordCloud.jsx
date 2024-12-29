import React, { useEffect, useState } from 'react';
import ReactWordCloud from 'react-wordcloud';

const InterestsWordCloud = ({ db, type, title }) => {
  
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
      <h4>{title}</h4>
      <ReactWordCloud 
        words={topics}
        options={{rotations: 1, rotationAngles: [0, 0]}} />
    </div>: <></>
  )
}

export default InterestsWordCloud