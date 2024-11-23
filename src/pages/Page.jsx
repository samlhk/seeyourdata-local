import React, { useEffect, useState } from 'react'
import Activity from '../components/Activity';
import Location from '../components/Location';
import Interests from '../components/Interests';
import FilterBar from '../components/FilterBar';

const Page = ({ category }) => {

  const [db, setDB] = useState();
  const [filteredDB, setFilteredDB] = useState();

  useEffect(() => {
    fetchDB();
  }, []);

  const fetchDB = async () => {
    const db = await window.api.readDB();
    setDB(db);
    setFilteredDB(db);
  }

  return (
    <div>
      {category ==='activity' && <h1>Activity</h1> }
      <FilterBar db={ db } setFilteredDB = { setFilteredDB }/>
      <div className='home-container'>
        {category === 'activity' && <Activity db={ filteredDB }/> }
      </div>
    </div>
  )
}

export default Page