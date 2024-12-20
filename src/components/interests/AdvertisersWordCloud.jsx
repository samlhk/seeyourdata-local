import React, { useEffect, useState } from 'react';
import ReactWordCloud from 'react-wordcloud';
import _ from 'underscore';

const AdvertisersWordCloud = ({ db, filterBar = true }) => {
  
  const [advertisers, setAdvertisers] = useState();

  useEffect(() => {
    render();
  }, [db])

  const render = async () => {
    if (db && db.advertisers) {
      setAdvertisers(_.sample(db.advertisers
        .map(({ advertisers }) => advertisers.map(text => ({ text, value: Math.random() * 100 })))
        .reduce((allWords, words) => allWords.concat(words), []), 50));
    } else {
      setAdvertisers(null);
    }
  }

  return (
    advertisers ?
    <div className='interests-container'>
      <h4>Your advertisers</h4>

      {filterBar && <div className='filter-bar'>
        <div></div>
        <div></div>
        <button onClick={render}>Refresh</button>
      </div>}

      <ReactWordCloud 
        words={advertisers}
        options={{rotations: 1, rotationAngles: [0, 0], enableTooltip: false}} />
    </div>: <></>
  )
}

export default AdvertisersWordCloud