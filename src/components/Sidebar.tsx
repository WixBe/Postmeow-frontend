import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaFolder, FaFolderOpen } from "react-icons/fa";

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

    const renderRequests = (requests: any[]) => {
        return (
            <ul>
                {
                    requests.map((request) => (
                        <li
                            key={request._id}
                            onClick={() => onSelectRequest(request.request)}
                            style={{ cursor: "pointer", color: '#bbb'}}
                        >
                            { request.name }
                        </li>
                    ))
                }
            </ul>
        );
    };

    const renderFolders = (folders: any[]) => {
        return folders.map((folder) => (
          <li key={folder._id}>
            <div onClick={() => toggleFolder(folder._id)} style={{ cursor: "pointer" }}>
              {expandedFolders[folder._id] ? <FaFolderOpen /> : <FaFolder />} {folder.name}
            </div>
            {expandedFolders[folder._id] && folder.item && renderRequests(folder.item)}
          </li>
        ));
      };

      const renderCollections = () => {
        return collections.map((collection) => (
          <li key={collection._id}>
            <div onClick={() => toggleCollection(collection._id)} style={{ cursor: "pointer" }}>
              {expandedCollections[collection._id] ? <FaFolderOpen /> : <FaFolder />}{" "}
              {collection.info.name}
            </div>
            {expandedCollections[collection._id] && collection.item && (
              <ul>{renderFolders(collection.item)}</ul>
            )}
          </li>
        ));
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