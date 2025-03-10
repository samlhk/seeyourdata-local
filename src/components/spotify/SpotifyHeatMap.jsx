import React, { useEffect, useState } from 'react';
import HeatMap from '@uiw/react-heat-map';
import Tooltip from '@uiw/react-tooltip';
import InfoCard from '../InfoCard';


const SpotifyHeatMap = ({ db, filterBar = true }) => {

  const [value, setValue] = useState(null);
  const [yearRange, setYearRange] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const medias = ['music', 'audiobook', 'podcast'];

  useEffect(() => {
    render();
  }, [db, selectedMedia])

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
      let earliestYear = 9999;
      let latestYear = 0;
      const record = {};
      db.spotify[selected].forEach(({timestamp, msPlayed}) => {
        const date = new Date(timestamp);
        if (date.getFullYear() < earliestYear) earliestYear = date.getFullYear();
        if (date.getFullYear() > latestYear) latestYear = date.getFullYear();
        // the date is augmented to allow a week to start with monday
        const recordDate = new Date(date.setDate(date.getDate() - 1)).toLocaleDateString('zh-Hans-CN');
        record[recordDate] = (record[recordDate] || 0) + msPlayed / 1000 / 60;
      })
      setValue(Object.keys(record).map(date => ({date, count: Math.round(record[date])})));
      const years = [];
      while (earliestYear <= latestYear) {
        years.push(earliestYear);
        earliestYear++;
      }
      setYearRange(years);
    } else {
      setValue(null);
      setYearRange(null);
      setSelectedMedia(null);      
    }
    
  }

  return (
    value && yearRange && selectedMedia ?
    <div className='heatmap-container'>
      <InfoCard
        title={`Spotify ${selectedMedia}: listening heat map`}
        description={`Your daily Spotfiy ${selectedMedia} listening activity, measured by listening duration`}
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

      {
        yearRange.map(year => 
        <div>
          <h5>{year}</h5>
          <HeatMap
            value={ value }
            width={ 900 }
            legendCellSize={ 0 }
            rectSize={ 13 }
            startDate={ new Date(`${parseInt(year)-1}/12/31`) }
            endDate={ new Date(`${year}/12/30`) }
            weekLabels={ ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
            monthLabels={ ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }
            
            rectRender={(props, data) => {
              return (
                <Tooltip placement="top" content={`${data.count || 0} minutes`}>
                  <rect {...props} />
                </Tooltip>
              );
            }}
          />
        </div>
      )}
    </div>: <></>
  )
}

export default SpotifyHeatMap