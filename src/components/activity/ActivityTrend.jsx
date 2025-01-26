import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Line } from "react-chartjs-2";


const ActivityTrend = ({ db, colors, filterBar = true }) => {

  const [timeRange, setTimeRange] = useState(null);
  const [monthlyActivities, setMonthlyActivities] = useState(null);
  const [filteredApps, setFilteredApps] = useState(new Set());
  
  useEffect(() => {
    render();
  }, [db, filteredApps])

  const render = async () => {
    if (db && db.activity) {
      const top = 7;
      let earliest = new Date();
      db.activity.sort((item1, item2) => item2.timestamps.length - item1.timestamps.length);
      let activities = db.activity;
      activities = activities.filter(({app}) => !app.includes('instagram: ') && !app.includes('google: '));
      if (filteredApps.size > 0) activities = activities.filter(({app}) => filteredApps.has(app));
      activities = activities.slice(0, top);
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
        return { app, record };
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
      <h4>Activity</h4>

      {filterBar && <div className='filter-bar'>
        <div>View apps</div>
        <select id='app-filter' defaultValue='all' disabled={filteredApps.size === 7}
          onChange={(e) => {setFilteredApps(filteredApps.union(new Set([e.target.value])))}}>
          <option disabled={true} defaultValue={true} value='all'>All apps</option>
          { db.activity.filter(({app}) => !app.includes('instagram: ') && !app.includes('google: ')).sort((a, b) => a.app.toLowerCase().localeCompare(b.app.toLowerCase())).map(({app}) => <option value={app}>{app}</option>) }
        </select>
        <button disabled={filteredApps.size === 0} onClick={() => {
          setFilteredApps(new Set());
          document.getElementById('app-filter').value = 'all';
        }}>Clear Filter</button>
      </div>}

      <Line data={{ labels: timeRange, datasets: monthlyActivities }}/>
    </div>: <></>
  )
}

export default ActivityTrend