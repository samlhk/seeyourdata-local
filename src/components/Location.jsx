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

const Location = () => {
  
  const [locations, setLocations] = useState();

  useEffect(() => {
    renderLocation();
  }, [])

  // TODO trigger this after upload
  const renderLocation = async () => {
    const json = await window.api.readDB();

    if (json && json.location) {
      setLocations(json.location);
    }    
  }

  return (
    locations ?
    <>
      <div>
        <Map center={locations[0].latlong.split(',')} zoom={1}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          {
            locations.map(location => 
            <Marker position={location.latlong.split(',')}>
              <Popup>{location.label}<br />{location.source}</Popup>
            </Marker>)
          }
          
        </Map>
      </div>
      <div>Location visualisation 2</div>
    </> :
    <></>
  )
}

export default Location