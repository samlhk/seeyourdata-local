import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const Dialogue = ({ db, isHome }) => {

  const [aiChats, setAiChats] = useState(['Hello, I am a chatbot that read through your data downloads, feel free to ask me anything about your data!']);
  const [humanChats, setHumanChats] = useState([]);
  const [prompt, setPrompt] = useState('');

  const askChatbot = async () => {
    if (prompt) {
      setPrompt('');
      setHumanChats([...humanChats, prompt]);
      setAiChats([...aiChats, 'generating...']);
      const reply = await window.api.ask(prompt);
      setAiChats([...aiChats, DOMPurify.sanitize(marked.parse(reply || 'Unable to generate answer.'))]);
    }
  }

  return (
    db && Object.keys(db).length > 0 ?
      <div className='dialogue-container'>
        <h4>Ask about your data</h4>
        {
          aiChats.map((chat, index) => 
            <>
              <div className={(chat === 'generating...' ? 'flashing' : '') + ' ai-chat chat-container'}
                dangerouslySetInnerHTML={{__html: chat}}></div>
              {humanChats.length > index &&
                <div className='human-chat chat-container'>{humanChats[index]}</div>
              }
            </>
          )
        }
        <div className='prompt-container'>
          <textarea name="prompt" rows="2" value={ prompt } onChange={(e) => { setPrompt(e.target.value) }}></textarea>
          <button className='mt-1' onClick={ askChatbot } disabled={ aiChats[aiChats.length - 1] === 'generating...' }>Send</button>
        </div>
      </div> : <></>
  )
}

export default Dialogue