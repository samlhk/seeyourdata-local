import { filter } from 'jszip';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FilterBar = ({ db, setFilteredDB }) => {

  const [appFilter, setAppFilter] = useState(new Set());

  const navigate = useNavigate();

  useEffect(() => {
    updateDB();
  }, [appFilter])

  const updateDB = () => {
    const json = {...db};

    if (json.activity) {
      json.activity = json.activity.filter(activity => appFilter.size === 0 || appFilter.has(activity.app))
    }

    setFilteredDB({...json});
  }

  return (
    <nav>
        <button onClick={() => navigate('/')}>Home</button>

        <div>{appFilter}</div>

        <select name='app' onChange={(e) => {
            const filter = e.target.value;
            if (filter === 'all') setAppFilter(new Set());
            else setAppFilter(appFilter.union(new Set([e.target.value])))
          }}>
          <option value='all'>All Apps</option>
          {
            db?.activity?.map(({app}) => <option value={app}>{app}</option>)
          }
        </select>

    </nav>
  )
}

export default FilterBar