import React, { useEffect, useState } from 'react'
import InfoCard from '../InfoCard';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const Summary = ({ db, category }) => {

  const generatingPrompt = 'generating... (this may take a while, please do not click away)';

  const [summary, setSummary] = useState();

  useEffect(() => {
    fetchStoredSummary();
  }, [])

  const fetchStoredSummary = async () => {
    const chatHistory = await window.api.readChats();
    if (chatHistory.summaries && chatHistory.summaries[category]) setSummary(chatHistory.summaries[category]);
  }

  const render = async () => {
    setSummary(generatingPrompt);
    const reply = await window.api.summarise(category);
    const answer = DOMPurify.sanitize(marked.parse(reply || 'Unable to generate summary.'));
    setSummary(answer);

    const chatHistory = await window.api.readChats();
    if (!chatHistory.summaries) chatHistory.summaries = {};
    chatHistory.summaries[category] = answer;
    await window.api.writeChats(chatHistory);
  }

  return (
    db || summary ?
    <div>
      <InfoCard 
        title={`${category} summary`}
      />
      <div className='filter-bar'>
        <div></div>
        <button onClick={render} disabled={summary === generatingPrompt}>Generate summary</button>
        <div></div>
      </div>
      <div className={summary === generatingPrompt ? 'flashing' : ''} dangerouslySetInnerHTML={{__html: summary}}/>
    </div> : <></>
  )
}

export default Summary