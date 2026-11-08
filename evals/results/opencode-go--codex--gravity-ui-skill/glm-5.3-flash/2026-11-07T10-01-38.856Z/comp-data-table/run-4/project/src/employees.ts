export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  hiredAt: string;
  salary: number;
}

export const employees: Employee[] = [
  { id: '1', name: 'Anna Romanova', position: 'Frontend Developer', department: 'Design', hiredAt: '2021-04-12', salary: 125000 },
  { id: '2', name: 'Boris Ivanov', position: 'Backend Developer', department: 'Engineering', hiredAt: '2019-11-03', salary: 148000 },
  { id: '3', name: 'Elena Kuznetsova', position: 'Product Manager', department: 'Product', hiredAt: '2020-07-21', salary: 162000 },
  { id: '4', name: 'Dmitry Sokolov', position: 'Data Analyst', department: 'Analytics', hiredAt: '2022-01-17', salary: 121000 },
  { id: '5', name: 'Irina Volkova', position: 'UX Designer', department: 'Design', hiredAt: '2018-09-05', salary: 118000 },
  { id: '6', name: 'Pavel Morozov', position: 'QA Engineer', department: 'Engineering', hiredAt: '2023-02-28', salary: 98000 },
  { id: '7', name: 'Sergey Novikov', position: 'DevOps Engineer', department: 'Engineering', hiredAt: '2021-10-11', salary: 156000 },
  { id: '8', name: 'Marina Orlova', position: 'Product Analyst', department: 'Analytics', hiredAt: '2020-05-19', salary: 134000 },
  { id: '9', name: 'Nikita Petrov', position: 'Mobile Developer', department: 'Engineering', hiredAt: '2022-08-30', salary: 143000 },
  { id: '10', name: 'Olga Smirnova', position: 'Marketing Manager', department: 'Marketing', hiredAt: '2017-12-04', salary: 127000 },
  { id: '11', name: 'Yulia Tarasova', position: 'Content Designer', department: 'Design', hiredAt: '2024-03-14', salary: 106000 },
  { id: '12', name: 'Vladimir Fedorov', position: 'Team Lead', department: 'Engineering', hiredAt: '2016-06-27', salary: 185000 },
];
