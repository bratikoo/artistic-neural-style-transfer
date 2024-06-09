import { useRef, useState } from "react";
import { Carousel } from "./carousel/Carousel";

export const TemplateForm = ({ setVisible, setLoading, resultImgRef }) => {
  const imgStyleRef = useRef();
  const imgContentRef = useRef();
  const [disabledSubmit, setDisabledSubmit] = useState(true);

  const onChangeHandler = (e, id) => {
    previewImage(e.target, id);
    checkFiles(imgContentRef.current);
  };
  function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = "block";
    };

    if (file) {
      reader.readAsDataURL(file);
    } else {
      preview.src = "";
    }
  }

  const checkFiles = (img1) => {
    const image1 = img1.files.length;

    if (image1) {
      setDisabledSubmit(false);
    } else {
      setDisabledSubmit(true);
    }
  };
  const uploadImages = async (content, template) => {
    const imgSrcTempalte = template.src;
    const response = await fetch(imgSrcTempalte);
    const blob = await response.blob();
    const file = new File([blob], "style.jpg", { type: blob.type });
    const formData = new FormData();
    formData.append("style", file);

    if (content) {
      formData.append("content", content);
    }

    setLoading(true);
    setDisabledSubmit(true);
    setVisible(false);

    resultImgRef.current.style.display = "none";
    fetch("http://127.0.0.1:5000/stylize", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        resultImgRef.current.src = url;
        resultImgRef.current.style.display = "block";
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Ошибка при загрузке изображений.");
      })
      .finally(() => {
        setLoading(false);
        setDisabledSubmit(false);
      });
  };
  return (
    <>
      <h2>Выбор шаблона</h2>
      <Carousel imgStyleRef={imgStyleRef} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          uploadImages(imgContentRef.current.files[0], imgStyleRef.current);
        }}
        id="imageForm"
      >
        <div className="input-group">
          <label htmlFor="image1">Контент:</label>
          <input
            onChange={(e) => onChangeHandler(e, "preview1")}
            type="file"
            id="image1"
            accept="image/*"
            ref={imgContentRef}
          />
          <img
            id="preview1"
            className="preview"
            alt="Предпросмотр первого изображения"
          />
        </div>
        <button className="btn submit" disabled={disabledSubmit} type="submit">
          Создать
        </button>
      </form>
    </>
  );
};
