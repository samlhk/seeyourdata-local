import React, { useEffect, useState } from 'react';
import ReactWordCloud from 'react-wordcloud';
import InfoCard from '../InfoCard';

const Profile = ({ db, category, title, basic, description, benefits, harms, sources }) => {
  
  const [singleFields, setSingleFields] = useState();
  const [multiFields, setMultiFields] = useState();
  const [selectedField, setSelectedField] = useState(null);

  useEffect(() => {
    render();
  }, [db])

  const render = async () => {
    if (db && db[category]) {
      setSingleFields(db[category].filter(({values}) => values.length === 1 && basic));
      setMultiFields(db[category].filter(({values}) => values.length > 1 || !basic));
    } else {
      setSingleFields(null);
      setMultiFields(null);
    }
  }

  return (
    singleFields && multiFields ?
    <div className='profile-container'>
      <InfoCard title={title} description={description} benefits={benefits} harms={harms} sources={sources}/>

      <div className='profile-inner-container'>
        <div className='buttons-container'>
          { multiFields.find(({field}) => field === 'Standard attributes') &&  <button onClick={() => setSelectedField('Standard attributes')} className={selectedField === 'Standard attributes' ? 'highlighted' : ''}>Standard attributes</button>}
          {basic && <button onClick={() => setSelectedField('Basic Information')} className={selectedField === 'Basic Information' ? 'highlighted' : ''}>Basic Information</button>}
          { multiFields.filter(({field}) => field !== 'Standard attributes').sort((item1, item2) => item1.field.localeCompare(item2.field))
            .map(({field}) => <button onClick={() => {setSelectedField(field)}} className={selectedField === field ? 'highlighted' : ''}>{field}</button>) }
        </div>
        {
          selectedField === 'Basic Information' ? 
          (<table>
            {singleFields.map(({ field, values }) => <tr><td><strong>{field}</strong></td><td>{values[0]}</td></tr>) }
          </table>):
          (multiFields.find(({field}) => field === selectedField) ? 
          <ReactWordCloud 
          words={multiFields.find(({field}) => field === selectedField).values.map(text => ({ text, value: 100 }))}
          options={{rotations: 1, rotationAngles: [0, 0], enableTooltip: false}} />
          : <div></div>)
        }
      </div>
    </div>: <></>
  )
}

export default Profile