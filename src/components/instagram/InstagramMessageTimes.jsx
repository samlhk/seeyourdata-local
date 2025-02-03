import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Pie } from "react-chartjs-2";
import { colorScheme } from '../../App';
import InfoCard from '../InfoCard';


const InstagramMessageTimes = ({ db, filterBar = true }) => {

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
        selected = db.activity.filter(({app}) => app.includes('instagram: chats with') || app === 'instagram: chats and messages').sort((item1, item2) => item2.timestamps.length - item1.timestamps.length)[0].app.replace('instagram: chats with ', '').replace('instagram:', 'all');
        setSelectedApp(selected);
      }
      const sliceDuration = 3; // hours
      const timestamps = db.activity.find(({app}) => app.replace('instagram: chats with ', '').replace('instagram:', 'all') === selected).timestamps;
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
        title={`${selectedApp}: messaging hours`}
        description='Your Instagram messaging hour distribution for your selected account, the selection defaults to all chats and messages aggregated, note that the data only represents messages you sent'
        benefits='Instagram stores your message times for your record'
        sources={['Instagram activity: messages']}
      />

      {filterBar && <div className='filter-bar'>
        <div>Select chat</div>
        <select id='app-filter' defaultValue={selectedApp}
          onChange={(e) => {setSelectedApp(e.target.value)}}>
          { db.activity.filter(({app}) => app.includes('instagram: chats with') || app === 'instagram: chats and messages').map(activity => ({...activity, app: activity.app.replace('instagram: chats with ', '').replace('instagram:', 'all')})).sort((a, b) => a.app.toLowerCase().localeCompare(b.app.toLowerCase())).map(({app}) => <option value={app}>{app}</option>) }
        </select>
        <div></div>
      </div>}

      <Pie data={{ labels: timeRanges, datasets: activityCounts }}/>

    </div>: <></>
  )
}

export default InstagramMessageTimes