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
import Songs from './components/SongsComponents/songs';
import Albums from './components/AlbumsComponent/album';
import Genre from './components/GenreComponent';
import Taste from './components/TasteComponent';
import Profile from './components/ProfileComponent';
import Settings from './components/SettingsComponent/Settings';
import Privacy from './components/PrivacyComponent';
import Terms from './components/TermsComponents/Terms';

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
        <Route path='/songs' element={<Songs />} />
        <Route path='/albums' element={<Albums />} />
        <Route path='/genres' element={<Genre />} />
        <Route path='/taste' element={<Taste />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/privacy' element={<Privacy />} />
        <Route path='/terms' element={<Terms />} />
       </Routes>
    </Router>
  );
}

export default App;