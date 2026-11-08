import {useEffect,useRef,useState} from 'react';
import {Avatar,Button,Checkbox,configure,Icon,Modal,Select,Switch,Text,TextInput} from '@gravity-ui/uikit';
import {AsideHeader} from '@gravity-ui/navigation';
import {ArrowUpFromLine,ArrowUpRight,Bell,Check,ChevronRight,CircleQuestion,Envelope,Gear,Globe,Lock,Person,Shield} from '@gravity-ui/icons';
import {i18n,ru} from './i18n';
import {cities,isEmail,Profile,readProfile,storageKey} from './profile';
import './styles.css';

export function App(){
 const [saved,setSaved]=useState<Profile>(readProfile);
 const [form,setForm]=useState(saved);
 const [attempted,setAttempted]=useState(false);
 const [fileError,setFileError]=useState('');
 const [notice,setNotice]=useState('');
 const [saveError,setSaveError]=useState(false);
 const [helpOpen,setHelpOpen]=useState(false);
 const [activeSection,setActiveSection]=useState('profile');
 const [compact,setCompact]=useState(window.innerWidth<1000);
 const [uploading,setUploading]=useState(false);
 const uploadVersion=useRef(0);
 const dirty=JSON.stringify(form)!==JSON.stringify(saved);
 i18n.setLang(saved.language);
 const t=(key:keyof typeof ru)=>i18n.i18n('profile',key);
 useEffect(()=>{configure({lang:saved.language});document.documentElement.lang=saved.language;document.title=`${t('profileTitle')} · orbit`;},[saved.language]);
 useEffect(()=>{const resize=()=>setCompact(window.innerWidth<1000);window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 useEffect(()=>{const prevent=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',prevent);return()=>window.removeEventListener('beforeunload',prevent);},[dirty]);
 useEffect(()=>{if(!notice)return;const timer=window.setTimeout(()=>setNotice(''),5000);return()=>clearTimeout(timer);},[notice]);
 const update=<K extends keyof Profile>(key:K,value:Profile[K])=>{setForm(current=>({...current,[key]:value}));setNotice('');setSaveError(false);};
 const avatarProps=form.avatar?{imgUrl:form.avatar,alt:form.name}:{text:form.name||'А',theme:'brand' as const};
 const goTo=(id:string)=>{setActiveSection(id);document.getElementById(id)?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});};
 const upload=()=>{
  // Invisible native file picker; its visible trigger is a Gravity UI Button.
  const input=document.createElement('input');input.type='file';input.accept='image/jpeg,image/png,image/webp';
  input.onchange=async()=>{
   const file=input.files?.[0];if(!file)return;setFileError('');
   if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setFileError(t('avatarError'));return;}
   const version=++uploadVersion.current;setUploading(true);
   try{
    const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file);});
    await new Promise<void>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve();img.onerror=reject;img.src=data;});
    if(version===uploadVersion.current)update('avatar',data);
   }catch{if(version===uploadVersion.current)setFileError(t('readError'));}
   finally{if(version===uploadVersion.current)setUploading(false);}
  };input.click();
 };
 const submit=(event:React.FormEvent)=>{
  event.preventDefault();setAttempted(true);
  if(!form.name.trim()||!isEmail(form.email)){goTo('profile');document.getElementById(!form.name.trim()?'name':'email')?.focus();return;}
  const next={...form,name:form.name.trim(),email:form.email.trim()};
  try{localStorage.setItem(storageKey,JSON.stringify(next));setSaved(next);setForm(next);setSaveError(false);setAttempted(false);i18n.setLang(next.language);setNotice(t('saveSuccess'));}catch{setSaveError(true);}
 };
 const cancel=()=>{uploadVersion.current++;setUploading(false);setForm({...saved});setAttempted(false);setFileError('');setSaveError(false);setNotice(t('cancelled'));};
 const heading=(title:keyof typeof ru,hint:keyof typeof ru,icon:typeof Person)=><div className="section-heading"><div className="section-title"><Icon data={icon} size={18}/><Text as="h2" variant="subheader-2">{t(title)}</Text></div><Text as="p" variant="body-1" color="secondary">{t(hint)}</Text></div>;
 const nav=[{id:'profile',title:t('profile'),icon:Person},{id:'preferences',title:t('preferences'),icon:Globe},{id:'security',title:t('security'),icon:Shield},{id:'notifications',title:t('notifications'),icon:Bell}];
 return <>
  <AsideHeader compact={compact} hideCollapseButton className="app-shell" headerDecoration={false}
   logo={{text:'orbit',wrapper:()=><div className="sidebar-brand"><a className="brand" href="#profile" aria-label="Orbit"><span className="brand-symbol"><i/><i/><i/><i/></span><span>orbit<span className="brand-dot">.</span></span></a><span className="brand-caption">{t('workspace')}</span></div>}}
   subheaderItems={[{item:{id:'settings-label',title:t('account'),itemWrapper:()=><div className="nav-caption">{compact?<Icon data={Gear} size={16}/>:t('account')}</div>}}]}
   menuItems={nav.map(item=>({...item,current:activeSection===item.id,pinned:true,className:'sidebar-item',onItemClick:()=>goTo(item.id)}))}
   renderFooter={()=><div className="sidebar-bottom">{!compact&&<div className="help-card"><span className="help-icon"><Icon data={CircleQuestion} size={21}/></span><Text variant="subheader-1">{t('help')}</Text><Text as="p" color="secondary" variant="body-1">{t('helpHint')}</Text><Button view="flat" onClick={()=>setHelpOpen(true)} className="help-link">{t('helpLink')}<Icon data={ArrowUpRight} size={14}/></Button></div>}<div className="sidebar-user"><Avatar size="s" {...(saved.avatar?{imgUrl:saved.avatar}:{text:saved.name,theme:'brand' as const})}/>{!compact&&<div className="user-copy"><Text variant="body-1" className="user-name" ellipsis>{saved.name}</Text><Text variant="caption-2" color="secondary">{t('member')}</Text></div>}</div></div>}
   renderContent={()=><div className="page-content"><header className="topbar"><div className="breadcrumb"><Icon data={Gear} size={17}/><span>{t('settings')}</span><Icon data={ChevronRight} size={13}/><span className="breadcrumb-current">{t('profile')}</span></div><span className="account-pill"><span className="status-dot"/>{t('personal')}</span></header>
    <main className="main-content"><div className="page-heading"><div className="eyebrow">{t('settings')}</div><Text as="h1" variant="display-1">{t('profileTitle')}</Text><Text as="p" variant="body-2" color="secondary">{t('subtitle')}</Text></div>
     <form noValidate onSubmit={submit}><div className="settings-card">
      <section id="profile" className="settings-section personal-section">{heading('personalData','personalHint',Person)}<div className="section-controls">
       <div className="avatar-row"><div className="avatar-wrap"><Avatar size="xl" {...avatarProps}/><span className="avatar-decoration"><Icon data={Check} size={12}/></span></div><div className="avatar-options"><Text variant="body-2" className="field-label">{t('avatar')}</Text><div className="avatar-buttons"><Button view="outlined" size="m" onClick={upload} loading={uploading}><Icon data={ArrowUpFromLine} size={15}/>{t('upload')}</Button>{form.avatar&&<Button view="flat-secondary" size="m" onClick={()=>{uploadVersion.current++;setUploading(false);update('avatar','');setFileError('');}}>{t('remove')}</Button>}</div><Text color="secondary" variant="caption-2">{t('uploadHint')}</Text></div></div>
       {fileError&&<div role="alert" className="field-error">{fileError}</div>}
       <div className="personal-fields"><div className="field"><label htmlFor="name">{t('name')}</label><TextInput id="name" value={form.name} onUpdate={value=>update('name',value)} size="l" autoComplete="name" placeholder={t('namePlaceholder')} validationState={attempted&&!form.name.trim()?'invalid':undefined} errorMessage={attempted&&!form.name.trim()?t('nameError'):undefined} controlProps={{maxLength:100}}/></div><div className="field"><label htmlFor="email">{t('email')}</label><TextInput id="email" type="email" value={form.email} onUpdate={value=>update('email',value)} size="l" autoComplete="email" startContent={<Icon data={Envelope} size={16}/>} validationState={attempted&&!isEmail(form.email)?'invalid':undefined} errorMessage={attempted&&!isEmail(form.email)?t('emailError'):undefined}/><Text variant="caption-2" color="secondary">{t('emailHint')}</Text></div></div>
      </div></section>
      <section id="preferences" className="settings-section">{heading('preferences','preferencesHint',Globe)}<div className="section-controls preference-fields"><div className="field"><label id="language-label">{t('language')}</label><Select aria-labelledby="language-label" value={[form.language]} onUpdate={value=>update('language',value[0] as 'ru'|'en')} options={[{value:'ru',content:'Русский'},{value:'en',content:'English'}]} size="l" width="max"/><Text variant="caption-2" color="secondary">{t('languageHint')}</Text></div><div className="field"><label id="timezone-label">{t('timezone')}</label><Select aria-labelledby="timezone-label" value={[form.timezone]} onUpdate={value=>update('timezone',value[0])} size="l" width="max" filterable filterPlaceholder={t('searchTimezone')} options={Object.entries(cities).map(([zone,names])=>{const offset=new Intl.DateTimeFormat('en',{timeZone:zone,timeZoneName:'longOffset'}).formatToParts(new Date()).find(part=>part.type==='timeZoneName')?.value.replace('GMT','UTC');return{value:zone,content:`(${offset}) ${names[saved.language==='ru'?0:1]}`};})}/><Text variant="caption-2" color="secondary">{t('timezoneHint')}</Text></div></div></section>
      <section id="security" className="settings-section">{heading('security','securityHint',Shield)}<div className="section-controls"><div className="security-row"><div><div className="security-title"><Text variant="body-2" className="field-label">{t('twoFactor')}</Text><span className="recommended">{t('recommended')}</span></div><Text as="p" variant="body-1" color="secondary">{t('twoFactorHint')}</Text></div><Switch size="m" checked={form.twoFactor} onUpdate={value=>update('twoFactor',value)} controlProps={{'aria-label':t('twoFactor')}}/></div>{form.twoFactor&&<div className="security-note"><Icon data={Lock} size={14}/><span>{t('twoFactorDemo')}</span></div>}</div></section>
      <section id="notifications" className="settings-section notifications-section">{heading('notifications','notificationsHint',Bell)}<div className="section-controls"><Text variant="body-2" className="notification-heading">{t('emailNotifications')}</Text><div className="notification-list">{(['news','alerts','digest'] as const).map(key=><Checkbox key={key} size="l" checked={form[key]} onUpdate={value=>update(key,value)}><span className="checkbox-copy"><span className="checkbox-title">{t(key)}</span><Text variant="body-1" color="secondary">{t(`${key}Hint`)}</Text></span></Checkbox>)}</div></div></section>
      <div className="form-footer"><div className={'save-status'+(dirty?' is-dirty':'')}><Icon data={dirty?Gear:Check} size={15}/><span>{dirty?t('unsaved'):t('saved')}</span></div><div className="form-actions"><Button view="outlined" size="l" onClick={cancel}>{t('cancel')}</Button><Button view="action" size="l" type="submit" disabled={uploading}>{t('save')}</Button></div></div>
     </div>{saveError&&<div role="alert" className="save-error">{t('storageError')}</div>}</form>
     <div className="privacy-note"><span className="privacy-icon"><Icon data={Lock} size={16}/></span><div><Text variant="body-1">{t('privacy')}</Text><Text as="p" variant="caption-2" color="secondary">{t('privacyHint')}</Text></div></div>
     <footer className="page-footer"><span>© {new Date().getFullYear()} orbit</span><span>{t('footer')}</span></footer>
    </main></div>}/>
  {notice&&<div className="notice" role="status"><span className="notice-icon"><Icon data={Check} size={17}/></span>{notice}</div>}
  <Modal open={helpOpen} onClose={()=>setHelpOpen(false)} aria-labelledby="help-title"><div className="help-modal"><Icon data={CircleQuestion} size={28}/><Text as="h2" id="help-title" variant="header-1">{t('helpTitle')}</Text><Text as="p" variant="body-2" color="secondary">{t('helpText')}</Text><Button view="action" size="l" onClick={()=>setHelpOpen(false)}>{t('close')}</Button></div></Modal>
 </>;
}
