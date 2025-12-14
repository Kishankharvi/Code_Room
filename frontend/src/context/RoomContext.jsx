import React, { createContext, useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getRoom } from '../services/api';
import { UserContext } from './UserContext';

export const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const { roomId } = useParams();
  const { user } = useContext(UserContext);
  const [room, setRoom] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [code, setCode] = useState('// Select a file to start coding');

  useEffect(() => {
    if (user) {
      getRoom(roomId, user).then(roomData => {
        setRoom(roomData);
        // You would fetch the file structure here
        setFiles([
          { id: '1', name: 'public' },
          { id: '2', name: 'index.html', parentId: '1' },
          { id: '3', name: 'src' },
          { id: '4', name: 'App.js', parentId: '3' },
          { id: '5', name: 'styles.css', parentId: '3' },
        ]);
      });
    }
  }, [roomId, user]);

  const selectFile = (file) => {
    setActiveFile(file);
    // You would fetch file content here
    setCode(`// Content of ${file.name}`);
  };

  return (
    <RoomContext.Provider value={{ room, files, activeFile, code, selectFile, setCode }}>
      {children}
    </RoomContext.Provider>
  );
};