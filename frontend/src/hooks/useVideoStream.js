import { useEffect, useRef } from 'react';


export const useVideoStream = (videoId, videoRef) => {
  const token = localStorage.getItem('token');
  const streamUrl = `/api/videos/${videoId}/stream?auth=${token}`;
  return streamUrl;
};
