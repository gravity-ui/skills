import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import {configure, ThemeProvider} from '@gravity-ui/uikit';
import {App} from './App';
configure({lang: 'ru'});
function Root() {
  const [dark, setDark] = useState(false);
  return <ThemeProvider theme={dark ? 'dark' : 'light'}><App dark={dark} toggleTheme={() => setDark(v => !v)}/></ThemeProvider>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>);
