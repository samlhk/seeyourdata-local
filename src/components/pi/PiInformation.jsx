import React, { useEffect, useState } from 'react';
import InfoCard from '../InfoCard';

const PiInformation = ({ db }) => {

  const [pis, setPis] = useState();

  const types = ['Phone', 'Location']; //, 'Ip', 'Device'];
  const displayNames = ['Phone numbers', 'Locations']; // 'IP addresses', 'Devices'];

  useEffect(() => {
    render();
  }, [db])

  const render = async () => {
    if (db) {
      const newPis = []
      types.forEach(type => {
        const piType = 'pi' + type;
        newPis.push(db[piType] ? 
          db[piType].map(({ source, list }) => list.map(item => ({ source, item })))
          .reduce((allItems, item) => allItems.concat(item), [])
          .sort((item1, item2) => item1.item.localeCompare(item2.item)) : [])
      });
      setPis(newPis);
    } else {
      setPis(null);
    }
  }

  return (
    pis && pis.find(list => list.length > 0) ?
    <div>
      <InfoCard
        title='Personal Information'
        benefits='Platforms may store your personal information for record purposes, or you may have provided this when you signed up'
        harms='Misuse or leaks of personal information may pose privacy risks'
        sources={['Instagram personal information and login activity']}
      />
      <table>
        {
          pis.map((pi, index) => pi.length > 0 ? 
            <>
              <tr><th>{displayNames[index]}</th><th>Source</th></tr>
              { pi.map(({ source, item }) => <tr><td>{item}</td><td>{source}</td></tr>) }
            </> : <></>)
        }
      </table>
    </div>: <></>
  )
}

export default PiInformation