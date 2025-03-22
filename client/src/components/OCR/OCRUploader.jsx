import React, { useState } from 'react';
import axios from 'axios';

const OCRUploader = () => {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setOcrText('');
  };

  const handleUpload = async () => {
    if (!image) {
      alert('Please select an image first.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await axios.post('http://127.0.0.1:5000/ocr', formData);
      setOcrText(res.data.text);
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">OCR Image Uploader</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="mb-4"
      />
      <br />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? 'Processing...' : 'Upload & Extract Text'}
      </button>

      {ocrText && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Extracted Text:</h3>
          <p className="whitespace-pre-wrap text-left">{ocrText}</p>
        </div>
      )}
    </div>
  );
};

export default OCRUploader;
