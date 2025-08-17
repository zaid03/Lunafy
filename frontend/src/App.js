import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import LandingPage from './components/LandingPageComponent';
import Auth from './components/AuthComponent';
import '@fontsource/poppins';
import '@fontsource/montserrat';
import SpotifyCallback from './components/SpotifyCallback';
import Dashboard from './components/DashboardComponent';
import Logout from './components/LogoutComponent/Logout';
import Artists from './components/ArtistsComponent/Artists';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Auth" element={<Auth />} />
        <Route path='/callback' element={<SpotifyCallback />} />
        <Route path='/dashboard' element={< Dashboard/>} />
        <Route path='/logout' element={<Logout />} />
        <Route path='/Artists' element={<Artists />} />
       </Routes>
    </Router>
  );
}

export default App;
