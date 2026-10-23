import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { sampleTracks } from '../data/tracks.js';
import * as musicService from '../services/musicService.js';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  // Audio state
  const [currentTrack, setCurrentTrack] = useState(sampleTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState(sampleTracks);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(sampleTracks[0]?.duration || 214);

  // User & Backend State
  const [currentUser, setCurrentUser] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [likedTrackIds, setLikedTrackIds] = useState(() => {
    return sampleTracks.filter((t) => t.liked).map((t) => t.id);
  });
  const [recentlyPlayed, setRecentlyPlayed] = useState([sampleTracks[0], sampleTracks[1], sampleTracks[2]]);
  const [userPlaylists, setUserPlaylists] = useState([]);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState(null);

  // HTML5 Audio Reference
  const audioRef = useRef(null);

  // Initialize backend connection, authentication, playlists and tracks on mount
  useEffect(() => {
    const initApp = async () => {
      // 1. Health check backend
      const health = await musicService.checkHealth();
      setIsBackendConnected(health.connected);

      // 2. Auto-authenticate as default demo user Alex if no token
      if (health.connected) {
        if (!musicService.getAuthToken()) {
          try {
            const authRes = await musicService.loginUser('alex@soundsphere.io', 'Password123!');
            setCurrentUser(authRes.user);
          } catch {
            // Silently continue
          }
        } else {
          const user = await musicService.getCurrentUser();
          if (user) setCurrentUser(user);
        }
      }

      // 3. Load playlists & tracks
      try {
        const playlists = await musicService.getUserPlaylists();
        setUserPlaylists(playlists);
      } catch (err) {
        console.error('Playlists load error:', err);
      }

      try {
        const tracks = await musicService.getTracks();
        const liked = tracks.filter((t) => t.liked).map((t) => t.id);
        setLikedTrackIds(liked);
      } catch (err) {
        console.error('Tracks load error:', err);
      }
    };

    initApp();
  }, []);

  // Update HTML5 audio volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Audio Event Listeners setup
  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const onEnded = () => {
    nextTrack();
  };

  // Helper for showing temporary toast alerts
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Play specific track
  const playTrack = (track, newQueue = null) => {
    if (!track) return;
    
    const activeQueue = newQueue || queue;
    if (newQueue) {
      setQueue(newQueue);
    }

    const index = activeQueue.findIndex((t) => t.id === track.id);
    setCurrentIndex(index !== -1 ? index : 0);
    setCurrentTrack(track);

    // Add to recently played (avoiding immediate duplicate)
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id);
      return [track, ...filtered].slice(0, 10);
    });

    setIsPlaying(true);

    // Live backend playback recording (increments DB play count & logs history)
    musicService.recordPlay(track.id);

    if (audioRef.current) {
      audioRef.current.src = track.audio;
      audioRef.current.play().catch((err) => {
        console.warn('Audio playback delayed or blocked by browser policy:', err);
      });
    }
  };

  // Toggle Play / Pause
  const togglePlayPause = () => {
    if (!currentTrack) {
      if (queue.length > 0) {
        playTrack(queue[0]);
      }
      return;
    }

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        // Ensure audio source is set
        if (!audioRef.current.src || audioRef.current.src !== currentTrack.audio) {
          audioRef.current.src = currentTrack.audio;
        }
        audioRef.current.play().catch((err) => {
          console.warn('Play error:', err);
        });
      }
      setIsPlaying(true);
    }
  };

  // Next Track
  const nextTrack = () => {
    if (!queue.length) return;
    const nextIdx = (currentIndex + 1) % queue.length;
    setCurrentIndex(nextIdx);
    playTrack(queue[nextIdx]);
  };

  // Previous Track
  const prevTrack = () => {
    if (!queue.length) return;
    const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentIndex(prevIdx);
    playTrack(queue[prevIdx]);
  };

  // Seek time
  const seek = (newTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Change Volume (0 to 1)
  const setVolume = (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Toggle Like Track
  const toggleLikeTrack = async (trackId) => {
    try {
      const updated = await musicService.toggleLike(trackId);
      setLikedTrackIds((prev) => {
        if (prev.includes(trackId)) {
          showToast(`Removed "${updated.title}" from Favorites`);
          return prev.filter((id) => id !== trackId);
        } else {
          showToast(`Added "${updated.title}" to Favorites ❤️`);
          return [...prev, trackId];
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Share Track (Web Share API fallback to Clipboard)
  const shareTrack = (track) => {
    const shareUrl = `${window.location.origin}/track/${track.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: `SoundSphere - ${track.title}`,
          text: `Check out "${track.title}" by ${track.artist} on SoundSphere!`,
          url: shareUrl,
        })
        .then(() => showToast('Shared successfully!'))
        .catch(() => {
          // User cancelled or share failed, fallback to copy
          copyLink(shareUrl);
        });
    } else {
      copyLink(shareUrl);
    }
  };

  const copyLink = (url) => {
    navigator.clipboard
      .writeText(url)
      .then(() => showToast('Song link copied to clipboard! 📋'))
      .catch(() => showToast('Failed to copy link.'));
  };

  // Add track to playlist
  const addToPlaylist = async (playlistId, track) => {
    try {
      const updatedPlaylists = await musicService.addTrackToPlaylist(playlistId, track.id);
      setUserPlaylists(updatedPlaylists);
      const targetPl = updatedPlaylists.find((p) => p.id === playlistId);
      showToast(`Added "${track.title}" to playlist "${targetPl?.title || 'Playlist'}" 🎵`);
    } catch {
      showToast('Could not add to playlist');
    }
  };

  // Create playlist
  const createNewPlaylist = async (title, description) => {
    if (!title.trim()) return;
    try {
      const updated = await musicService.createPlaylist(title, description);
      setUserPlaylists(updated);
      showToast(`Created new playlist "${title}" ✨`);
    } catch {
      showToast('Failed to create playlist');
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentUser,
        isBackendConnected,
        currentTrack,
        isPlaying,
        queue,
        currentIndex,
        volume,
        isMuted,
        currentTime,
        duration,
        likedTrackIds,
        recentlyPlayed,
        userPlaylists,
        toastMessage,
        audioRef,
        playTrack,
        togglePlayPause,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleMute,
        toggleLikeTrack,
        shareTrack,
        addToPlaylist,
        createNewPlaylist,
        showToast,
      }}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentTrack?.audio}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        preload="metadata"
      />
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
