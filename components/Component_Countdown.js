import { useEffect, useState } from 'react';

function Countdown({ expiryTimestamp }) {
  const calculateTimeLeft = () => {
    let diffOrig = expiryTimestamp - Math.floor(Date.now() / 1000);
    let diff = diffOrig;

    let days = Math.floor(diff / 86400); // Calculate days
    diff -= days * 86400; // Subtract days from diff

    return {
      days: days,
      hours: Math.floor(diff / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: Math.floor((diff % 3600) % 60),
      expired: diffOrig < 0,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    // Clear interval on component unmount
    return () => clearInterval(timer);
  }, []);

  return !timeLeft.expired ? (
    <div>
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </div>
  ) : (
    <div>Expired</div>
  );
}

export default Countdown;
