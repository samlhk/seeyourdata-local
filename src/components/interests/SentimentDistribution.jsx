import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Bar } from "react-chartjs-2";
import InfoCard from '../InfoCard';


const SentimentDistribution = ({ db, type, title, description, benefits, harms, sources, filterBar = true }) => {

  const [data, setData] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  
  const scale = [-5, -4.5, -4, -3.5, -3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  
  useEffect(() => {
    render();
  }, [db, selectedSource])

  const render = async () => {
    if (db && db[type]) {
      let selected = selectedSource;
      if (!selected) {
        selected = db[type].sort((a, b) => b.sentiments.length > a.sentiments.length)[0].source;
        setSelectedSource(selected);
      }
      const sentiments = db[type].find(({source}) => source === selected).sentiments.sort();
      const step = scale[1] - scale[0];
      setData([{
        label: 'count',
        data: scale.map(boundary => sentiments.filter(sentiment => sentiment > (boundary - step) && sentiment <= (boundary + step)).length)
      }]);
    } else {
      setData(null);
    }
  }

  return (
    data ?
    <div>
      <InfoCard title={title} description={description} benefits={benefits} harms={harms} sources={sources}/>

      {filterBar && <div className='filter-bar'>
        <div>Select source</div>
        <select id='source-filter' defaultValue={selectedSource}
          onChange={(e) => {setSelectedSource(e.target.value)}}>
          { db[type].sort((a, b) => a.source.toLowerCase().localeCompare(b.source.toLowerCase())).map(({source}) => <option value={source}>{source}</option>) }
        </select>
        <div></div>
      </div>}

      <Bar data={{ labels: scale, datasets: data }} />
    </div>: <></>
  )
}

export default SentimentDistribution