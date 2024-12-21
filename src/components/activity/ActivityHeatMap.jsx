import React, { useEffect, useState } from 'react';
import HeatMap from '@uiw/react-heat-map';
import Tooltip from '@uiw/react-tooltip';


const ActivityHeatMap = ({ db, filterBar = true }) => {

  const [value, setValue] = useState(null);
  const [yearRange, setYearRange] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    render();
  }, [db, selectedApp])

  const render = async () => {
    if (db && db.activity) {
      let selected = selectedApp;
      if (!selected) {
        selected = db.activity.sort((item1, item2) => item2.timestamps.length - item1.timestamps.length)[0].app;
        setSelectedApp(selected);
      }
      let earliestYear = 9999;
      let latestYear = 0;
      const timestamps = db.activity.find(({app}) => app === selected).timestamps;
      const record = {};
      for (const timestamp of timestamps) {
        const date = new Date(timestamp);
        if (date.getFullYear() < earliestYear) earliestYear = date.getFullYear();
        if (date.getFullYear() > latestYear) latestYear = date.getFullYear();
        // the date is augmented to allow a week to start with monday
        const recordDate = new Date(date.setDate(date.getDate() - 1)).toLocaleDateString('zh-Hans-CN');
        record[recordDate] = (record[recordDate] || 0) + 1;
      }
      setValue(Object.keys(record).map(date => ({date, count: record[date]})));
      const years = [];
      while (earliestYear <= latestYear) {
        years.push(earliestYear);
        earliestYear++;
      }
      setYearRange(years);
    } else {
      setValue(null);
      setYearRange(null);
      setSelectedApp(null);      
    }
    
  }

  return (
    value && yearRange && selectedApp ?
    <div className='heatmap-container'>
      <h4><strong>{selectedApp}</strong>: usage heat map</h4>

      {filterBar && <div className='filter-bar'>
        <div>Select app</div>
        <select id='app-filter' defaultValue={selectedApp}
          onChange={(e) => {setSelectedApp(e.target.value)}}>
          { db.activity.sort((a, b) => a.app.toLowerCase().localeCompare(b.app.toLowerCase())).map(({app}) => <option value={app}>{app}</option>) }
        </select>
        <div></div>
      </div>}

      {
        yearRange.map(year => 
        <div>
          <h5>{year}</h5>
          <HeatMap
            value={ value }
            // TODO make responsive
            width={ 900 }
            legendCellSize={ 0 }
            rectSize={ 13 }
            startDate={ new Date(`${parseInt(year)-1}/12/31`) }
            endDate={ new Date(`${year}/12/30`) }
            weekLabels={ ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
            monthLabels={ ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }
            
            rectRender={(props, data) => {
              return (
                <Tooltip placement="top" content={`usage: ${data.count || 0}`}>
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

export default ActivityHeatMap