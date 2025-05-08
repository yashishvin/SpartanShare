import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import {
  Box, IconButton, Drawer, TextField, Button, Typography, Badge, Snackbar, Alert
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  ScreenShare as ScreenShareIcon,
  Chat as ChatIcon,
  ExitToApp as ExitIcon
} from '@mui/icons-material';
import { LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SOCKET_SERVER_URL = 'http://localhost:5000'; // adjust if needed

const WatchPartyRoom = () => {
  const { roomName } = useParams();
  const userName = localStorage.getItem('watchparty-user') || 'Anonymous';
  const localVideoRef = useRef();
  const peersRef = useRef({});
  const socketRef = useRef();
  const [peers, setPeers] = useState([]);         // [{ id, peer, stream }]
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (!userName) {
      const name = prompt('Enter your display name');
      localStorage.setItem('watchparty-user', name);
      window.location.reload();
    }
  }, []);

  // get user media, connect socket, announce presence
  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localVideoRef.current.srcObject = stream;

        socketRef.current.emit('join-room', { roomName, userName });

        socketRef.current.on('all-users', users => {
          // create peer for each existing user
          const pList = users.map(({ socketId, userName }) => {
            const peer = new Peer({ initiator: true, trickle: false, stream });
            peer.on('signal', signal => {
              socketRef.current.emit('sending-signal', {
                userToSignal: socketId,
                callerId: socketRef.current.id,
                signal
              });
            });
            peer.on('stream', remoteStream => {
              setPeers(prev => [...prev, { id: socketId, stream: remoteStream }]);
            });
            peersRef.current[socketId] = peer;
            return { id: socketId, peer };
          });
        });

        socketRef.current.on('user-joined', payload => {
          // a new user joined; respond
          const peer = new Peer({ initiator: false, trickle: false, stream });
          peer.on('signal', signal => {
            socketRef.current.emit('returning-signal', {
              signal,
              callerId: payload.callerId
            });
          });
          peer.on('stream', remoteStream => {
            setPeers(prev => [...prev, { id: payload.callerId, stream: remoteStream }]);
          });
          peer.signal(payload.signal);
          peersRef.current[payload.callerId] = peer;
        });

        socketRef.current.on('receiving-returned-signal', payload => {
          const item = peersRef.current[payload.id];
          if (item) item.signal(payload.signal);
        });

        // Chat messages
        socketRef.current.on('chat-message', message => {
          setChatMessages(prev => [...prev, message]);
        });
      });

    // cleanup on unmount
    return () => {
      socketRef.current.disconnect();
      Object.values(peersRef.current).forEach(p => p.destroy());
    };
  }, [roomName, userName]);

  // send chat
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = { sender: userName, text: newMessage };
    socketRef.current.emit('chat-message', msg);
    setChatMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  // mic/cam toggles
  const toggleMic = () => {
    const stream = localVideoRef.current.srcObject;
    stream.getAudioTracks()[0].enabled = !micOn;
    setMicOn(!micOn);
  };
  const toggleCam = () => {
    const stream = localVideoRef.current.srcObject;
    stream.getVideoTracks()[0].enabled = !camOn;
    setCamOn(!camOn);
  };
  const shareScreen = () => {
    navigator.mediaDevices.getDisplayMedia({ cursor: true })
      .then(screenStream => {
        // replace video track
        const sender = peersRef.current;
        Object.values(peersRef.current).forEach(peer => {
          peer.replaceTrack(
            localVideoRef.current.srcObject.getVideoTracks()[0],
            screenStream.getVideoTracks()[0],
            localVideoRef.current.srcObject
          );
        });
        localVideoRef.current.srcObject = screenStream;
        screenStream.getVideoTracks()[0].onended = () => {
          // revert back to camera
          navigator.mediaDevices.getUserMedia({ video: true }).then(camStream => {
            localVideoRef.current.srcObject = camStream;
            Object.values(peersRef.current).forEach(peer => {
              peer.replaceTrack(
                screenStream.getVideoTracks()[0],
                camStream.getVideoTracks()[0],
                camStream
              );
            });
          });
        };
      });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    .then(() => setSnackbarOpen(true))
    .catch(() => setSnackbarOpen(true));
  };

  const handleExit = () => {
    // 1) Stop your local stream
    const localStream = localVideoRef.current?.srcObject;
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  
    // 2) Destroy all peer connections
    Object.values(peersRef.current).forEach(peer => {
      peer.destroy();
    });
    peersRef.current = {};
  
    // 3) Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  
    // 4) Navigate away
    navigate('/watchparty');   // or wherever you want them to go
  };
  

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Video grid */}
      <Box sx={{ flex: 1, position: 'relative', bgcolor: '#000' }}>
        <Box
            sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            width: '25%',           // same width as your video
            borderRadius: 1,
            overflow: 'hidden'
            }}
        >
            {/* Video itself */}
            <video
            ref={localVideoRef}
            autoPlay
            muted           // you keep this so you don’t hear your own mic
            playsInline     // recommended for mobile
            style={{ width: '100%', display: 'block' }}
            />

            {/* Badge only when muted */}
            {!micOn && (
            <Box
                sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                bgcolor: 'rgba(0,0,0,0.6)',
                borderRadius: '50%',
                p: 0.5,
                }}
            >
                <MicOffIcon fontSize="small" color="error" />
            </Box>
            )}
        </Box>
        {peers.map(p => (
          <video
            key={p.id}
            autoPlay
            style={{ width: '25%', margin: 4 }}
            ref={el => el && (el.srcObject = p.stream)}
          />
        ))}

        {/* Controls */}
        <Box
          sx={{
            position: 'absolute', bottom: 20, left: '50%',
            transform: 'translateX(-50%)', display: 'flex', gap: 2
          }}
        >
          <IconButton onClick={toggleMic} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
            {micOn ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
          <IconButton onClick={toggleCam} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
            {camOn ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>
          <IconButton onClick={shareScreen} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
            <ScreenShareIcon />
          </IconButton>
          <IconButton onClick={() => setChatOpen(true)} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
            <Badge badgeContent={peers.length + 1} color="primary">
              <ChatIcon />
            </Badge>
          </IconButton>
          <IconButton onClick={copyLink} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
            <LinkIcon />
            </IconButton>
         <IconButton onClick={handleExit} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
            <ExitIcon />
         </IconButton>
        </Box>
      </Box>

      {/* Chat sidebar */}
      <Drawer anchor="right" open={chatOpen} onClose={() => setChatOpen(false)}>
        <Box sx={{ width: 300, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6">Chat & Participants ({peers.length + 1})</Typography>
          <Box sx={{ flex: 1, overflowY: 'auto', my: 2 }}>
            {chatMessages.map((m, i) => (
              <Typography key={i} variant="body2">
                <strong>{m.sender}:</strong> {m.text}
              </Typography>
            ))}
          </Box>
          <Box component="form" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
            <TextField
              fullWidth
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message…"
            />
            <Button type="submit" fullWidth sx={{ mt: 1 }}>Send</Button>
          </Box>
        </Box>
      </Drawer>

        {/* Snackbar notification */}
        <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Link copied to clipboard!
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default WatchPartyRoom;
