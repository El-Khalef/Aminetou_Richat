import { useState, useEffect } from 'react';

interface CountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function useCountdown(deadline: string): CountdownData {
  const [countdown, setCountdown] = useState<CountdownData>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    // Vérifier si la deadline est une date valide
    const isValidDate = (dateString: string): boolean => {
      // Ignorer les textes comme "Soumission continue", "Aucune date limite", etc.
      if (dateString.toLowerCase().includes('continue') || 
          dateString.toLowerCase().includes('aucune') ||
          dateString.toLowerCase().includes('permanent') ||
          dateString.toLowerCase().includes('soumissions')) {
        return false;
      }
      
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    };

    if (!isValidDate(deadline)) {
      setCountdown({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: false
      });
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({
          days,
          hours,
          minutes,
          seconds,
          isExpired: false
        });
      } else {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [deadline]);

  return countdown;
}

export function formatCountdown(countdown: CountdownData): string {
  if (countdown.isExpired) {
    return "Clôturé";
  }

  if (countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0) {
    return "";
  }

  if (countdown.days > 0) {
    if (countdown.days === 1) {
      return `Il reste : 1 jour`;
    }
    return `Il reste : ${countdown.days} jours`;
  }

  if (countdown.hours > 0) {
    return `Il reste : ${countdown.hours}h ${countdown.minutes}min`;
  }

  if (countdown.minutes > 0) {
    return `Il reste : ${countdown.minutes}min`;
  }

  return "Bientôt clôturé";
}