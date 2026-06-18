import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import './app.scss';

interface AppProps {
  children?: React.ReactNode;
}

function App({ children }: AppProps) {
  useEffect(() => {});

  useDidShow(() => {});

  useDidHide(() => {});

  return children;
}

export default App;
