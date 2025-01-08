import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import '../styles/Sidebar.css'

interface sidebarProps {
    onSelectRequest: (request: any) => void;
}

const Sidebar: React.FC<sidebarProps> = ({ onSelectRequest }) => {

    const [collections, setCollections] = useState<any[]>([]);
    const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({});
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchCollections = async ()=> {
            const response = await axios.get('http://localhost:3000/api/');
            setCollections(response.data);
        };

        fetchCollections();
    }, []);

    const toggleCollection = (collectionId: string) => {
        setExpandedCollections((prev) => ({
            ...prev,
            [collectionId]: !prev[collectionId],
        }));
    };

    const toggleFolder = (folderId: string) => {
        setExpandedFolders((prev) => ({
            ...prev,
            [folderId]: !prev[folderId],
        }));
    };

    const renderRequests = (requests: any[], parentId: string) => {
        return requests.map((request, index) => {
          const requestKey = `${parentId}-${request._id ?? request.name ?? index}`;
          const requestName = request.name ?? 'Unnamed Request';
      
          return (
            <li
              key={requestKey}
              onClick={() => onSelectRequest(request)} // Pass the full request object
              style={{ cursor: "pointer", color: '#bbb' }}
              className="requests"
            >
              {requestName}
            </li>
          );
        });
      };
      
      
      
      
      
      const renderFolders = (folders: any[], parentId: string) => {
        return folders.map((folder, index) => {
          const folderKey = `${parentId}-${folder._id ?? folder.name ?? index}`;
          const folderName = folder.name ?? 'Unnamed Folder';
      
          return (
            <li key={folderKey}>
              <div onClick={() => toggleFolder(folder._id ?? folderKey)} style={{ cursor: "pointer" }}>
                {expandedFolders[folder._id ?? folderKey] ? <FaFolderOpen /> : <FaFolder />} {folderName}
              </div>
              {expandedFolders[folder._id ?? folderKey] && folder.item && (
                <ul className="folders">
                  {renderFolders(folder.item.filter((item) => item.item), folderKey)}
                  {renderRequests(folder.item.filter((item) => item.request), folderKey)}
                </ul>
              )}
            </li>
          );
        });
      };
      
      
      
      
      
      
      const renderCollections = () => {
        return collections.map((collection) => {
          const collectionName = collection.info?.name ?? collection.name ?? 'Unnamed Collection';
      
          // Separate folders and requests correctly
          const folders = (collection.item ?? []).filter((item) => item.item); // Folders have nested items
          const requests = (collection.item ?? []).filter((item) => item.request); // Requests have a request object
      
          return (
            <li key={collection._id}>
              <div onClick={() => toggleCollection(collection._id)} style={{ cursor: "pointer" }}>
                {expandedCollections[collection._id] ? <FaFolderOpen /> : <FaFolder />} {collectionName}
              </div>
              {expandedCollections[collection._id] && (
                <ul>
                  {renderFolders(folders, collection._id)}
                  {renderRequests(requests, collection._id)}
                </ul>
              )}
            </li>
          );
        });
      };
      
      
      
      
      
      

    return (
        <div className="sidebar">
            <h2> API Explorer </h2>
            <ul>
                {renderCollections()}
            </ul>
        </div>
    );
};

export default Sidebar;