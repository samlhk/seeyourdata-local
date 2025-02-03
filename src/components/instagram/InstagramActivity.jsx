import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Line } from "react-chartjs-2";
import InfoCard from '../InfoCard';


const InstagramActivity = ({ db, colors, filterBar = true }) => {

  const [timeRange, setTimeRange] = useState(null);
  const [monthlyActivities, setMonthlyActivities] = useState(null);
  const [filteredActivities, setFilteredActivities] = useState(new Set());
  
  useEffect(() => {
    render();
  }, [db, filteredActivities])

  const render = async () => {
    if (db && db.activity) {
      const top = 7;
      let earliest = new Date();
      db.activity.sort((item1, item2) => item2.timestamps.length - item1.timestamps.length);
      let activities = db.activity;
      activities = activities.filter(({app}) => app.includes('instagram: ') && !app.includes('instagram: chats with'));
      if (filteredActivities.size > 0) activities = activities.filter(({app}) => filteredActivities.has(app.replace('instagram: ', '')));
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
      <InfoCard 
        title='Instagram Activity'
        description='Your monthly activity for various Instagram activities, you may select up to 7 activities to compare them, the selection defaults to the top 7 activities you have done'
        benefits='Instagram stores your activity with timestamps attached, this can help you understand what you have done on the platform and when'
        sources={['Instagram activity']}
      />

      {filterBar && <div className='filter-bar'>
        <div>View activities</div>
        <select id='activity-filter' defaultValue='all' disabled={filteredActivities.size === 7}
          onChange={(e) => {setFilteredActivities(filteredActivities.union(new Set([e.target.value])))}}>
          <option disabled={true} defaultValue={true} value='all'>All activities</option>
          { db.activity.filter(({app}) => app.includes('instagram: ') && !app.includes('instagram: chats with')).map(activity => ({...activity, app: activity.app.replace('instagram: ', '')})).sort((a, b) => a.app.toLowerCase().localeCompare(b.app.toLowerCase())).map(({app}) => <option value={app}>{app}</option>) }
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