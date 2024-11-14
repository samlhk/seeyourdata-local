import React, { useEffect, useState } from 'react';
import ReactWordCloud from 'react-wordcloud';

const Interests = () => {
  
  const [topics, setTopics] = useState();

  useEffect(() => {
    renderInterests();
  }, [])

  // TODO trigger this after upload
  const renderInterests = async () => {
    const json = await window.api.readDB();

    if (json && json.topics) {
      setTopics(json.topics
        .map(({ topic, weight }) => topic.split(' ').map(text => ({ text, value: weight })))
        .reduce((allWords, words) => allWords.concat(words), []));
    }    
  }

  return (
    topics ?
    <>
      <div>
        <ReactWordCloud 
          words={topics}
          options={{rotations: 3, rotationAngles: [-22.5, 22.5]}} />
      </div>
      <div>Interests visualisation 2</div>
    </> :
    <></>
  )
}

export default Interests