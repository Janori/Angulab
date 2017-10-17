import { Observable } from 'rxjs/Observable';

export interface IService{
  url:string;
  getData(query:string) : Observable<any>;
};
