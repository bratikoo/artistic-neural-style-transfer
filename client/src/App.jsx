import { useRef, useState, useEffect } from "react";
import "./App.css";
import { OwnForm } from "./components/OwnForm";
import { TemplateForm } from "./components/TemplateForm";
import { Segmented } from "./components/Segmented";

function App() {
  const resultImgRef = useRef();
  const [seconds, setSeconds] = useState(0);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState("template");

  const handleSegmentChange = (segment) => {
    setSelectedSegment(segment);
  };

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!loading && seconds !== 0) {
      clearInterval(interval);
      setSeconds(0);
    }
    return () => {
      clearInterval(interval);
    };
  }, [loading, seconds]);

  const downloadResult = () => {
    const link = document.createElement("a");
    link.href = resultImgRef.current.src;
    link.download = "result.jpg";
    link.click();
  };
  console.log(resultImgRef.current?.src);
  return (
    <>
      <div className="app">
        <div className="container">
          <Segmented
            segments={[
              { label: "Шаблоны", key: "template" },
              { label: "Свой стиль", key: "ownStyle" },
            ]}
            onSegmentChange={handleSegmentChange}
          />
          {selectedSegment === "ownStyle" ? (
            <OwnForm
              resultImgRef={resultImgRef}
              setLoading={setLoading}
              setVisible={setVisible}
            />
          ) : (
            <TemplateForm
              resultImgRef={resultImgRef}
              setLoading={setLoading}
              setVisible={setVisible}
            />
          )}
        </div>
        <div className="container result">
          <h2>Результат</h2>
          <span
            style={{ display: loading ? "block" : "none" }}
            className="loader"
          ></span>
          <span style={{ display: loading ? "block" : "none" }}>
            {seconds} сек.
          </span>
          <span
            style={{ display: visible ? "block" : "none" }}
            className="prompt"
          >
            Выберите 2 изображения и нажмите кнопку Создать для генерации
            результата
          </span>
          <img
            id="resultImg"
            ref={resultImgRef}
            className="preview result-img"
            alt="Предпросмотр результата"
          />
          {resultImgRef.current?.src && !loading && (
            <button onClick={downloadResult} className="btn download">
              Скачать
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
