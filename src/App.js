import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Home';
import Page from './pages/Page';

import 'bootstrap/dist/css/bootstrap.css';
import './css/App.css';
import './css/Page.css';
import './css/Panel.css';


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
