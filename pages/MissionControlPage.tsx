import React from 'react';
import App from '../App';

// This page wraps the existing simulation App
// In the future, we can refactor App.tsx to be a component instead of full page
const MissionControlPage: React.FC = () => {
  return <App />;
};

export default MissionControlPage;
