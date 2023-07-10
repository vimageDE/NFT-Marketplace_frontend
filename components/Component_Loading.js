import React, { useState, useContext } from 'react';
import { Globals } from './GlobalVariables';

export const LoadingOverlay = () => {
  const { isLoading, isLoadingText } = useContext(Globals);

  return isLoading ? (
    <div className="fixed flex flex-col items-center justify-center z-50 bg-black bg-opacity-75 w-full h-full left-0 top-0">
      <h2 className="text-white text-6xl pb-4">{isLoadingText}</h2>
      <div className="animate-spin border-t-4 border-white rounded-full w-12 h-12"></div>
    </div>
  ) : null;
};
