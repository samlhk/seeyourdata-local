import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Line } from "react-chartjs-2";
import InfoCard from '../InfoCard';


const LinkedinConnections = ({ db }) => {

  const [timeRange, setTimeRange] = useState(null);
  const [monthlyActivities, setMonthlyActivities] = useState(null);
  const [monthlyConnections, setMonthlyConnections] = useState(null);
  
  useEffect(() => {
    render();
  }, [db])

  const render = async () => {
    if (db && db.connections) {
      let earliest = new Date();
      const record = {};
      db.connections.forEach(({name, timestamp}) => {
        const date = new Date(timestamp);
        if (date < earliest) earliest = date;
        const monthYear = date.getFullYear() + ' ' + date.getMonth();
        record[monthYear] = (record[monthYear] || []).concat([name])
      })
      const months = [];
      const monthlyConnections = [];
      const connections = [];
      let connectionsSoFar = 0;
      let current = new Date(earliest);
      while (current < Date.now()) {
        months.push(current.toLocaleString('en-uk', { month: 'short', year: 'numeric' }));
        const list = record[current.getFullYear() + ' ' + current.getMonth()] || [];
        monthlyConnections.push(list);
        connections.push(connectionsSoFar + list.length);
        connectionsSoFar = connectionsSoFar + list.length;
        if (current.getMonth() !== 11) {
          current = new Date(current.setMonth(current.getMonth() + 1));
        } else {
          current = new Date(current.setFullYear(current.getFullYear() + 1))
          current = new Date(current.setMonth(0));
        }
      }
      setMonthlyConnections(monthlyConnections);
      setTimeRange(months);
      setMonthlyActivities([{
        label: 'Total connections',
        data: connections,
        backgroundColor: '#0072b1',
        borderColor: '#0072b1'
      }]);
    } else {
      setMonthlyActivities(null);
      setTimeRange(null);
      setMonthlyConnections(null);
    }
  }

  const footer = (tooltipItems) => {
    const newConnections = monthlyConnections[tooltipItems[0].dataIndex].sort();
    return `New connections(${newConnections.length}): \n` + newConnections.join('\n');
  };

  return (
    monthlyActivities && timeRange && monthlyConnections ?
    <div>
      <InfoCard 
        title='LinkedIn connections'
        description='Your cumulative LinkedIn connections, hover over datapoints to see what connections you made each month, only includes your current connections'
        benefits='Storing how many connections and when you made those connections can help you record when you have professionally connected with someone'
        sources={['LinkedIn Connections.csv']}
      />

      <Line 
        data={{ labels: timeRange, datasets: monthlyActivities }} 
        options={{ plugins: { tooltip: { callbacks: { footer: footer }}}}}
      />
    </div>: <></>
  )
}

export default LinkedinConnections