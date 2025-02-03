import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Bar } from "react-chartjs-2";
import InfoCard from '../InfoCard';


const InstagramAccounts = ({ db, category, medias, title, description, colors, filterBar = true }) => {

  const [accounts, setAccounts] = useState(null);
  const [categories, setCategories] = useState(null);
  const [filteredMedia, setFilteredMedia] = useState(new Set());
  
  useEffect(() => {
    render();
  }, [db, filteredMedia])

  const render = async () => {
    const instagramCategory = 'instagram' + category;
    if (db && db[instagramCategory]) {
      const recordList = [];
      medias.forEach(media => {
        recordList.push({});
        if (db[instagramCategory][media] && (filteredMedia.size === 0 || filteredMedia.has(media))) {
          for (const account of db[instagramCategory][media]) {
            recordList[recordList.length-1][account] = (recordList[recordList.length-1][account] || 0) + 1;
          }
        }
      })
      const top = 10;
      let accounts = recordList.reduce((accounts, record) => [...new Set(accounts).union(new Set(Object.keys(record)))], [])
      accounts.sort((account1, account2) => recordList.reduce((total, record) => (record[account2] || 0) + total, 0) - recordList.reduce((total, record) => (record[account1] || 0) + total, 0));
      accounts = accounts.slice(0, top);
      setAccounts(accounts);
      setCategories(recordList.map((record, index) => ({
        label: medias[index],
        backgroundColor: colors[index],
        data: accounts.map(account => record[account] || 0)
      })).filter(obj => (filteredMedia.size === 0 || filteredMedia.has(obj.label))));
    } else {
      setAccounts(null);
      setCategories(null);
    }
  }

  return (
    accounts && categories ?
    <div>
      <InfoCard
        title={title}
        description={`The top 10 ${description}, you can select different types of Instagram features you have interacted with and it will show you the top 10 accounts for those`}
        benefits='This information is inherently stored by Instagram as it is one of its core feature as a social media app, it can be used to recommend content that you enjoy'
        harms='Your interactions with various accounts may show your interests, potentially leading to targetted marketing'
        sources={['Instagram activity']}
      />

      {filterBar && <div className='filter-bar'>
        <div>Filter by media</div>
        <select id='media-filter' defaultValue='all'
          onChange={(e) => {setFilteredMedia(filteredMedia.union(new Set([e.target.value])))}}>
          <option disabled={true} defaultValue={true} value='all'>All media</option>
          { medias.map(media => <option value={media}>{media}</option>) }
        </select>
        <button disabled={filteredMedia.size === 0} onClick={() => {
          setFilteredMedia(new Set());
          document.getElementById('media-filter').value = 'all';
        }}>Clear Filter</button>
      </div>}

      <Bar data={{ labels: accounts, datasets: categories }} 
        options={{ indexAxis: 'y', scales: { x: { stacked: true }, y: { stacked: true } } } } />
    </div>: <></>
  )
}

export default InstagramAccounts