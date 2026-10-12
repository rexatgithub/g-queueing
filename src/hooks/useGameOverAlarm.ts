import { useCallback, useEffect, useRef, useState } from 'react';

interface AlarmPlayback {
  audio: HTMLAudioElement;
}

export function useGameOverAlarm(isGameOver: boolean, remainingSeconds: number) {
  const alarmRef = useRef<AlarmPlayback | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmTriggeredRef = useRef(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  const getAlarmAudio = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    audioRef.current ??= new Audio(`${import.meta.env.BASE_URL}sounds/game-over-alarm.wav`);
    audioRef.current.preload = 'auto';
    audioRef.current.loop = true;
    audioRef.current.volume = 0.8;
    return audioRef.current;
  }, []);

  const unlockAudio = useCallback(() => {
    const audio = getAlarmAudio();
    if (!audio) {
      return;
    }

    audio.muted = true;
    void audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
    }).catch(() => {
      audio.muted = false;
    });
  }, [getAlarmAudio]);

  const stopAlarm = useCallback(() => {
    if (alarmRef.current) {
      alarmRef.current.audio.pause();
      alarmRef.current.audio.currentTime = 0;
      alarmRef.current = null;
    }

    setIsAlarmPlaying(false);
  }, []);

  useEffect(() => {
    if (remainingSeconds > 0) {
      alarmTriggeredRef.current = false;
      stopAlarm();
      return;
    }

    if (!isGameOver || alarmTriggeredRef.current) {
      return;
    }

    const audio = getAlarmAudio();
    if (!audio) {
      return;
    }

    alarmTriggeredRef.current = true;
    alarmRef.current = { audio };
    void audio.play().then(() => {
      if (alarmRef.current?.audio === audio) {
        setIsAlarmPlaying(true);
      }
    }).catch(() => {
      if (alarmRef.current?.audio === audio) {
        alarmTriggeredRef.current = false;
        alarmRef.current = null;
        setIsAlarmPlaying(false);
      }
    });
  }, [getAlarmAudio, isGameOver, remainingSeconds, stopAlarm]);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    alarmRef.current = null;
  }, []);

  return { isAlarmPlaying, unlockAudio, stopAlarm };
}