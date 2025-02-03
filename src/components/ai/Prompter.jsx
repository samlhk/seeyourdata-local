import React from 'react'

const Prompter = ({prompt, setPrompt}) => {
  return (
    <div><button onClick={() => {setPrompt(prompt)}}>Set Question</button>&nbsp;&nbsp;{prompt}</div>
  )
}

export default Prompter