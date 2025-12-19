import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoom } from '../services/api';
import { getSocket } from '../services/socket';
import { UserContext } from './UserContext';

export const RoomContext = createContext();

const buildFileTree = (files) => {
  const root = { id: '/', name: 'files', children: [] };
  const map = { '': root };

  files.forEach(file => {
    const pathParts = file.path.split('/');
    let currentPath = '';
    pathParts.forEach((part, index) => {
      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!map[currentPath]) {
        const isLeaf = index === pathParts.length - 1;
        const newNode = {
          id: currentPath,
          name: part,
        };
        if (isLeaf) {
          newNode.path = file.path;
          newNode.content = file.content;
        } else {
          newNode.children = [];
        }
        map[currentPath] = newNode;
        if (map[parentPath]) {
            map[parentPath].children.push(newNode);
        } else {
            console.error('Parent path not found:', parentPath, 'for child', currentPath);
        }
      }
    });
  });

  return root.children;
};

export const RoomProvider = ({ children }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [room, setRoom] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const socket = getSocket();

  useEffect(() => {
    if (!roomId || !user) return;

    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const roomData = await getRoom(roomId);
        if (roomData) {
          setRoom(roomData);
          const fileTree = buildFileTree(roomData.files || []);
          setFiles(fileTree);

          socket.emit('join-room', { roomId, user });

        } else {
          navigate('/dashboard'); 
        }
      } catch (err) {
        console.error('Error fetching room data:', err);
        setError(err.message || 'Failed to fetch room data');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomId, user, navigate, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleCodeUpdate = ({ code: newCode }) => {
        setCode(newCode);
        if (selectedFile) {
            const updatedFiles = updateFileContent(files, selectedFile.path, newCode);
            setFiles(updatedFiles);
        }
    };

    socket.on('code-update', handleCodeUpdate);

    return () => {
      socket.off('code-update', handleCodeUpdate);
    };
  }, [socket, files, selectedFile]);

  const updateFileContent = (fileTree, path, newContent) => {
    return fileTree.map(file => {
        if (file.path === path) {
            return { ...file, content: newContent };
        }
        if (file.children) {
            return { ...file, children: updateFileContent(file.children, path, newContent) };
        }
        return file;
    });
  };


  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
    if (socket && selectedFile) {
        const updatedFiles = updateFileContent(files, selectedFile.path, newCode);
        setFiles(updatedFiles);
        socket.emit('code-change', { roomId, code: newCode });
    }
  }, [socket, roomId, selectedFile, files]);

  const selectFile = useCallback((file) => {
    if(file.path) {
        setSelectedFile(file);
        setCode(file.content || '');
    }
  }, []);

  const value = {
    room,
    files,
    loading,
    error,
    code,
    setCode: handleCodeChange,
    selectFile,
    selectedFile
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};
