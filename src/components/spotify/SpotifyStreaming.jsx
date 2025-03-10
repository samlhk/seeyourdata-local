import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Bar, Line } from "react-chartjs-2";
import InfoCard from '../InfoCard';


const SpotifyStreaming = ({ db, colors, filterBar = true }) => {

  const [timeRange, setTimeRange] = useState(null);
  const [monthlyHours, setMonthlyHours] = useState(null);
  const [scale, setScale] = useState('Hours');
  const [selectedMedia, setSelectedMedia] = useState(null);

  const medias = ['music', 'audiobook', 'podcast'];
  
  useEffect(() => {
    render();
  }, [db, scale, selectedMedia])

  const render = async () => {
    if (db && db.spotify) {
      let earliest = new Date();
      const recordList = [];
      medias.forEach(media => {
        const data = db.spotify[media];
        if (data && (!selectedMedia || selectedMedia === media)) {
          const record = {};
          data.forEach(({timestamp, msPlayed}) => {
            const date = new Date(timestamp);
            if (date < earliest) earliest = date;
            const monthYear = date.getFullYear() + ' ' + date.getMonth();
            const played = scale === 'Hours' ? msPlayed / 1000 / 60 / 60 : scale === 'Minutes' ? msPlayed / 1000 / 60 : 1;
            record[monthYear] = (record[monthYear] || 0) + played;
          });
          recordList.push({ media, record });
        }
      })
      const months = [];
      const hours = recordList.map(({media, record}, index) => {
        const output = [];
        let current = new Date(earliest);
        while (current < Date.now()) {
          if (index === 0) months.push(current.toLocaleString('en-uk', { month: 'short', year: 'numeric' }));
          const item = record[current.getFullYear() + ' ' + current.getMonth()];
          output.push(item ? Math.round(item) : 0);
          if (current.getMonth() !== 11) {
            current = new Date(current.setMonth(current.getMonth() + 1));
          } else {
            current = new Date(current.setFullYear(current.getFullYear() + 1))
            current = new Date(current.setMonth(0));
          }
        }
        if (index === 0) setTimeRange(months);
        return { label: media, data: output, backgroundColor: colors[index], borderColor: colors[index] };
      })
      if (selectedMedia) {
        const top = 5;
        const data = db.spotify[selectedMedia];
        const record = {};
        data.forEach(({timestamp, name, artist, msPlayed}) => {
          const date = new Date(timestamp);
          const key = artist || name;
          if (!record[key]) record[key] = new Array(months.length).fill(0);
          record[key][months.indexOf(date.toLocaleString('en-uk', { month: 'short', year: 'numeric' }))] += scale === 'Hours' ? msPlayed / 1000 / 60 / 60 : scale === 'Minutes' ? msPlayed / 1000 / 60 : 1;
        });
        const sortedKeys = Object.keys(record).sort((key1, key2) => record[key2].reduce((a, b) => a + b, 0) - record[key1].reduce((a, b) => a + b, 0));
        const hours = [];
        for (let i = 0; i < top; i++) {
          hours.push({ label: sortedKeys[i], data: record[sortedKeys[i]].map(num => Math.round(num)), backgroundColor: colors[i], borderColor: colors[i] })
        }
        hours.push({ 
          label: 'other', 
          data: sortedKeys.slice(top).reduce((prev, cur) => prev.map((element, id) => element + record[cur][id]), new Array(months.length).fill(0)).map(num => Math.round(num)), 
          backgroundColor: colors[top], 
          borderColor: colors[top] 
        })
        setMonthlyHours(hours);
        
      } else {
        setMonthlyHours(hours);
      }
    } else {
      setMonthlyHours(null);
      setTimeRange(null);
    }
    
  }

  return (
    monthlyHours && timeRange ?
    <div>
      <InfoCard 
        title={selectedMedia ? `Breakdown of Spotify ${selectedMedia} (toggle "other" to zoom in on your top listens)` : 'Spotify listens'}
        description='Your monthly Spotify listens for music, audiobooks and podcasts in the past year, you may select one of them to see its individual breakdown with your top 5 artists, books or podcasts. You can also select whether to display them by hours, minutes or number of listens'
        benefits='Spotify collects this information to better understand your music, audiobook and podcast tastes for content recommendation'
        harms='This information may be used for targetted ads'
        sources={['Spotify streaming history']}
      />

      {filterBar && <div className='filter-bar'>
        <select id='scale-filter' defaultValue='Hours' onChange={(e) => {setScale(e.target.value)}}>
          <option defaultValue={true} value='Hours'>Hours</option>
          <option value='Minutes'>Minutes</option>
          <option value='Number of listens'>Number of listens</option>
        </select>
        
        <select id='media-filter' defaultValue='all'
          onChange={(e) => {setSelectedMedia(e.target.value)}}>
          <option disabled={true} defaultValue={true} value='all'>Select a type of content for a breakdown</option>
          { medias.filter(media => db.spotify[media]).map(media => <option value={media}>{media}</option>) }
        </select>
        <button disabled={!selectedMedia} onClick={() => {
          setSelectedMedia(null);
          document.getElementById('media-filter').value = 'all';
        }}>Back to overview</button>
      </div>}

      <Bar data={{ labels: timeRange, datasets: monthlyHours }} 
        options={{ indexAxis: 'x', scales: { x: { stacked: true }, y: { stacked: true, title: { display: true, text: scale } } } } } />
    </div>: <></>
  )
}

export default SpotifyStreaming