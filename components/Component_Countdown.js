import { useEffect, useState } from 'react';

function Countdown({ expiryTimestamp }) {
  const calculateTimeLeft = () => {
    let diff = expiryTimestamp - Math.floor(Date.now() / 1000);

    return {
      hours: Math.floor(diff / 3600),
      minutes: Math.floor((diff % 3600) / 60),
      seconds: Math.floor((diff % 3600) % 60),
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

  return (
    <div>
      {timeLeft.hours}h, {timeLeft.minutes}m, {timeLeft.seconds}s
    </div>
  );
}

export default Countdown;
