import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import MusicPlayer from './components/MusicPlayer.jsx';
import Toast from './components/Toast.jsx';
import PlaylistModal from './components/PlaylistModal.jsx';

import HomePage from './pages/HomePage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Discover from './pages/Discover.jsx';
import TrackDetail from './pages/TrackDetail.jsx';

export default function App() {
  const [modalTrack, setModalTrack] = useState(null);

  const handleOpenPlaylistModal = (track) => {
    setModalTrack(track);
  };

  const handleClosePlaylistModal = () => {
    setModalTrack(null);
  };

  return (
    <>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<HomePage onOpenPlaylistModal={handleOpenPlaylistModal} />} />
        <Route path="/dashboard" element={<Dashboard onOpenPlaylistModal={handleOpenPlaylistModal} />} />
        <Route path="/discover" element={<Discover onOpenPlaylistModal={handleOpenPlaylistModal} />} />
        <Route path="/track/:id" element={<TrackDetail onOpenPlaylistModal={handleOpenPlaylistModal} />} />
      </Routes>

      <Footer />

      {/* Persistent Audio Player at bottom */}
      <MusicPlayer onOpenPlaylistModal={handleOpenPlaylistModal} />

      {/* Notification Toast */}
      <Toast />

      {/* Add to Playlist Modal */}
      {modalTrack && (
        <PlaylistModal track={modalTrack} onClose={handleClosePlaylistModal} />
      )}
    </>
  );
}
