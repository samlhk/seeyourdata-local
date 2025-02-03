import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Bar } from "react-chartjs-2";
import InfoCard from '../InfoCard';


const GoogleRanking = ({ db, category, title, description, benefits, harms, sources, filterBar = true }) => {

  const [allItems, setAllItems] = useState(null);
  const [items, setItems] = useState(null);
  const [counts, setCounts] = useState(null);
  const [filteredRangeStart, setFilteredRangeStart] = useState(0);

  const range = 10;
  
  useEffect(() => {
    render();
  }, [db, filteredRangeStart])

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
    if (db && db[category]) {
      const record = {};
      for (const item of db[category]) {
        record[item] = (record[item] || 0) + 1;
      }
      const allItems = Object.keys(record).sort((item1, item2) => record[item2] - record[item1]);
      setAllItems(allItems);
      const items = allItems.slice(filteredRangeStart, filteredRangeStart + range);
      setItems(items)
      setCounts([{
        label: 'count',
        data: items.map(item => record[item])
      }])
    } else {
      setAllItems(null);
      setItems(null);
      setCounts(null);
    }
  }

  return (
    allItems && items && counts ?
    <div>
      <InfoCard title={`${title} (top: ${displayRange(filteredRangeStart)})`} description={description} benefits={benefits} harms={harms} sources={sources}/>

      {filterBar && <div className='filter-bar'>
        <div>Filter range</div>
        <select id='range-filter' defaultValue='1-10'
          onChange={(e) => {setFilteredRangeStart(parseInt(e.target.value.split('-')[0])-1)}}>
          {generateRanges(allItems.length).map(range => <option value={range}>{range}</option>)}
        </select>
        <div></div>
      </div>}

      <Bar data={{ labels: items, datasets: counts }} options={{ indexAxis: 'y' }}/>
    </div>: <></>
  )
}

export default GoogleRanking