import { useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videos, setVideos] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("video", selectedFile);

    try {
      await axios.post("http://localhost:3000/videoUpload", formData);
      console.log("Video uploaded successfully!");
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  };

  const getAllVideo = async () => {
    try {
      const response = await axios.get("http://localhost:3000/videos");
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  console.log(videos);

  return (
    <>
      <form onSubmit={handleFormSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload Video</button>
      </form>

      <div className="allVideo">
        <button onClick={getAllVideo}>get video</button>
        <div>
          {videos.map((video) => (
            <video key={video._id} controls>
              <source
                src={`http://localhost:3000/videos/${video._id}`}
                type="video/mp4"
              />
            </video>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
