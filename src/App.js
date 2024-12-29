import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Home';
import Page from './pages/Page';

import 'bootstrap/dist/css/bootstrap.css';
import './css/App.css';
import './css/Page.css';
import './css/Panel.css';

export const colorScheme = [
  [
    'rgba(54, 162, 235, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 205, 86, 1)',
    'darkgreen',
    'brown'
  ],
  [
    'rgba(255, 0, 0, 1)',
    'rgba(0, 128, 0, 1)',
    'rgba(255, 165, 0, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(128, 0, 128, 1)',
    'yellow',
    'pink'
  ]
]


function App() {
  return (
    <Router>
      <Routes>
          <Route path='/' element={ <Home/> }/>
          <Route path='/activity' element={ <Page category='activity'/> }/>
          <Route path='/interests' element={ <Page category='interests'/> }/>
          <Route path='/location' element={ <Page category='location'/> }/>
          <Route path='/pi' element={ <Page category='pi'/> }/>
          <Route path='/instagram' element={ <Page category='instagram'/> }/>
      </Routes>
    </Router>
  );
}

export default App;
