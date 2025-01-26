import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const Dialogue = ({ db, isHome }) => {

  const defaultAiPrompt = 'Hello, I am a chatbot that read through your data downloads, feel free to ask me anything about your data!';
  const generatingPrompt = 'generating... (this may take a while, please do not click away)';

  const [aiChats, setAiChats] = useState([defaultAiPrompt]);
  const [humanChats, setHumanChats] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [chatId, setChatId] = useState(null); // chatId is null when there is a fresh chat
  const [allChats, setAllChats] = useState([]);

  useEffect(() => {
    initialUpdateChats();
  }, []);

  const askChatbot = async () => {
    if (prompt) {
      setPrompt('');
      setHumanChats([...humanChats, prompt]);
      setAiChats([...aiChats, generatingPrompt]);
      const reply = await window.api.ask(prompt);
      const answer = DOMPurify.sanitize(marked.parse(reply || 'Unable to generate answer.'));
      setAiChats([...aiChats, answer]);

      const chatRecord = [[...aiChats, answer], [...humanChats, prompt]];
      const db = await window.api.readDB();
      if (chatId === null) db.chats = (db.chats || []).concat([chatRecord]);
      else db.chats[chatId] = chatRecord;
      await window.api.writeDBNoLLM(db);
      setAllChats(db.chats);
      if (chatId === null) setChatId(db.chats.length - 1);
    }
  }

  const initialUpdateChats = async () => {
    const db = await window.api.readDB();
    setAllChats(db.chats || []);
  }

  const deleteChat = async () => {
    setAiChats([defaultAiPrompt]);
    setHumanChats([]);
    const db = await window.api.readDB();
    db.chats.splice(chatId, 1);
    await window.api.writeDBNoLLM(db);
    setAllChats(db.chats);
    setChatId(null);
  }

  return (
    db && Object.keys(db).length > 0 ?
      <div className='dialogue-container'>
        <div>
          <h4>Ask about your data</h4>

          {<div className='filter-bar'>
            <button disabled={humanChats.length === 0} onClick={() => {setAiChats([defaultAiPrompt]); setHumanChats([]); setChatId(null); document.getElementById('chat-filter').value = -1;}}>New Chat</button>
            <select id='chat-filter' defaultValue={-1}
              onChange={(e) => {
                const index = e.target.value;
                if (index !== -1) setAiChats(allChats[index][0]); setHumanChats(allChats[index][1]); setChatId(index);
              }}>
              <option disabled={true} defaultValue={true} value={-1}>Select past chats</option>
              { allChats.map((chat, index) => <option value={index}>{chat[1][0].slice(0, 50) + '...'}</option>) }
            </select>
            <button disabled={humanChats.length === 0} onClick={() => {deleteChat(); document.getElementById('chat-filter').value = -1;}}>Delete Chat</button>
          </div>}
        </div>

        {
          aiChats.map((chat, index) => 
            <>
              <div className={(chat === generatingPrompt ? 'flashing' : '') + ' ai-chat chat-container'}
                dangerouslySetInnerHTML={{__html: chat}}></div>
              {humanChats.length > index &&
                <div className='human-chat chat-container'>{humanChats[index]}</div>
              }
            </>
          )
        }
        <div className='prompt-container'>
          <textarea name="prompt" rows="2" value={ prompt } onChange={(e) => { setPrompt(e.target.value) }}></textarea>
          <button className='mt-1' onClick={ askChatbot } disabled={ aiChats[aiChats.length - 1] === generatingPrompt }>Send</button>
        </div>
      </div> : <></>
  )
}

export default Dialogue