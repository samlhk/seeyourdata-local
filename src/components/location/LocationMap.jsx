import React, { useEffect, useState } from 'react';
import L from "leaflet";
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMap = ( { db, filterBar = true }) => {
  
  const [locations, setLocations] = useState();
  const [filteredSources, setFilteredSources] = useState(new Set());


  useEffect(() => {
    render();
  }, [db, filteredSources])

  const render = async () => {
    if (db && db.location) {
      setLocations(db.location.filter(({source}) => filteredSources.size === 0 || filteredSources.has(source)));
    } else {
      setLocations(null);
    }
  }

  return (
    locations ?
    <div>
      <h4>Locations{filteredSources.size > 0 && ` (from: ${[...filteredSources].join(', ')})`}</h4>

      {filterBar && <div className='filter-bar'>
        <div>Filter source</div>
        <select id='source-filter' defaultValue='all'
          onChange={(e) => {setFilteredSources(filteredSources.union(new Set([e.target.value])))}}>
          <option disabled={true} defaultValue={true} value='all'>All sources</option>
          { [...new Set(db.location.map(({source}) => source))].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).map(source => <option value={source}>{source}</option>) }
        </select>
        <button disabled={filteredSources.size === 0} onClick={() => {
          setFilteredSources(new Set());
          document.getElementById('source-filter').value = 'all';
        }}>Clear Filter</button>
      </div>}

      <Map center={locations[0].latlong.split(',')} zoom={1}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        />
        {
          locations.map(location => 
          <Marker position={location.latlong.split(',')}>
            <Popup>{location.label}<br />{`source: ${location.source}`}</Popup>
          </Marker>)
        }
        
      </Map>
    </div>:<></>
  )
}

export default LocationMap