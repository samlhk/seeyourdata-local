import React, { useEffect, useState } from 'react';
import ReactWordCloud from 'react-wordcloud';

const InterestsWordCloud = ({ db }) => {
  
  const [topics, setTopics] = useState();

  useEffect(() => {
    render();
  }, [db])

  const render = async () => {
    if (db && db.topics) {
      setTopics(db.topics
        .map(({ topic, weight }) => topic.split(' ').map(text => ({ text, value: weight })))
        .reduce((allWords, words) => allWords.concat(words), []));
    } else {
      setTopics(null);
    }
  }

  return (
    topics ?
    <div className='interests-container'>
      <h4>Interests</h4>
      <ReactWordCloud 
        words={topics}
        options={{rotations: 1, rotationAngles: [0, 0]}} />
    </div>: <></>
  )
}

export default InterestsWordCloud