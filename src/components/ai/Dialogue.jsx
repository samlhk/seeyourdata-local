import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import InfoCard from '../InfoCard';
import Prompter from './Prompter';

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
      const chatHistory = await window.api.readChats();
      if (chatId === null) chatHistory.chats = (chatHistory.chats || []).concat([chatRecord]);
      else chatHistory.chats[chatId] = chatRecord;
      await window.api.writeChats(chatHistory);
      setAllChats(chatHistory.chats);
      if (chatId === null) setChatId(chatHistory.chats.length - 1);
    }
  }

  const initialUpdateChats = async () => {
    const chatHistory = await window.api.readChats();
    setAllChats(chatHistory.chats || []);
  }

  const deleteChat = async () => {
    setAiChats([defaultAiPrompt]);
    setHumanChats([]);
    const chatHistory = await window.api.readChats();
    chatHistory.chats.splice(chatId, 1);
    await window.api.writeChats(chatHistory);
    setAllChats(chatHistory.chats);
    setChatId(null);
  }

  const populatePrompt = (prompt) => {
    setPrompt(prompt);
  }

  return (
    db && Object.keys(db).length > 0 ?
      <div className='dialogue-container'>
        <div>
          <InfoCard
            title='Ask about your data'
            content={
              <>
                <h5>How it works</h5>
                  <div>
                    The local AI LLM chatbot is trained on your data and can answer your questions on things about your data <br/>
                    It may take some time to generate an answer depending on your device, you may find closing other programs makes the AI run faster<br/>
                    It may fail to generate a answer or if the answer does not make sense, you can re-open the app and try again.<br/>
                    It is important to note the answers are generated with AI and may not be accurate, care should be taken when processing the information generated<br/>
                    Due to the small size of the local LLM, there are limitations in the level of inference it can produce and you may have to probe more times to get answers you want
                  </div>
                <h5>Sample questions</h5>
                  <h6>Insights</h6>
                  <Prompter prompt='What are my general views, tell me however many you can find.' setPrompt={setPrompt}/>
                  <Prompter prompt='What can you infer about my personality, am I more extroverted or introverted?' setPrompt={setPrompt}/>
                  <Prompter prompt='What are my political views?' setPrompt={setPrompt}/>
                  <Prompter prompt='Who do you think I am, as in where am I from, what do I do, give me as much information you can infer from my data.' setPrompt={setPrompt}/><br/>
                  <h6>Activity</h6>
                  <Prompter prompt='What apps do I use the most?' setPrompt={setPrompt}/>
                  <Prompter prompt='How do I use different apps?' setPrompt={setPrompt}/>
                  <Prompter prompt='How do I use different apps and websites?' setPrompt={setPrompt}/>
                  <Prompter prompt='What do I use different online platforms for?' setPrompt={setPrompt}/><br/>
                  <h6>Location</h6>
                  <Prompter prompt='Where am I located in?' setPrompt={setPrompt}/>
                  <Prompter prompt='What places have I been to?' setPrompt={setPrompt}/><br/>
                  <h6>Instagram</h6>
                  <Prompter prompt='How do I use different Instagram services?' setPrompt={setPrompt}/>
                  <Prompter prompt='What things do I post on social media?' setPrompt={setPrompt}/>
                  <Prompter prompt='What can you infer about me based on my messages?' setPrompt={setPrompt}/>
                  <Prompter prompt='Who do I interact with the most on Instagram throughout the past years?' setPrompt={setPrompt}/><br/>
                  <h6>Google</h6>
                  <Prompter prompt='How do I use different Google services, including YouTube?' setPrompt={setPrompt}/>
                  <Prompter prompt='What kind of things do I browse on the Internet and different online platforms?' setPrompt={setPrompt}/><br/>
              </>
            }
          />

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