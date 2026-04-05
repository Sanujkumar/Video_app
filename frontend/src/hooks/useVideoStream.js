import { useEffect, useRef } from 'react';

/**
 * Hook to stream video with Authorization header using MediaSource API.
 * Falls back to a direct URL approach for simplicity.
 * Since HTML5 video src doesn't support Authorization headers natively,
 * we append the token as a query param, and the backend reads it too.
 */
export const useVideoStream = (videoId, videoRef) => {
  const token = localStorage.getItem('token');
  const streamUrl = `/api/videos/${videoId}/stream?auth=${token}`;
  return streamUrl;
};
