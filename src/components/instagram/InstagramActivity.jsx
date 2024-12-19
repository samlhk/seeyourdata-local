import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Line } from "react-chartjs-2";


const InstagramActivity = ({ db, filterBar = true }) => {

  const [timeRange, setTimeRange] = useState(null);
  const [monthlyActivities, setMonthlyActivities] = useState(null);
  const [filteredActivities, setFilteredActivities] = useState(new Set());

  const colors = [
    'rgba(255, 0, 0, 1)',
    'rgba(0, 128, 0, 1)',
    'rgba(255, 165, 0, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(128, 0, 128, 1)',
    'yellow',
    'pink'
  ]
  
  useEffect(() => {
    render();
  }, [db, filteredActivities])

  const render = async () => {
    if (db && db.activity) {
      let earliest = new Date();
      db.activity.sort((item1, item2) => item2.timestamps.length - item1.timestamps.length);
      let activities = db.activity;
      activities = activities.filter(({app}) => app.includes('instagram: '));
      if (filteredActivities.size > 0) activities = activities.filter(({app}) => filteredActivities.has(app.replace('instagram: ', '')));
      activities = activities.map(({app, timestamps}) => {
        const record = {};
        for (const timestamp of timestamps) {
          const date = new Date(timestamp);
          if (date < earliest) earliest = date;
          const monthYear = date.getFullYear() + ' ' + date.getMonth();
          if (record[monthYear]) {
            record[monthYear]++;
          } else {
            record[monthYear] = 1;
          }
        }
        return { app: app.replace('instagram: ', ''), record };
      })
      const months = [];
      activities = activities.map(({app, record}, index) => {
        const output = [];
        let current = new Date(earliest);
        while (current < Date.now()) {
          if (index === 0) months.push(current.toLocaleString('en-uk', { month: 'short', year: 'numeric' }));
          const item = record[current.getFullYear() + ' ' + current.getMonth()];
          output.push(item ? item : 0);
          if (current.getMonth() !== 11) {
            current = new Date(current.setMonth(current.getMonth() + 1));
          } else {
            current = new Date(current.setFullYear(current.getFullYear() + 1))
            current = new Date(current.setMonth(0));
          }
        }
        if (index === 0) setTimeRange(months);
        return { label: app, data: output, backgroundColor: colors[index], borderColor: colors[index] };
      })
      setMonthlyActivities(activities);
    } else {
      setMonthlyActivities(null);
      setTimeRange(null);
    }
    
  }

  return (
    monthlyActivities && timeRange ?
    <div>
      <h4>Instagram Activity</h4>

      {filterBar && <div className='filter-bar'>
        <div>View activities</div>
        <select id='activity-filter' defaultValue='all'
          onChange={(e) => {setFilteredActivities(filteredActivities.union(new Set([e.target.value])))}}>
          <option disabled={true} defaultValue={true} value='all'>All activities</option>
          { db.activity.filter(({app}) => app.includes('instagram: ')).map(activity => ({...activity, app: activity.app.replace('instagram: ', '')})).sort((a, b) => a.app.toLowerCase().localeCompare(b.app.toLowerCase())).map(({app}) => <option value={app}>{app}</option>) }
        </select>
        <button disabled={filteredActivities.size === 0} onClick={() => {
          setFilteredActivities(new Set());
          document.getElementById('activity-filter').value = 'all';
        }}>Clear Filter</button>
      </div>}

      <Line data={{ labels: timeRange, datasets: monthlyActivities }}/>
    </div>: <></>
  )
}

export default InstagramActivity