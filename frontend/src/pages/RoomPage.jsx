import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tree } from 'react-arborist';
import { Editor } from '@monaco-editor/react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { RoomContext } from '../context/RoomContext';
import { UserContext } from '../context/UserContext';
import ChatBox from '../components/ChatBox';
import Cursor from '../components/Cursor';
import { getSocket } from '../services/socket';
import '@xterm/xterm/css/xterm.css';

function RoomPage() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { room, files, code, setCode, selectFile } = useContext(RoomContext);
  const termRef = useRef(null);
  const editorRef = useRef(null);
  const [cursors, setCursors] = useState([]);
  const [copied, setCopied] = useState(false);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const term = new Terminal({ cursorBlink: true });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(termRef.current);
    fitAddon.fit();

    term.onData(data => {
      // Simple echo terminal
      term.write(data);
    });

    const socket = getSocket();
    if (socket) {
      socket.on('cursor:move', ({ userId, position, username }) => {
        setCursors(prev => {
          const existing = prev.find(c => c.userId === userId);
          if (existing) {
            return prev.map(c => c.userId === userId ? { ...c, position } : c);
          } else {
            return [...prev, { userId, position, username, color: '#' + Math.floor(Math.random()*16777215).toString(16) }];
          }
        });
      });

      socket.on('user:leave', ({ userId }) => {
        setCursors(prev => prev.filter(c => c.userId !== userId));
      });

      socket.on('update-participants', (participants) => {
        setParticipants(participants);
      });
    }

    return () => {
      if (socket) {
        socket.off('cursor:move');
        socket.off('user:leave');
        socket.off('update-participants');
      }
    };

  }, [user, navigate]);

  const onSelect = (node) => {
    if (node.isLeaf) {
      selectFile(node.data);
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition(e => {
      const socket = getSocket();
      if (socket) {
        socket.emit('cursor:move', { roomId: room.roomId, position: e.position });
      }
    });
  };

  const handleCopy = () => {
    if (room?.roomId) {
        navigator.clipboard.writeText(room.roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-800 text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">{room?.name || 'Loading...'}</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">@{user.username}</span>
          <button onClick={handleCopy} title="Copy Room ID to clipboard" className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md">
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm">
            Leave
          </button>
        </div>
      </header>
      
      {/* Main Layout */}
      <PanelGroup direction="horizontal" className="flex-grow">
        {/* Left Panel */}
        <Panel defaultSize={20}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={70} className="p-2 bg-gray-900">
              <h3 className="font-bold mb-2 text-md">Files</h3>
              <Tree initialData={files} onActivate={onSelect}>
                {Node}
              </Tree>
            </Panel>
            <PanelResizeHandle className="h-1 bg-gray-700 hover:bg-blue-600" />
            <Panel defaultSize={30}>
              <ChatBox participants={participants} />
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-600" />
        {/* Editor and Terminal Panel */}
        <Panel>
          <PanelGroup direction="vertical">
            {/* Editor Panel */}
            <Panel>
              <div className="relative h-full w-full">
                <Editor
                  height="100%"
                  language="javascript"
                  value={code}
                  onChange={(value) => setCode(value)}
                  theme="vs-dark"
                  onMount={handleEditorDidMount}
                />
                {cursors.map(c => {
                  if (!editorRef.current) return null;
                  const editor = editorRef.current;
                  const position = editor.getScrolledVisiblePosition(c.position);
                  if (!position) return null;

                  const top = position.top;
                  const left = position.left;
                  
                  return (
                    <Cursor
                      key={c.userId}
                      color={c.color}
                      x={left}
                      y={top}
                      name={c.username}
                    />
                  );
                })}
              </div>
            </Panel>
            <PanelResizeHandle className="h-1 bg-gray-700 hover:bg-blue-600" />
            {/* Terminal Panel */}
            <Panel defaultSize={30}>
              <div ref={termRef} className="h-full w-full bg-black" />
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}

function Node({ node, style, dragHandle }) {
  return (
    <div style={style} ref={dragHandle} onClick={() => node.isInternal && node.toggle()} className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-1 rounded-md">
      {node.isLeaf ? '📄' : '📁'} {node.data.name}
    </div>
  );
}

export default RoomPage;
