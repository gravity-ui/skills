import {useMemo, useState} from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {Table, useTable, ColumnReorderingProvider, selectionColumn} from '@gravity-ui/table';
import type {ColumnDef, GroupingState, RowSelectionState} from '@gravity-ui/table/tanstack';
import {House, Person, Gear, ShoppingCart} from '@gravity-ui/icons';
import {Button, Text} from '@gravity-ui/uikit';
import './app.css';

type Order = {id:string; customer:string; date:string; amount:string; status:string; payment:string};
const orders: Order[] = [
 {id:'#ORD-2048',customer:'Александр Петров',date:'24 окт, 14:32',amount:'₽ 12 450',status:'В обработке',payment:'Оплачен'},
 {id:'#ORD-2047',customer:'Мария Иванова',date:'24 окт, 13:18',amount:'₽ 8 900',status:'В обработке',payment:'Оплачен'},
 {id:'#ORD-2046',customer:'Дмитрий Смирнов',date:'24 окт, 12:05',amount:'₽ 24 300',status:'Отправлен',payment:'Оплачен'},
 {id:'#ORD-2045',customer:'Елена Козлова',date:'24 окт, 11:42',amount:'₽ 3 750',status:'Отправлен',payment:'Оплачен'},
 {id:'#ORD-2044',customer:'Игорь Волков',date:'23 окт, 18:26',amount:'₽ 15 600',status:'Доставлен',payment:'Оплачен'},
 {id:'#ORD-2043',customer:'Ольга Новикова',date:'23 окт, 16:03',amount:'₽ 6 200',status:'Доставлен',payment:'Ожидает'},
 {id:'#ORD-2042',customer:'Никита Морозов',date:'23 окт, 14:51',amount:'₽ 19 990',status:'Отменён',payment:'Возврат'},
];
export function App() {
 const [compact,setCompact]=useState(false); const [selection,setSelection]=useState<RowSelectionState>({}); const [grouping,setGrouping]=useState<GroupingState>(['status']);
 const columns=useMemo<ColumnDef<Order>[]>(()=>[
  selectionColumn as ColumnDef<Order>,
  {accessorKey:'id',header:'Заказ',cell:info=><b>{info.getValue<string>()}</b>},
  {accessorKey:'customer',header:'Клиент'}, {accessorKey:'date',header:'Дата'},
  {accessorKey:'amount',header:'Сумма',cell:info=><b>{info.getValue<string>()}</b>},
  {accessorKey:'status',header:'Статус'}, {accessorKey:'payment',header:'Оплата'},
 ],[]);
 const table=useTable({data:orders,columns,getRowId:r=>r.id,enableRowSelection:true,enableMultiRowSelection:true,onRowSelectionChange:setSelection,state:{rowSelection:selection,grouping},onGroupingChange:setGrouping,getGroupedRowModel:undefined});
 return <AsideHeader logo={{text:'NORTHSTAR',href:'#'}} compact={compact} onChangeCompact={setCompact} menuItems={[
  {id:'home',title:'Главная',icon:House},{id:'users',title:'Пользователи',icon:Person},{id:'orders',title:'Заказы',icon:ShoppingCart,current:true},{id:'settings',title:'Настройки',icon:Gear}
 ]} renderContent={()=> <main className="page"><header className="top"><div><div className="crumb">МАГАЗИН <span>/</span> ЗАКАЗЫ</div><Text variant="header-1">Заказы</Text></div><Button view="action">＋ Новый заказ</Button></header>
 <div className="stats"><div className="stat"><small>ВСЕГО ЗАКАЗОВ</small><b>2 048</b><span>↑ 12,8% за месяц</span></div><div className="stat"><small>В ОБРАБОТКЕ</small><b>36</b><span>Требуют внимания</span></div><div className="stat"><small>ВЫРУЧКА</small><b>₽ 1,24 млн</b><span>↑ 8,2% за месяц</span></div><div className="stat"><small>СРЕДНИЙ ЧЕК</small><b>₽ 6 420</b><span>За последние 30 дней</span></div></div>
 <section className="orders"><div className="table-head"><div><Text variant="subheader-1">Все заказы</Text><span className="count">2 048</span></div><div className="actions"><Button view="outlined">Фильтры</Button><Button view="outlined">Группировка: статус⌄</Button><Button view="outlined">⋯</Button></div></div><div className="table-wrap"><ColumnReorderingProvider table={table}><Table table={table}/></ColumnReorderingProvider></div><footer><span>Показано 7 из 2 048 заказов</span><div><Button view="outlined" disabled>←</Button><Button view="outlined">1</Button><Button view="outlined">2</Button><Button view="outlined">3</Button><span>…</span><Button view="outlined">293</Button><Button view="outlined">→</Button></div></footer></section>
 </main>} />;
}
