import React, { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Bar } from "react-chartjs-2";


const InstagramCommentedAccounts = ({ db, filterBar = true }) => {

  const [accounts, setAccounts] = useState(null);
  const [comments, setComments] = useState(null);
  const [filteredMedia, setFilteredMedia] = useState(new Set());
  
  useEffect(() => {
    render();
  }, [db, filteredMedia])

  const render = async () => {
    if (db && db.instagramCommentedAccounts) {
      const postsRecord = {};
      const reelsRecord = {};
      if (db.instagramCommentedAccounts.posts && (filteredMedia.size === 0 || filteredMedia.has('posts'))) {
        for (const account of db.instagramCommentedAccounts.posts) {
          postsRecord[account] = (postsRecord[account] || 0) + 1;
        }
      }
      if (db.instagramCommentedAccounts.reels && (filteredMedia.size === 0 || filteredMedia.has('reels'))) {
        for (const account of db.instagramCommentedAccounts.reels) {
          reelsRecord[account] = (reelsRecord[account] || 0) + 1;
        }
      }
      const top = 10;
      let accounts = [...new Set(Object.keys(postsRecord)).union(new Set(Object.keys(reelsRecord)))];
      accounts.sort((account1, account2) => (postsRecord[account2] || 0) + (reelsRecord[account2] || 0) - (postsRecord[account1] || 0) - (reelsRecord[account1] || 0));
      accounts = accounts.slice(0, top);
      setAccounts(accounts);
      setComments([
        {
          label: 'posts',
          backgroundColor: 'rgba(255, 99, 132, 1)',
          data: accounts.map(account => postsRecord[account] || 0)
        },
        {
          label: 'reels',
          backgroundColor: 'rgba(75, 192, 192, 1)',
          data: accounts.map(account => reelsRecord[account] || 0)
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
      <h4>Comments on accounts</h4>

      {filterBar && <div className='filter-bar'>
        <div>Filter by media</div>
        <select id='media-filter' defaultValue='all'
          onChange={(e) => {setFilteredMedia(filteredMedia.union(new Set([e.target.value])))}}>
          <option disabled={true} defaultValue={true} value='all'>All media</option>
          { db.instagramCommentedAccounts.posts && <option value='posts'>posts</option> }
          { db.instagramCommentedAccounts.reels && <option value='reels'>reels</option> }
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

export default InstagramCommentedAccounts