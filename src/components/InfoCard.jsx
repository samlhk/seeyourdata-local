import React, { useState } from 'react';
import { IoInformationSharp } from "react-icons/io5";
import Card from './Card';

const InfoCard = ({title, description, benefits, harms, sources, content}) => {
  const [cardOpen, setCardOpen] = useState(false);

  const toggleCard = () => {
    setCardOpen(!cardOpen);
  }

  return (
    <>
      <button className='info-button' onClick={toggleCard}>
        <h4>{title}</h4>
        <IoInformationSharp/>
      </button>
      {cardOpen && 
        <Card title={title} content={
          <>
            {description && <><h5>Description</h5>{description}</>}
            {benefits && <><h5>Potential Benefits</h5>{benefits}</>}
            {harms && <><h5>Potential Harms</h5>{harms}</>}
            {sources && <><h5>Where we found this data</h5>{sources.map(source => <><div>{source}</div><br/></>)}</>}
            {content}
          </>
        } toggleCard={toggleCard} />
      }
    </>
    
  )
}

export default InfoCard