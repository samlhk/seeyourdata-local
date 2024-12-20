import React, { useEffect, useState } from 'react'
import Activity from '../components/activity/Activity';
import Location from '../components/location/Location';
import Interests from '../components/interests/Interests';
import { useNavigate } from 'react-router-dom';
import Instagram from '../components/instagram/Instagram';
import Pi from '../components/pi/Pi';

const Page = ({ category }) => {

  const [db, setDB] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    fetchDB();
  }, []);

  const fetchDB = async () => {
    const db = await window.api.readDB();
    setDB(db);
  }

  return (
    <div>
      {category ==='activity' && <h1>Activity</h1> }
      {category ==='location' && <h1>Location</h1> }
      {category ==='interests' && <h1>Interests</h1> }
      {category ==='pi' && <h1>Personal Information</h1> }
      {category ==='instagram' && <h1>Instagram</h1> }
      <nav>
        <button onClick={() => navigate('/')}>Home</button>
      </nav>
      <div className='home-container'>
        {category === 'activity' && <Activity db={ db }/> }
        {category === 'location' && <Location db={ db }/> }
        {category === 'interests' && <Interests db={ db }/> }
        {category === 'pi' && <Pi db={ db }/> }
        {category === 'instagram' && <Instagram db={ db }/> }
      </div>
    </div>
  )
}

export default Page