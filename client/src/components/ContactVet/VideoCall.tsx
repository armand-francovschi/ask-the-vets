import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { io, type Socket } from "socket.io-client";
import { useUpdateMedical } from "../UpdateMedical/functions/useUpdateMedical";
import { useAuth } from "../../context/AuthContext";
import { SOCKET_BASE_URL } from "../../config/api";

interface VideoCallProps {
  scheduleId?: number;
  petId?: number;
  petName?: string;
  doctorName?: string;
  embedded?: boolean;
  onHangUp?: () => void;
}

type CallPhase = "initializing" | "waiting" | "ringing" | "connected" | "terminated" | "error";

interface CallState {
  phase: CallPhase;
  message: string;
  error: string | null;
}

type CallAction =
  | { type: "INITIALIZING"; message?: string }
  | { type: "WAITING"; message?: string }
  | { type: "RINGING"; message?: string }
  | { type: "CONNECTED"; message?: string }
  | { type: "TERMINATED"; message?: string }
  | { type: "ERROR"; message: string };

const initialCallState: CallState = {
  phase: "initializing",
  message: "Initializing call...",
  error: null,
};

const callReducer = (state: CallState, action: CallAction): CallState => {
  switch (action.type) {
    case "INITIALIZING":
      return { phase: "initializing", message: action.message || "Initializing call...", error: null };
    case "WAITING":
      return { phase: "waiting", message: action.message || "Waiting for other participant...", error: null };
    case "RINGING":
      return { phase: "ringing", message: action.message || "Calling participant...", error: null };
    case "CONNECTED":
      return { phase: "connected", message: action.message || "Connected", error: null };
    case "TERMINATED":
      return { phase: "terminated", message: action.message || "Call ended", error: null };
    case "ERROR":
      return { phase: "error", message: "Unable to start call", error: action.message };
    default:
      return state;
  }
};

const VideoCall: React.FC<VideoCallProps> = ({
  scheduleId: scheduleIdProp,
  petId: petIdProp,
  petName: petNameProp,
  doctorName: doctorNameProp,
  embedded = false,
  onHangUp,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const petIdFromQuery = Number(queryParams.get("petId"));
  const scheduleIdFromQuery = queryParams.get("scheduleId");
  const petNameFromQuery = queryParams.get("petName") || "Pet";
  const doctorNameFromQuery = queryParams.get("doctorName") || "Doctor";

  const resolvedPetId = typeof petIdProp === "number" ? petIdProp : petIdFromQuery;
  const resolvedScheduleId =
    typeof scheduleIdProp === "number"
      ? scheduleIdProp
      : (scheduleIdFromQuery ? Number(scheduleIdFromQuery) : null);
  const resolvedPetName = petNameProp || petNameFromQuery;
  const resolvedDoctorName = doctorNameProp || doctorNameFromQuery;

  const { filteredPets } = useUpdateMedical();
  const pet = Number.isNaN(resolvedPetId) ? undefined : filteredPets.find(p => p.id === resolvedPetId);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const roomIdRef = useRef<string | null>(null);

  const [callState, dispatch] = useReducer(callReducer, initialCallState);
  const [warning, setWarning] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isMonitoringMic, setIsMonitoringMic] = useState(false);
  const [isRemoteVideoActive, setIsRemoteVideoActive] = useState(false);

  const canStartCall = useMemo(
    () => Boolean(user?.id) && Boolean(resolvedScheduleId) && !Number.isNaN(resolvedScheduleId),
    [resolvedScheduleId, user?.id]
  );

  const stopLocalTracks = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
  }, []);

  const closePeerConnection = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
  }, []);

  const createPeerConnection = useCallback((stream: MediaStream) => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });

    peerConnection.ontrack = (event: RTCTrackEvent) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }

      const updateRemoteVideoState = () => {
        const hasLiveVideo = remoteStream
          ? remoteStream.getVideoTracks().some(track => track.readyState === "live" && track.enabled)
          : false;
        setIsRemoteVideoActive(hasLiveVideo);
      };

      updateRemoteVideoState();
      remoteStream?.getVideoTracks().forEach(track => {
        track.addEventListener("ended", updateRemoteVideoState);
        track.addEventListener("mute", updateRemoteVideoState);
        track.addEventListener("unmute", updateRemoteVideoState);
      });
    };

    peerConnection.onicecandidate = event => {
      if (!event.candidate || !roomIdRef.current || !socketRef.current) return;
      socketRef.current.emit("call:ice", {
        roomId: roomIdRef.current,
        candidate: event.candidate,
      });
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }, []);

  const createAndSendOffer = useCallback(async () => {
    const peerConnection = peerConnectionRef.current;
    const socket = socketRef.current;
    const roomId = roomIdRef.current;

    if (!peerConnection || !socket || !roomId) return;
    if (peerConnection.signalingState !== "stable") return;

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit("call:offer", {
      roomId,
      sdp: offer,
    });

    dispatch({ type: "RINGING", message: "Calling participant..." });
  }, []);

  const terminateCall = useCallback((opts?: { notifyPeer?: boolean; message?: string }) => {
    const notifyPeer = opts?.notifyPeer ?? false;
    const message = opts?.message || "Call ended";
    const socket = socketRef.current;

    if (notifyPeer && socket && roomIdRef.current) {
      socket.emit("call:end", { roomId: roomIdRef.current });
    }

    closePeerConnection();
    stopLocalTracks();
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setIsRemoteVideoActive(false);
    if (socket) socket.disconnect();
    socketRef.current = null;
    roomIdRef.current = null;
    dispatch({ type: "TERMINATED", message });
  }, [closePeerConnection, stopLocalTracks]);

  const endCall = useCallback(() => {
    terminateCall({ notifyPeer: true, message: "Call ended by you" });
    onHangUp?.();
  }, [onHangUp, terminateCall]);

  useEffect(() => {
    if (!canStartCall) {
      dispatch({ type: "ERROR", message: "Missing schedule or user details for this call." });
      return;
    }

    let active = true;

    const startCall = async () => {
      try {
        dispatch({ type: "INITIALIZING", message: "Initializing call..." });
        setWarning(null);

        const tryGetMedia = async (): Promise<{ stream: MediaStream | null; message?: string }> => {
          const isInsecureLanContext =
            typeof window !== "undefined" &&
            !window.isSecureContext &&
            window.location.hostname !== "localhost" &&
            window.location.hostname !== "127.0.0.1";

          if (isInsecureLanContext) {
            return {
              stream: null,
              message:
                "Camera/microphone blocked by browser on insecure HTTP LAN origin. Use HTTPS (for example ngrok) or mark this origin as secure in your browser for testing.",
            };
          }

          try {
            const full = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            return { stream: full };
          } catch (fullErr) {
            console.warn("Full media access failed, trying fallbacks", fullErr);
          }

          try {
            const videoOnly = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            return { stream: videoOnly, message: "Microphone unavailable. Joined with camera only." };
          } catch (videoErr) {
            console.warn("Video-only access failed", videoErr);
          }

          try {
            const audioOnly = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            return { stream: audioOnly, message: "Camera unavailable. Joined with microphone only." };
          } catch (audioErr) {
            console.warn("Audio-only access failed", audioErr);
          }

          return {
            stream: null,
            message: "Camera/microphone unavailable. Joined in listen-only test mode.",
          };
        };

        const { stream, message } = await tryGetMedia();
        if (message) setWarning(message);

        if (!active) return;

        localStreamRef.current = stream;
        if (localVideoRef.current && stream) {
          localVideoRef.current.srcObject = stream;
        }

        createPeerConnection(stream || new MediaStream());

        const socket = io(SOCKET_BASE_URL);
        socketRef.current = socket;

        socket.on("call:ready", async () => {
          try {
            await createAndSendOffer();
          } catch (err) {
            console.error(err);
            dispatch({ type: "ERROR", message: "Failed to create offer." });
          }
        });

        socket.on("call:offer", async (payload: { sdp?: RTCSessionDescriptionInit }) => {
          const peerConnection = peerConnectionRef.current;
          const roomId = roomIdRef.current;
          if (!peerConnection || !payload.sdp || !roomId) return;

          if (peerConnection.signalingState !== "stable") {
            return;
          }

          await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          socket.emit("call:answer", { roomId, sdp: answer });
          dispatch({ type: "CONNECTED", message: "Connected" });
        });

        socket.on("call:answer", async (payload: { sdp?: RTCSessionDescriptionInit }) => {
          const peerConnection = peerConnectionRef.current;
          if (!peerConnection || !payload.sdp) return;

          if (peerConnection.signalingState !== "have-local-offer") {
            return;
          }

          if (peerConnection.currentRemoteDescription) {
            return;
          }

          await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          dispatch({ type: "CONNECTED", message: "Connected" });
        });

        socket.on("call:ice", async (payload: { candidate?: RTCIceCandidateInit }) => {
          const peerConnection = peerConnectionRef.current;
          if (!peerConnection || !payload.candidate) return;
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (err) {
            console.error("ICE candidate error", err);
          }
        });

        socket.on("call:peer-left", () => {
          terminateCall({ notifyPeer: false, message: "Other participant left. Call terminated." });
        });

        socket.on("call:ended", () => {
          terminateCall({ notifyPeer: false, message: "Call was ended by the other participant." });
        });

        socket.emit(
          "call:join",
          { scheduleId: resolvedScheduleId, userId: user!.id },
          async (response: { ok: boolean; message?: string; roomId?: string; participants?: number }) => {
            if (!response.ok || !response.roomId) {
              dispatch({ type: "ERROR", message: response.message || "Unable to join call room." });
              return;
            }

            roomIdRef.current = response.roomId;

            if (response.participants === 1) {
              dispatch({ type: "WAITING", message: "Waiting for other participant..." });
            }

            if (response.participants === 2) {
              dispatch({ type: "CONNECTED", message: "Connected" });
            }
          }
        );

        const peerConnection = peerConnectionRef.current;
        peerConnection?.addEventListener("connectionstatechange", () => {
          const state = peerConnection.connectionState;
          if (state === "disconnected" || state === "failed" || state === "closed") {
            terminateCall({ notifyPeer: false, message: "Connection lost. Call terminated." });
          }
        });
      } catch (err) {
        console.error(err);
        const mediaError = err as DOMException;
        if (mediaError?.name === "NotAllowedError") {
          dispatch({ type: "ERROR", message: "Camera/microphone permission denied. Please allow access in your browser settings." });
        } else if (mediaError?.name === "NotFoundError") {
          dispatch({ type: "ERROR", message: "No camera or microphone was found on this device." });
        } else if (mediaError?.name === "NotReadableError") {
          dispatch({ type: "ERROR", message: "Camera or microphone is being used by another app." });
        } else {
          dispatch({ type: "ERROR", message: "Could not start call media. Check browser permissions and device availability." });
        }
      }
    };

    startCall();

    return () => {
      active = false;
      terminateCall({ notifyPeer: true, message: "Call ended" });
    };
  }, [canStartCall, createAndSendOffer, createPeerConnection, resolvedScheduleId, terminateCall, user]);

  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const nextMuted = !isMuted;
    stream.getAudioTracks().forEach(track => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const nextCameraOff = !isCameraOff;
    stream.getVideoTracks().forEach(track => {
      track.enabled = !nextCameraOff;
    });
    setIsCameraOff(nextCameraOff);
  };

  if (!pet && !resolvedScheduleId) return <div className="p-6 text-center">Call details not found.</div>;

  const titlePet = pet?.name || resolvedPetName;

  return (
    <div className={`${embedded ? "" : "md:ml-64 min-h-screen"} bg-background p-4 md:p-8 flex flex-col gap-4`}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-dark">{titlePet} - {resolvedDoctorName}</h1>
          <p className="text-gray-600">{callState.message}</p>
        </div>
      </div>

      {callState.error && <p className="text-red-600">{callState.error}</p>}
      {warning && <p className="text-yellow-700">{warning}</p>}

      <div className="relative w-full max-w-[1500px] mx-auto rounded-2xl overflow-hidden border bg-black h-[72vh] min-h-[420px]">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

        {callState.phase === "terminated" ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white text-2xl md:text-4xl font-bold tracking-wide">CALL ENDED</p>
          </div>
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isRemoteVideoActive ? "opacity-0" : "opacity-100"}`}>
            <p className="text-white/80 text-lg font-medium">{resolvedDoctorName}</p>
          </div>
        )}

        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-[95%] md:w-auto">
          <div className="flex flex-wrap justify-center gap-2 bg-black/45 backdrop-blur-sm p-3 rounded-xl border border-white/20">
            <button className="px-4 py-2 rounded bg-primary-dark text-white" onClick={toggleMute}>
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button className="px-4 py-2 rounded bg-primary-dark text-white" onClick={() => setIsMonitoringMic(prev => !prev)}>
              {isMonitoringMic ? "Monitor Mic Off" : "Monitor Mic On"}
            </button>
            <button className="px-4 py-2 rounded bg-primary-dark text-white" onClick={toggleCamera}>
              {isCameraOff ? "Camera On" : "Camera Off"}
            </button>
            <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={endCall}>
              Hang Up
            </button>
          </div>
        </div>

        <div className="absolute left-3 bottom-3 z-20 w-40 h-24 md:w-72 md:h-44 rounded-xl overflow-hidden border-2 border-white shadow-2xl bg-gray-900">
          <video ref={localVideoRef} autoPlay playsInline muted={!isMonitoringMic} className="w-full h-full object-cover" />
          <div className="absolute left-2 bottom-1 text-xs text-white bg-black/50 px-2 py-0.5 rounded">
            You
          </div>
        </div>
      </div>
      {isMonitoringMic && (
        <p className="text-yellow-700 text-sm text-center">Mic monitoring can cause echo/feedback. Use headphones for testing.</p>
      )}
    </div>
  );
};

export default VideoCall;
