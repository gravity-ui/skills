import type {ChartData} from './components/ChartWidget';
const sales = [46,52,49,57,54,69,64,62,71,67,76,71,83,77,69,74,82,78,87,84,95,88,86,94,91,106,101,111,105,121];
export function makeSales(days: number): ChartData {
  const values = sales.slice(-days).map((n,i)=>n*1030+(i*173)%900);
  return {timestamps:values.map((_,i)=>Date.UTC(2026,9,31-values.length+i)/1000),series:[
    {id:'current',name:'Текущий период',color:'#169b80',values},
    {id:'previous',name:'Предыдущий период',color:'#b4c6c0',dashed:true,values:values.map((v,i)=>Math.round(v*(.69+Math.sin(i*.8)*.12)))},
  ]};
}
export function makeMonitoring(hours: number, revision = 0): ChartData {
  const count = hours * 600;
  const timestamps = Array.from({length:count},(_,i)=>Date.UTC(2026,9,30,24-hours)/1000+i*6);
  const values = timestamps.map((_,i)=>Math.round((38+Math.sin(i*.021)*8+Math.sin(i*1.73+revision)*9+Math.sin(i*.237)*5+(i%997<12?Math.sin(i%997/12*Math.PI)*100:0))*10)/10);
  return {timestamps,series:[{id:'latency',name:'Время ответа',color:'#169b80',values},{id:'baseline',name:'Базовый уровень',color:'#b4c6c0',dashed:true,values:timestamps.map((_,i)=>35+Math.sin(i*.002)*3)}]};
}
