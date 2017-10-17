import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Service, HeaderType } from './service';
import { IService } from './iservice';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class MembersService extends Service implements IService{
  url = 'members';

  constructor(_http:Http) {
    super(_http);
  }

  getData(query:string){
    return this.getMembers(query);
  }

  getMembers(query:string){
    let url = this.mainUrl + this.url + query;
    let headers = this.headers(HeaderType.Authorization);
    console.log("querying: " + url);
    return this.http.get(url, { headers });/*.map( res =>{
      return res;
    }, (errorResponse: any) => {
      console.log(errorResponse);
    });*/
  }


}
