export type Profile = {name:string;email:string;avatar:string;language:'ru'|'en';timezone:string;twoFactor:boolean;news:boolean;alerts:boolean;digest:boolean};
export const initial:Profile = {name:'Александр Иванов',email:'alex.ivanov@gmail.com',avatar:'',language:'ru',timezone:'Europe/Moscow',twoFactor:false,news:true,alerts:true,digest:false};
export const storageKey='orbit-profile-v1';
export function readProfile():Profile {
 try {
  const raw=JSON.parse(localStorage.getItem(storageKey)||'null');
  if(!raw||typeof raw!=='object')return initial;
  const result={...initial};
  for(const key of Object.keys(initial) as (keyof Profile)[]) if(typeof raw[key]===typeof initial[key]) Object.assign(result,{[key]:raw[key]});
  if(!['ru','en'].includes(result.language))result.language='ru';
  try{new Intl.DateTimeFormat('ru',{timeZone:result.timezone});}catch{result.timezone=initial.timezone;}
  if(result.avatar&&!/^data:image\/(jpeg|png|webp);base64,/.test(result.avatar))result.avatar='';
  return result;
 }catch{return initial;}
}
export const cities:Record<string,[string,string]>={
 'Europe/Moscow':['Москва','Moscow'],'Europe/Kaliningrad':['Калининград','Kaliningrad'],'Europe/Samara':['Самара','Samara'],'Asia/Yekaterinburg':['Екатеринбург','Yekaterinburg'],'Asia/Omsk':['Омск','Omsk'],'Asia/Krasnoyarsk':['Красноярск','Krasnoyarsk'],'Asia/Irkutsk':['Иркутск','Irkutsk'],'Asia/Yakutsk':['Якутск','Yakutsk'],'Asia/Vladivostok':['Владивосток','Vladivostok'],'Asia/Magadan':['Магадан','Magadan'],'Asia/Kamchatka':['Камчатка','Kamchatka'],'Europe/London':['Лондон','London'],'Europe/Berlin':['Берлин','Berlin'],'Europe/Paris':['Париж','Paris'],'Asia/Almaty':['Алматы','Almaty'],'Asia/Tbilisi':['Тбилиси','Tbilisi'],'Asia/Dubai':['Дубай','Dubai'],'Asia/Tokyo':['Токио','Tokyo'],'Asia/Shanghai':['Шанхай','Shanghai'],'America/New_York':['Нью-Йорк','New York'],'America/Los_Angeles':['Лос-Анджелес','Los Angeles'],'Australia/Sydney':['Сидней','Sydney'],UTC:['Всемирное время','Coordinated Universal Time']
};
export const isEmail=(email:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
