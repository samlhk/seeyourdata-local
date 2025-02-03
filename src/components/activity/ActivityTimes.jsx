import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Pie } from "react-chartjs-2";
import { colorScheme } from '../../App';
import InfoCard from '../InfoCard';


const ActivityTimes = ({ db, filterBar = true }) => {

  const [timeRanges, setTimeRanges] = useState(null);
  const [activityCounts, setActivityCounts] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    render();
  }, [db, selectedApp]);

  const displayHour = (hour) => {
    return (hour % 12 || 12) + (hour < 12 ? "am" : "pm");
  }

  const render = async () => {
    if (db && db.activity) {
      let selected = selectedApp;
      if (!selected) {
        selected = db.activity.filter(({app}) => !app.includes('instagram: chats with')).sort((item1, item2) => item2.timestamps.length - item1.timestamps.length)[0].app;
        setSelectedApp(selected);
      }
      const sliceDuration = 3; // hours
      const timestamps = db.activity.find(({app}) => app === selected).timestamps;
      const record = Array(24 / sliceDuration).fill(0);
      for (const timestamp of timestamps) {
        const date = new Date(timestamp);
        const index = Math.floor(date.getHours() / sliceDuration);
        record[index] = record[index] + 1;
      }
      setActivityCounts([{
        label: 'count',
        data: record,
        backgroundColor: colorScheme[3]
      }]);
      setTimeRanges(record.map((_, index) => `${displayHour(index * sliceDuration)} - ${displayHour((index + 1) * sliceDuration)}`))
    } else {
      setTimeRanges(null);
      setActivityCounts(null);
      setSelectedApp(null);      
    }
    
  }

  return (
    timeRanges && activityCounts && selectedApp ?
    <div>
      <InfoCard
        title={`${selectedApp}: usage hours`}
        description='Your usage hour distribution for your selected app, the selection defaults to your most frequent activity'
        benefits='Platforms may collect this information to understand how you use them or for diagnostics, this data is generally stored in the form of time stamps of your access times'
        harms='Platforms may use this data to target advertisments at you at certain times'
        sources={[
          'Off Meta activities from Instagram: which include timestamps representing "a summary of activity that businesses and organisations share with Meta about your interactions with them, such as visiting their apps or websites", read more here at https://www.facebook.com/help/2207256696182627',
          'App activity through Google Play Store'
        ]}
      />

      {filterBar && <div className='filter-bar'>
        <div>Select app</div>
        <select id='app-filter' defaultValue={selectedApp}
          onChange={(e) => {setSelectedApp(e.target.value)}}>
          { db.activity.filter(({app}) => !app.includes('instagram: chats with')).sort((a, b) => a.app.toLowerCase().localeCompare(b.app.toLowerCase())).map(({app}) => <option value={app}>{app}</option>) }
        </select>
        <div></div>
      </div>}

      <Pie data={{ labels: timeRanges, datasets: activityCounts }}/>

    </div>: <></>
  )
}

export default ActivityTimes