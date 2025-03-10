import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Pie } from "react-chartjs-2";
import { colorScheme } from '../../App';
import InfoCard from '../InfoCard';


const SpotifyTimes = ({ db, filterBar = true }) => {

  const [timeRanges, setTimeRanges] = useState(null);
  const [activityCounts, setActivityCounts] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const medias = ['music', 'audiobook', 'podcast'];

  useEffect(() => {
    render();
  }, [db, selectedMedia]);

  const displayHour = (hour) => {
    return (hour % 12 || 12) + (hour < 12 ? "am" : "pm");
  }

  const render = async () => {
    if (db && db.spotify) {
      let selected = selectedMedia;
      if (!selected) {
        for (const media of medias) {
          if (db.spotify[media]) {
            selected = media;
            setSelectedMedia(selected);
            break;
          }
        }
      }
      const sliceDuration = 3; // hours
      const timestamps = db.spotify[selected].map(({timestamp}) => timestamp);
      const record = Array(24 / sliceDuration).fill(0);
      for (const timestamp of timestamps) {
        const date = new Date(timestamp);
        const index = Math.floor(date.getHours() / sliceDuration);
        record[index] = record[index] + 1;
      }
      setActivityCounts([{
        label: 'number of listens',
        data: record,
        backgroundColor: colorScheme[3]
      }]);
      setTimeRanges(record.map((_, index) => `${displayHour(index * sliceDuration)} - ${displayHour((index + 1) * sliceDuration)}`))
    } else {
      setTimeRanges(null);
      setActivityCounts(null);
      setSelectedMedia(null);      
    }
    
  }

  return (
    timeRanges && activityCounts && selectedMedia ?
    <div>
      <InfoCard
        title={`Spotify ${selectedMedia}: listening hours`}
        description={`Your Spotfiy ${selectedMedia} listening hour distrubution, measured by number of listens`}
        sources={['Spotify streaming history']}
      />

      {filterBar && <div className='filter-bar'>
        <div>Select type of content</div>
        <select id='media-filter' defaultValue={selectedMedia}
          onChange={(e) => {setSelectedMedia(e.target.value)}}>
          { medias.filter(media => db.spotify[media]).map(media => <option value={media}>{media}</option>) }
        </select>
        <div></div>
      </div>}

      <Pie data={{ labels: timeRanges, datasets: activityCounts }}/>

    </div>: <></>
  )
}

export default SpotifyTimes