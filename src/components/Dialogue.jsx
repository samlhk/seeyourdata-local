import React, { useEffect, useState } from 'react';

const Dialogue = ({ db, isHome }) => {

  const [chats, setChats] = useState(['Hello, I am a chatbot that read through your data downloads, feel free to ask me anything about your data!']);
  const [prompt, setPrompt] = useState('');

  const askChatbot = async () => {
    if (prompt) {
      setPrompt('');
      setChats([...chats, prompt, 'generating...']);
      const reply = await window.api.ask(prompt);
      setChats([...chats, prompt, reply]);
    }
  }

  return (
    isHome ?
      (db && Object.keys(db).length > 0 ?
        <div className='dialogue-container'>
          <h4>Ask about your data</h4>
          {
            chats.map((chat, index) => 
              <div className={(index % 2 === 0 ? chat === 'generating...' ? 'ai-chat flashing' : 'ai-chat'
                : 'human-chat') + ' chat-container'}>{chat}</div>
            )
          }
          <div className='prompt-container'>
            <textarea name="prompt" rows="2" value={ prompt } onChange={(e) => { setPrompt(e.target.value) }}></textarea>
            <button className='mt-1' onClick={ askChatbot }>Send</button>
          </div>
          
        </div> : <></>) :

      (db && Object.keys(db).length > 0 ?
        <>
          <div>
            <h4>Dialogue</h4>
          </div>
          <div>Dialogue 2</div>
        </> :
        <></>)
  )
}

export default Dialogue