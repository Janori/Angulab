export class Data{
  static access:any = {};
  static kind : string;


  public static canUse(code:string) : boolean{
    for(let a of Data.access){
      if(a.code.indexOf(code) > -1 && (a.code.length - code.length) < 2 ){
        return true;
      }
    }
    return false;
  }

}
export function canUse(code:string) : boolean{
  for(let a of Data.access){
    if(a.code.indexOf(code) > -1){
      return true;
    }
  }
  return false;
}
