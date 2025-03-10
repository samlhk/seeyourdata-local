import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Bar } from "react-chartjs-2";
import InfoCard from '../InfoCard';
import { colorScheme } from '../../App';


const SpotifyRanking = ({ db, category, display, filterBar = true }) => {

  const [allItems, setAllItems] = useState(null);
  const [items, setItems] = useState(null);
  const [counts, setCounts] = useState(null);
  const [filteredRangeStart, setFilteredRangeStart] = useState(0);
  const [scale, setScale] = useState('Hours');

  const range = 10;
  
  useEffect(() => {
    render();
  }, [db, filteredRangeStart, scale])

  const displayRange = (start, end) => {
    return `${start + 1}-${end || (start + range)}`;
  }

  const generateRanges = (length) => {
    const ranges = [];
    let start = 0;
    while (start + range <= length) {
      ranges.push(displayRange(start));
      start = start + range;
    }
    if (start < length) ranges.push(displayRange(start, length))
    return ranges;
  }

  const render = async () => {
    if (db && db.spotify && db.spotify.music) {
      const record = {};
      for (const item of db.spotify.music) {
        record[item[category]] = (record[item[category]] || 0) + (scale === 'Hours' ? item.msPlayed / 1000 / 60 / 60 : 1);
      }
      const allItems = Object.keys(record).sort((item1, item2) => record[item2] - record[item1]);
      setAllItems(allItems);
      const items = allItems.slice(filteredRangeStart, filteredRangeStart + range);
      setItems(items)
      setCounts([{
        label: scale,
        data: items.map(item => Math.round(record[item] * 100) / 100),
        backgroundColor: colorScheme[4][0],
        borderColor: colorScheme[4][0]
      }])
    } else {
      setAllItems(null);
      setItems(null);
      setCounts(null);
    }
  }

  const label = (tooltip) => {
    const number = tooltip.raw;
    return scale === 'Hours' ? `${Math.floor(number)} hours ${Math.round(number % 1 * 60)} minutes` : number;
  };

  return (
    allItems && items && counts ?
    <div>
      <InfoCard 
        title={`Your Spotify top ${display} (top: ${displayRange(filteredRangeStart)})`} 
        description={`The Spotify ${display} you listen to the most, ranked from most to least, you can toggle ranking them by hours listened or number of listens`}
        benefits={`Spotify may use this to recommend you ${display} you would like`}
        sources={['Spotify streaming history']}
      />

      {filterBar && <div className='filter-bar'>
        <select id='scale-filter' defaultValue='Hours' onChange={(e) => {setScale(e.target.value)}}>
          <option defaultValue={true} value='Hours'>Hours</option>
          <option value='Number of listens'>Number of listens</option>
        </select>
        <select id='range-filter' defaultValue='1-10'
          onChange={(e) => {setFilteredRangeStart(parseInt(e.target.value.split('-')[0])-1)}}>
          {generateRanges(allItems.length).map(range => <option value={range}>{range}</option>)}
        </select>
        <div></div>
      </div>}

      <Bar data={{ labels: items, datasets: counts }} 
        options={{ indexAxis: 'y', scales: { x: { title: { display: true, text: scale } } }, plugins: { tooltip: { callbacks: { label: label }}} }}/>
    </div>: <></>
  )
}

export default SpotifyRanking