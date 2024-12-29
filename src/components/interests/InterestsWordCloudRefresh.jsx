import React, { useEffect, useState } from 'react';
import ReactWordCloud from 'react-wordcloud';
import _ from 'underscore';

const InterestsWordCloudRefresh = ({ db, type, title, filterBar = true }) => {
  
  const [topics, setTopics] = useState();

  useEffect(() => {
    render();
  }, [db])

  const render = async () => {
    if (db && db[type]) {
      setTopics(_.sample(db[type]
        .map(({ list }) => list.map(text => ({ text, value: Math.random() * 100 })))
        .reduce((allWords, words) => allWords.concat(words), []), 50));
    } else {
      setTopics(null);
    }
  }

  return (
    topics ?
    <div className='interests-container'>
      <h4>{title}</h4>

      {filterBar && <div className='filter-bar'>
        <div></div>
        <div></div>
        <button onClick={render}>Refresh</button>
      </div>}

      <ReactWordCloud 
        words={topics}
        options={{rotations: 1, rotationAngles: [0, 0], enableTooltip: false}} />
    </div>: <></>
  )
}

export default InterestsWordCloudRefresh