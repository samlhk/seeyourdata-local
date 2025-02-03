import React, { useEffect, useState } from 'react';
import L from "leaflet";
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import InfoCard from '../InfoCard';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMap = ( { db, filterBar = true }) => {
  
  const [locations, setLocations] = useState();
  const [sources, setSources] = useState();
  const [filteredSources, setFilteredSources] = useState(new Set());

  useEffect(() => {
    render();
  }, [db, filteredSources])

  const LeafIcon = L.Icon.extend({
    options: {}
  });
  const icons = [
    new LeafIcon({ iconUrl: require('../../img/marker-icon-blue.png')}),
    new LeafIcon({ iconUrl: require('../../img/marker-icon-green.png')}),
    new LeafIcon({ iconUrl: require('../../img/marker-icon-red.png')}),
    new LeafIcon({ iconUrl: require('../../img/marker-icon-yellow.png')})
  ];

  const render = async () => {
    if (db && db.location) {
      setLocations(db.location.filter(({source}) => filteredSources.size === 0 || filteredSources.has(source)));
      let mapSources = [];
      db.location.forEach(({source}) => {if (!mapSources.includes(source)) mapSources.push(source)});
      setSources(mapSources);
    } else {
      setLocations(null);
    }
  }

  return (
    locations && sources ?
    <div>
      <InfoCard 
        title={`Locations ${filteredSources.size > 0 ? ` (from: ${[...filteredSources].join(', ')})` : ''}`}
        description='Location data from your data downloads, these may be locations you have searched for or have been in, generated from IP addresses and more'
        benefits='Platforms may keep track of your location for recommending and serving content that is more relevant to your location'
        harms='Location data may pose privacy risks when misused'
        sources={['Instagram logged in IP addresses', 'Google Maps search history']}
      />

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
          <Marker position={location.latlong.split(',')} icon={icons[sources.indexOf(location.source)]}>
            <Popup>{location.label}<br />{`source: ${location.source}`}</Popup>
          </Marker>)
        }
      </Map>
    </div>:<></>
  )
}

export default LocationMap