import React, { useEffect, useState } from 'react';

const PiInformation = ({ db }) => {
  
  const [phones, setPhones] = useState();
  const [locations, setLocations] = useState();
  const [ips, setIps] = useState();
  const [devices, setDevices] = useState();

  useEffect(() => {
    render();
  }, [db])

  const render = async () => {
    if (db) {
      if (db.piPhone) {
        setPhones(db.piPhone
          .map(({ source, phone }) => phone.map(phone => ({ source, phone })))
          .reduce((allPhones, phones) => allPhones.concat(phones), []));
      }
      if (db.piLocation) {
        setLocations(db.piLocation
          .map(({ source, location }) => location.map(location => ({ source, location })))
          .reduce((allLocations, locations) => allLocations.concat(locations), []));
      }
      if (db.piIp) {
        setIps(db.piIp
          .map(({ source, ip }) => ip.map(ip => ({ source, ip })))
          .reduce((allIps, ips) => allIps.concat(ips), [])
          .sort((item1, item2) => item1.ip.localeCompare(item2.ip)));
      }
      if (db.piDevice) {
        setDevices(db.piDevice
          .map(({ source, device }) => device.map(device => ({ source, device })))
          .reduce((allDevices, devices) => allDevices.concat(devices), [])
          .sort((item1, item2) => item1.device.localeCompare(item2.device)));
      }
    } else {
      setPhones(null);
      setLocations(null);
      setIps(null);
      setDevices(null);
    }
  }

  return (
    phones || locations || ips || devices ?
    <div>
      <h4>Personal Information</h4>
      <table>
        {
          phones &&
            <>
              <tr><th>Phone Number</th><th>Source</th></tr>
              { phones.map(({ source, phone }) => <tr><td>{phone}</td><td>{source}</td></tr>) }
            </>
        }
        {
          locations &&
            <>
              <tr><th>Location</th><th>Source</th></tr>
              { locations.map(({ source, location }) => <tr><td>{location}</td><td>{source}</td></tr>) }
            </>
        }
        {
          ips &&
            <>
              <tr><th>IP addresses</th><th>Source</th></tr>
              { ips.map(({ source, ip }) => <tr><td>{ip}</td><td>{source}</td></tr>) }
            </>
        }
        {
          devices &&
            <>
              <tr><th>Devices</th><th>Source</th></tr>
              { devices.map(({ source, device }) => <tr><td>{device}</td><td>{source}</td></tr>) }
            </>
        }
      </table>
    </div>: <></>
  )
}

export default PiInformation