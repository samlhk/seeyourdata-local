import React from 'react';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import LocationMap from './LocationMap';
import Summary from '../ai/Summary';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const Location = ( { db, isHome }) => {

  const navigate = useNavigate();

  return (
    isHome ?
      (db.location ?
        <div className='explore-more-container' onClick={ () => navigate('/location') }>
          <div className='explore-more-bar'>
            <button className='explore-more-indicator'>Explore More <FaLongArrowAltRight/></button>
          </div>
          <LocationMap db = { db } filterBar = { false }/>
        </div> : <></>) :
      <>
        <LocationMap db = { db }/>
        <Summary db = { db } category='Location'/>
      </>
  )
}

export default Location