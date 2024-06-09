const resultBlock = document.querySelector('.result');

const imgContent = document.querySelector('#image1');
const imgStyle = document.querySelector('#image2');
const resultImg = document.querySelector('#resultImg');
const propmt = document.querySelector('.prompt');

const submitBtn = document.querySelector('.submit-btn');
const loader = document.querySelector('.loader');

imgContent.addEventListener('change', function() {
  previewImage(this, 'preview1');
  checkFiles(imgContent, imgStyle, submitBtn);
});

imgStyle.addEventListener('change', function() {
  previewImage(this, 'preview2');
  checkFiles(imgContent, imgStyle, submitBtn);
});

function checkFiles(img1, img2, btn) {
  const image1 = img1.files.length;
  const image2 = img2.files.length;

  if (image1 && image2) {
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
}

function uploadImages(image1, image2) {
  const formData = new FormData();

  if (image1) {
      formData.append('content', image1);
  }

  if (image2) {
      formData.append('style', image2);
  }
  loader.style.display = 'inline-block';
  submitBtn.disabled = true;
  imgContent.disabled = true;
  imgStyle.disabled = true;
  propmt.style.display = 'none';
  fetch('http://127.0.0.1:5000/stylize', {
      method: 'POST',
      body: formData
  })
  .then(response => response.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    loader.style.display = 'none';
    resultImg.src = url;
    resultImg.style.display = 'block';
  })
  .catch(error => {
      console.error('Error:', error);
      alert('Ошибка при загрузке изображений.');
  })
  .finally(() => {
    submitBtn.disabled = false;
    imgContent.disabled = false;
    imgStyle.disabled = false;
  })
}
const submitHandler = (e) => { 
  e.preventDefault();
  uploadImages(imgContent.files[0], imgStyle.files[0])
}

document.querySelector('#imageForm').addEventListener('submit',submitHandler);


function previewImage(input, previewId) {
  const preview = document.getElementById(previewId);
  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
  }

  if (file) {
      reader.readAsDataURL(file);
  } else {
      preview.src = '';
  }
}




