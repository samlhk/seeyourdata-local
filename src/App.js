import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Home';
import Page from './pages/Page';

import 'bootstrap/dist/css/bootstrap.css';
import './css/App.css';
import './css/Page.css';
import './css/Panel.css';
import './css/FilterBar.css'


function App() {
  return (
    <Router>
      <Routes>
          <Route path='/' element={ <Home/> }/>
          <Route path='/activity' element={ <Page category='activity'/> }/>
      </Routes>
    </Router>
  );
}

export default App;
