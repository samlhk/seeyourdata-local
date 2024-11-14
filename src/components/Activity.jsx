import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Line } from "react-chartjs-2";

const Activity = () => {

  const [timeRange, setTimeRange] = useState();
  const [monthlyActivities, setMonthlyActivities] = useState();
  

  useEffect(() => {
    renderActivity();
  }, [])

  // TODO trigger this after upload
  const renderActivity = async () => {
    const json = await window.api.readDB();

    if (json && json.activity) {
      const top = 5;
      let earliest = new Date();
      json.activity.sort((item1, item2) => item2.timestamps.length - item1.timestamps.length);
      let activities = json.activity.slice(0, top);
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
        return { label: app, data: output};
      })
      setMonthlyActivities(activities);
    }
    
  }

  return (
    monthlyActivities && timeRange ?
    <>
      <div>
        <Line data={{ labels: timeRange, datasets: monthlyActivities }}/>
      </div>
      <div>Activity visualisation 2</div>
    </> :
    <></>
  )
}

export default Activity