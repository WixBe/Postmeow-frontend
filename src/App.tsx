import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import './styles/darkTheme.css';
import ApiRequestForm from './components/ApiRequestForm';
import ResponsePane from './components/ResponsePane';
import axios, { AxiosRequestConfig } from 'axios';
import PouchDB from 'pouchdb';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const db = new PouchDB('api-cache');  

interface CachedDocument {
  _id: string;
  data: any;
  status: number;
  responseTime: number;
}

const App: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const handleSendRequest = async (config: AxiosRequestConfig) => {
    const startTime = performance.now();
    const cacheKey = JSON.stringify(config);

    try {
      const cachedDoc = (await db.get(cacheKey).catch(() => null)) as
        | CachedDocument
        | null;
      if (cachedDoc) {
        console.log('Serving from cache');
        setResponse(cachedDoc.data);
        setStatusCode(cachedDoc.status);
        setResponseTime(cachedDoc.responseTime);
        return;
      }

      const res = await axios(config);
      const endTime = performance.now();

      await db.put({
        _id: cacheKey,
        data: res.data,
        status: res.status,
        responseTime: Math.round(endTime - startTime),
      });

      setResponse(res.data);
      setStatusCode(res.status);
      setResponseTime(Math.round(endTime - startTime));
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setResponse('Network Error');
      setStatusCode(500);
    }
  };

  return (
    <div className="app">
      <Sidebar onSelectRequest={(request) => setSelectedRequest(request)} />
      <div className="main-pane">
        <ApiRequestForm
          setResponse={setResponse}
          initialRequest={selectedRequest}
        />
        <ResponsePane
          response={response}
          statusCode={statusCode}
          responseTime={responseTime}
        />
      </div>
    </div>
  );
};

// Register the service worker
serviceWorkerRegistration.register();

export default App;