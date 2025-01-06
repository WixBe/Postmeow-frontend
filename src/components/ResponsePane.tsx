import '../styles/response.css';

interface ResponsePaneProps {
  response: any;
  statusCode: number | null;
  responseTime: number | null;
}

const ResponsePane: React.FC<ResponsePaneProps> = ({ response, statusCode, responseTime }) => {
  return (
    <div className="response-pane">
      <div className="response-header">
        <h3>Response</h3>
        <div className="response-info">
          {statusCode !== null && <span>Status: {statusCode}</span>}
          {responseTime !== null && <span>Time: {responseTime} ms</span>}
        </div>
      </div>
      {response ? (
        <pre className="response-pre">{JSON.stringify(response, null, 2)}</pre>
      ) : (
        <p>No response to display</p>
      )}
    </div>
  );
};

export default ResponsePane;
