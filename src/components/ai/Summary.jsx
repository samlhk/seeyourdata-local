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
        content={
          <>
            <h5>How it works</h5>
              <div>
                When you press the "Generate summary" button, the local AI LLM chatbot generates a summary of your {category} data<br/>
                This may take some time depending on your device, you may find closing other programs makes the AI run faster<br/>
                It may fail to generate a summary, if you see this message, you can re-open the app and try again.<br/>
                It is important to note the content generated is AI generated and may not be accurate, care should be taken when processing the information generated
              </div>
          </>
        }
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