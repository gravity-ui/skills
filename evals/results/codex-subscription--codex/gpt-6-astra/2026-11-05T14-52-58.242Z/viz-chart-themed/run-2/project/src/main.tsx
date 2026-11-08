import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';
import {App} from './App';
function Root(){
 const [theme,setTheme]=useState<'light'|'dark'|'system'>(()=>{try{const saved=localStorage.getItem('pulse-theme');return saved==='light'||saved==='dark'?saved:'system';}catch{return 'system';}});
 return <ThemeProvider theme={theme}><App theme={theme} onTheme={value=>{setTheme(value);try{localStorage.setItem('pulse-theme',value);}catch{}}}/></ThemeProvider>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>);
