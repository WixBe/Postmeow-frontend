import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import './styles/darkTheme.css';
import ApiRequestForm from './components/ApiRequestForm';
import ResponsePane from './components/ResponsePane';
import axios, { AxiosRequestConfig } from 'axios';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { saveToCache, getFromCache } from './utils/indexedDB';

const App: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  // Helper function to serialize FormData into a plain object
  function serializeFormData(formData: FormData): Record<string, string> {
    const plainObject: Record<string, string> = {};
    formData.forEach((value, key) => {
      plainObject[key] = value as string;
    });
    return plainObject;
  }

  // Helper function to deserialize a plain object back into FormData
  // function deserializeFormData(data: Record<string, string>): FormData {
  //   const formData = new FormData();
  //   Object.entries(data).forEach(([key, value]) => {
  //     formData.append(key, value);
  //   });
  //   return formData;
  // }

  // Helper function to clean the Axios config by removing unwanted fields
  function cleanConfig(config: AxiosRequestConfig): AxiosRequestConfig {
    const {
      validateStatus,  // Function: cannot be cloned
      adapter,         // Function: cannot be cloned
      transitional,    // Internal Axios object
      transformRequest,
      transformResponse,
      timeout,
      xsrfCookieName,
      xsrfHeaderName,
      maxContentLength,
      maxBodyLength,
      env,
      headers,
      method,
      ...cleanedConfig
    } = config;
  
    // Return the cleaned config without non-serializable fields
    return cleanedConfig;
  }

  const handleSelectRequest = (request: any) => {
    if (request.request) {
      // Check if the request object is nested under the 'request' key (Postman v2.1 format)
      setSelectedRequest(request.request);
    } else {
      // Handle direct requests (if using Postman v2.0 format)
      setSelectedRequest(request);
    }
  };
  
  

  // Main function to handle sending requests
  const handleSendRequest = async (config: AxiosRequestConfig) => {
    const startTime = performance.now();
    const cacheKey = JSON.stringify(config);
  
    try {
      // Step 1: Check for cached response
      const cachedDoc = await getFromCache(cacheKey);
      if (cachedDoc) {
        console.log('Serving from cache');
        setResponse(cachedDoc.config);
        setStatusCode(cachedDoc.status);
        setResponseTime(cachedDoc.responseTime);
        return;
      }
  
      // Step 2: If offline and no cache, throw an error
      if (!navigator.onLine) {
        throw new Error('No cached data available and no internet connection');
      }
  
      // Step 3: Serialize FormData if present
      const requestData = config.data instanceof FormData
        ? serializeFormData(config.data)
        : config.data;
  
      // Step 4: Send the request using Axios
      const res = await axios({ ...config, data: requestData });
      const endTime = performance.now();
  
      // Step 5: Clean the config before caching
      const cleanedConfig = cleanConfig(res.config);
  
      // Step 6: Cache the response
      await saveToCache({
        _id: cacheKey,
        data: res.data,
        config: { ...cleanedConfig, data: requestData }, // Store cleaned and serialized data
        status: res.status,
        responseTime: Math.round(endTime - startTime),
      });
  
       

      // Step 7: Update the UI with the fetched response
      setResponse({ ...cleanedConfig, data: requestData });
      setStatusCode(res.status);
      setResponseTime(Math.round(endTime - startTime));
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
      setResponse('No cached data available and no internet connection');
      setStatusCode(500);
    }
  };
  

  return (
    <div className="app">
      <Sidebar onSelectRequest={handleSelectRequest} />
      <div className="main-pane">
        <ApiRequestForm
          setResponse={handleSendRequest}
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
