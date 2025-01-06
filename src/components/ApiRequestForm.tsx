import React, { useState, useEffect } from "react";
import axios from "axios";

interface ApiRequestFormProps {
  setResponse: (response: any) => void;
  initialRequest?: any;
}

const ApiRequestForm: React.FC<ApiRequestFormProps> = ({
  setResponse,
  initialRequest,
}) => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [parameters, setParameters] = useState<{ key: string; value: string }[]>([]);

  const [activeTab, setActiveTab] = useState("Parameters"); // Default active tab

  useEffect(() => {
    if (initialRequest) {
      setMethod(initialRequest.method || "GET");
      setUrl(initialRequest.url?.raw || "");

      setHeaders(
        initialRequest.header
          ? JSON.stringify(
              initialRequest.header.reduce((acc: any, h: any) => {
                acc[h.key] = h.value;
                return acc;
              }, {}),
              null,
              2
            )
          : ""
      );

      setBody(initialRequest.body?.raw || "");

      const queryParams = initialRequest.url?.query || [];
      setParameters(
        queryParams.map((param: any) => ({
          key: param.key,
          value: param.value,
        }))
      );
    }
  }, [initialRequest]);

  const handleSubmit = async () => {
    try {
      const config = {
        method,
        url,
        headers: headers ? JSON.parse(headers) : undefined,
        data: body ? JSON.parse(body) : undefined,
      };
      const res = await axios(config);
      setResponse(res.data);
    } catch (error: any) {
      setResponse(error.response || error.message);
    }
  };

  const handleAddParameter = () => setParameters([...parameters, { key: "", value: "" }]);

  const handleParameterChange = (index: number, key: string, value: string) => {
    const updatedParams = [...parameters];
    updatedParams[index] = { key, value };
    setParameters(updatedParams);
  };

  const handleRemoveParameter = (index: number) => {
    const updatedParams = parameters.filter((_, i) => i !== index);
    setParameters(updatedParams);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Parameters":
        return (
          <div>
            {parameters.map((param, index) => (
              <div key={index} className="parameter-row">
                <input
                  type="text"
                  placeholder="Key"
                  value={param.key}
                  onChange={(e) => handleParameterChange(index, e.target.value, param.value)}
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={param.value}
                  onChange={(e) => handleParameterChange(index, param.key, e.target.value)}
                />
                <button onClick={() => handleRemoveParameter(index)}>Remove</button>
              </div>
            ))}
            <button onClick={handleAddParameter}>Add Parameter</button>
          </div>
        );

      case "Headers":
        return (
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            placeholder="Headers (JSON)"
            style={{ height: "100px" }}
          />
        );

      case "Body":
        return (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Body (JSON)"
            style={{ height: "150px" }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="api-form">
      <div className="form-row row-1">
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter API URL"
        />
        <button onClick={handleSubmit}>Send</button>
      </div>

      <div className="tab-container">
        <button
          className={activeTab === "Parameters" ? "active-tab" : ""}
          onClick={() => setActiveTab("Parameters")}
        >
          Parameters
        </button>
        <button
          className={activeTab === "Headers" ? "active-tab" : ""}
          onClick={() => setActiveTab("Headers")}
        >
          Headers
        </button>
        <button
          className={activeTab === "Body" ? "active-tab" : ""}
          onClick={() => setActiveTab("Body")}
        >
          Body
        </button>
      </div>

      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default ApiRequestForm;
