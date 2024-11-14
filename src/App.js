import './App.css';
import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './components/Home';

import 'bootstrap/dist/css/bootstrap.css';
import './css/Form.css';
import './css/Home.css';
import './css/Panel.css';

function App() {
  return (
    <Router>
      <Routes>
          <Route path='/' Component={Home}/>
      </Routes>
    </Router>
  );
}

export default App;
