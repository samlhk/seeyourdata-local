import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Line } from "react-chartjs-2";
import { useNavigate } from 'react-router-dom';
import { FaLongArrowAltRight } from "react-icons/fa";


const Activity = ({ db, isHome }) => {

  const [timeRange, setTimeRange] = useState();
  const [monthlyActivities, setMonthlyActivities] = useState();

  const navigate = useNavigate();

  const colors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(255, 205, 86, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(153, 102, 255, 0.7)',
  ]
  

  useEffect(() => {
    renderActivity();
  }, [db])

  const renderActivity = async () => {
    if (db && db.activity) {
      const top = 5;
      let earliest = new Date();
      db.activity.sort((item1, item2) => item2.timestamps.length - item1.timestamps.length);
      let activities = db.activity.slice(0, top);
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
    isHome ? 
      (monthlyActivities && timeRange ?
        <div className='explore-more-container' onClick={ () => navigate('/activity') }>
          <div className='explore-more-bar'>
            <h4>Activity</h4>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <Line data={{ labels: timeRange, datasets: monthlyActivities }}/>
        </div> : <></>) :

      (monthlyActivities && timeRange ?
        <>
          <div>
            <h4>Activity</h4>
            <Line data={{ labels: timeRange, datasets: monthlyActivities }}/>
          </div>
          <div>Activity visualisation 2</div>
        </> :
      <></>
      )
  )
}

export default Activity