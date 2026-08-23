import { useEffect, useRef, useState } from 'react';
import { useNavigation } from 'react-router';
import { dictionaries, type Locale } from '@/lib/i18n';

type ProgressPhase = 'hidden' | 'running' | 'finishing';

const SHOW_DELAY_MS = 120;
const FINISH_DURATION_MS = 180;

export default function NavigationProgress({ locale }: { locale: Locale }) {
  const navigation = useNavigation();
  const [phase, setPhase] = useState<ProgressPhase>('hidden');
  const phaseRef = useRef<ProgressPhase>('hidden');
  const showTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);

  const updatePhase = (nextPhase: ProgressPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  };

  const clearShowTimer = () => {
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  };

  const clearFinishTimer = () => {
    if (finishTimerRef.current !== null) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (navigation.state !== 'idle') {
      clearFinishTimer();

      if (phaseRef.current === 'finishing') {
        updatePhase('running');
      } else if (phaseRef.current === 'hidden' && showTimerRef.current === null) {
        showTimerRef.current = window.setTimeout(() => {
          showTimerRef.current = null;
          updatePhase('running');
        }, SHOW_DELAY_MS);
      }

      return;
    }

    clearShowTimer();

    if (phaseRef.current === 'running') {
      updatePhase('finishing');
      finishTimerRef.current = window.setTimeout(() => {
        finishTimerRef.current = null;
        updatePhase('hidden');
      }, FINISH_DURATION_MS);
    }
  }, [navigation.state]);

  useEffect(() => () => {
    clearShowTimer();
    clearFinishTimer();
  }, []);

  if (phase === 'hidden') {
    return null;
  }

  return (
    <div
      className="route-progress"
      data-phase={phase}
      role="progressbar"
      aria-label={dictionaries[locale].loading}
    >
      <div className="route-progress-bar" />
    </div>
  );
}
