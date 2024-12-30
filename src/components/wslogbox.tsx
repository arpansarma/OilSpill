/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import React, { useState, useCallback, useEffect } from "react";

const AISDataDisplay = () => {
  return (
    <div className="m-2 h-64 w-full overflow-x-auto overflow-y-auto border border-gray-500 p-4">
      <h2 className="mb-4 text-2xl font-bold">AIS Data Display</h2>
      <p className="mb-2">Connection Status: Closed </p>
      <ul className="space-y-2"></ul>
    </div>
  );
};

export default AISDataDisplay;
