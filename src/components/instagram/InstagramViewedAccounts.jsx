import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Bar } from "react-chartjs-2";


const InstagramViewedAccounts = ({ db, filterBar = true }) => {

  const [accounts, setAccounts] = useState(null);
  const [comments, setComments] = useState(null);
  const [filteredMedia, setFilteredMedia] = useState(new Set());
  
  useEffect(() => {
    render();
  }, [db, filteredMedia])

  const render = async () => {
    if (db && db.instagramViewedAccounts) {
      const adsRecord = {};
      const postsRecord = {};
      const suggestedProfilesRecord = {};
      const videosRecord = {};
      if (db.instagramViewedAccounts.ads && (filteredMedia.size === 0 || filteredMedia.has('ads'))) {
        for (const account of db.instagramViewedAccounts.ads) {
          adsRecord[account] = (adsRecord[account] || 0) + 1;
        }
      }
      if (db.instagramViewedAccounts.posts && (filteredMedia.size === 0 || filteredMedia.has('posts'))) {
        for (const account of db.instagramViewedAccounts.posts) {
          postsRecord[account] = (postsRecord[account] || 0) + 1;
        }
      }
      if (db.instagramViewedAccounts.suggestedProfiles && (filteredMedia.size === 0 || filteredMedia.has('suggested profiles'))) {
        for (const account of db.instagramViewedAccounts.suggestedProfiles) {
          suggestedProfilesRecord[account] = (suggestedProfilesRecord[account] || 0) + 1;
        }
      }
      if (db.instagramViewedAccounts.videos && (filteredMedia.size === 0 || filteredMedia.has('videos'))) {
        for (const account of db.instagramViewedAccounts.videos) {
          videosRecord[account] = (videosRecord[account] || 0) + 1;
        }
      }
      const top = 10;
      let accounts = [...new Set(Object.keys(adsRecord)).union(new Set(Object.keys(postsRecord))).union(new Set(Object.keys(suggestedProfilesRecord))).union(new Set(Object.keys(videosRecord)))];
      accounts.sort((account1, account2) => 
        (adsRecord[account2] || 0) + (postsRecord[account2] || 0) + (suggestedProfilesRecord[account2] || 0) + (videosRecord[account2] || 0) 
        - (adsRecord[account1] || 0) - (postsRecord[account1] || 0) - (suggestedProfilesRecord[account1] || 0) - (videosRecord[account1] || 0));
      accounts = accounts.slice(0, top);
      setAccounts(accounts);
      setComments([
        {
          label: 'ads',
          backgroundColor: 'rgba(75, 192, 192, 1)',
          data: accounts.map(account => adsRecord[account] || 0)
        },
        {
          label: 'posts',
          backgroundColor: 'rgba(255, 205, 86, 1)',
          data: accounts.map(account => postsRecord[account] || 0)
        },
        {
          label: 'suggested profiles',
          backgroundColor: 'rgba(54, 162, 235, 1)',
          data: accounts.map(account => suggestedProfilesRecord[account] || 0)
        },
        {
          label: 'videos',
          backgroundColor: 'rgba(153, 102, 255, 1)',
          data: accounts.map(account => videosRecord[account] || 0)
        }
      ].filter(obj => (filteredMedia.size === 0 || filteredMedia.has(obj.label))))
    } else {
      setAccounts(null);
      setComments(null);
    }
  }

  return (
    accounts && comments ?
    <div>
      <h4>Views on accounts</h4>

      {filterBar && <div className='filter-bar'>
        <div>Filter by media</div>
        <select id='media-filter' defaultValue='all'
          onChange={(e) => {setFilteredMedia(filteredMedia.union(new Set([e.target.value])))}}>
          <option disabled={true} defaultValue={true} value='all'>All media</option>
          { db.instagramViewedAccounts.ads && <option value='ads'>ads</option> }
          { db.instagramViewedAccounts.posts && <option value='posts'>posts</option> }
          { db.instagramViewedAccounts.suggestedProfiles && <option value='suggested profiles'>suggested profiles</option> }
          { db.instagramViewedAccounts.videos && <option value='videos'>videos</option> }
        </select>
        <button disabled={filteredMedia.size === 0} onClick={() => {
          setFilteredMedia(new Set());
          document.getElementById('media-filter').value = 'all';
        }}>Clear Filter</button>
      </div>}

      <Bar data={{ labels: accounts, datasets: comments }} 
        options={{ indexAxis: 'y', scales: { x: { stacked: true }, y: { stacked: true } } } } />
    </div>: <></>
  )
}

export default InstagramViewedAccounts