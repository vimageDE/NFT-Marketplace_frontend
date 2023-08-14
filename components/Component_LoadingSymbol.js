export const LoadingSymbol = ({ color, className }) => {
  return (
    <div
      className={`animate-spin border-t-4 border-${color ? color : 'black'} rounded-full w-12 h-12 ${className}`}
    ></div>
  );
};
