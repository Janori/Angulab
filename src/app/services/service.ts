import { Headers, Http } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import { Data } from '../shared.data';
import { PVStorage } from './pv-storage';
import 'rxjs/add/operator/timeout';

export class Service {
    public mainUrl: string;

    static lsTest(){
        var test = 'test';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            return false;
        }
    }
    public static getStorage(key:string) : any{
      if(Service.lsTest()){
          return localStorage.getItem(key);
      }else{
        return PVStorage.getItem(key);
      }
    }
    public static clearStorage(){
      if(Service.lsTest()){
        return localStorage.clear();
      }else{
        return PVStorage.clear();
      }
    }
    public static setStorage(key:string, value:any){
      if(Service.lsTest()){
        return localStorage.setItem(key, value);
      }else{
        return PVStorage.setItem(key, value);
      }
    }
    public static removeStorage(key:string){
      if(Service.lsTest()){
        return localStorage.removeItem(key);
      }else{
        return PVStorage.removeItem(key);
      }
    }

    constructor(public http:Http) {
      this.mainUrl = 'http://localhost:8000/';
    }

    headers(...withHeaders: HeaderType[]) {
        let headers = new Headers();

        for(let h of withHeaders){
            switch(h){
              case HeaderType.Json:
                headers.append("Content-Type", "application/json");
                break;
              case HeaderType.Authorization:
                if(Service.getStorage('auth_token') !== null)
                  headers.append("Authorization", Service.getStorage('auth_token'));
                break;
            }
        }
        return headers;
    }

    getNewtoken(email:string, secret:string){
      let url = this.mainUrl + 'authenticate';
      var data:any;
      let headers = this.headers();
      if(email.indexOf("@") == -1){
        data = {
          "username":email,
          "password":secret
        }
      }else{
        data = {
          "email":email,
          "password": secret
        };
      }
      return this.http.post(url, data, { headers })
        .map( res =>{
          if(res.json().status){
            let minutes:number = res.json().data.ttl;
            let milliseconds = minutes * 1000 * 60;
            var d1 = new Date();
            d1.setTime(d1.getTime() + milliseconds);
            console.log("Time", milliseconds);
            Service.setStorage('auth_token', res.json().data.token);
            Service.setStorage('expire_token', d1.toString());
            Service.setStorage('uk', res.json().data.kind);
            Service.setStorage('access', JSON.stringify(res.json().data.perms));
            Data.kind = res.json().data.kind;
            Data.access = res.json().data.perms;
            console.log(res.json().data);
            console.log(Data.access);
            return Observable.of(true);
          }else{
            return Observable.of(false);
          }
        }).catch((error)=>{
          if(error.name == "TimeoutError"){
            return Observable.throw("Tiempo de espera agotado, intente de nuevo más tarde.");
          }
          console.log(error);
          return Observable.throw(error);
        });
      }
}


export enum HeaderType{
  Json,
  Authorization
}
