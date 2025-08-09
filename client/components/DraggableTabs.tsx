import React, { useState, useRef, useEffect } from 'react';
import { X, GripVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Tab {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  isIncognito?: boolean;
  content: "home" | "incognito-home" | "news" | "web";
  position?: number;
}

interface DraggableTabsProps {
  tabs: Tab[];
  onTabSwitch: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
  onTabReorder: (tabs: Tab[]) => void;
}

export default function DraggableTabs({
  tabs,
  onTabSwitch,
  onTabClose,
  onNewTab,
  onTabReorder,
}: DraggableTabsProps) {
  const [draggedTab, setDraggedTab] = useState<string | null>(null);
  const [dragOverTab, setDragOverTab] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const tabRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTab(tabId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', tabId);
    
    // Add dragging class to body
    document.body.classList.add('dragging');
  };

  const handleDragEnd = () => {
    setDraggedTab(null);
    setDragOverTab(null);
    setIsDragging(false);
    document.body.classList.remove('dragging');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    if (draggedTab && draggedTab !== tabId) {
      setDragOverTab(tabId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    
    if (!draggedTab || draggedTab === targetTabId) {
      return;
    }

    const draggedIndex = tabs.findIndex(tab => tab.id === draggedTab);
    const targetIndex = tabs.findIndex(tab => tab.id === targetTabId);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    // Create new array with reordered tabs
    const newTabs = [...tabs];
    const [draggedTabData] = newTabs.splice(draggedIndex, 1);
    newTabs.splice(targetIndex, 0, draggedTabData);

    // Update positions
    const updatedTabs = newTabs.map((tab, index) => ({
      ...tab,
      position: index
    }));

    onTabReorder(updatedTabs);
  };

  const getTabIcon = (tab: Tab) => {
    if (tab.isIncognito) {
      return '🕵️';
    }
    if (tab.content === 'home') {
      return '🏠';
    }
    if (tab.content === 'news') {
      return '📰';
    }
    return '🌐';
  };

  const getTabTitle = (tab: Tab) => {
    if (tab.title.length > 20) {
      return tab.title.substring(0, 20) + '...';
    }
    return tab.title;
  };

  return (
    <div className="flex items-center bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 overflow-x-auto">
      {/* Tab Container */}
      <div className="flex items-center min-w-0 flex-1">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
            draggable
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, tab.id)}
            onDrop={(e) => handleDrop(e, tab.id)}
            className={`
              group relative flex items-center min-w-0 max-w-48 h-10 px-3 mx-1 
              rounded-t-lg border border-transparent cursor-pointer
              transition-all duration-200 ease-in-out
              ${tab.isActive 
                ? 'bg-white/20 border-white/30 text-white shadow-lg' 
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }
              ${isDragging && draggedTab === tab.id ? 'opacity-50 scale-95' : ''}
              ${dragOverTab === tab.id ? 'border-cyan-400/50 bg-cyan-400/10' : ''}
              ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
            `}
            onClick={() => onTabSwitch(tab.id)}
          >
            {/* Drag Handle */}
            <div className="flex items-center justify-center w-4 h-4 mr-2 opacity-0 group-hover:opacity-60 transition-opacity">
              <GripVertical className="w-3 h-3" />
            </div>

            {/* Tab Icon */}
            <span className="mr-2 text-sm">{getTabIcon(tab)}</span>

            {/* Tab Title */}
            <span className="flex-1 text-sm font-medium truncate">
              {getTabTitle(tab)}
            </span>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="
                ml-2 w-5 h-5 rounded-full 
                opacity-0 group-hover:opacity-100 
                hover:bg-red-500/20 hover:text-red-400
                transition-all duration-200
                flex items-center justify-center
              "
            >
              <X className="w-3 h-3" />
            </button>

            {/* Active Indicator */}
            {tab.isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full" />
            )}

            {/* Incognito Indicator */}
            {tab.isIncognito && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-purple-400 rounded-full" />
            )}
          </div>
        ))}
      </div>

      {/* New Tab Button */}
      <div className="flex items-center px-2">
        <Button
          onClick={onNewTab}
          size="sm"
          variant="ghost"
          className="
            h-8 w-8 p-0 rounded-lg
            bg-gray-800/50 hover:bg-gray-700/50
            text-gray-300 hover:text-white
            transition-all duration-200
          "
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
