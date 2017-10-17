export class PVStorage{
  private static data : IKeyValue[];

  public static clear(){
    if(PVStorage.data)
      PVStorage.data.splice(0);
  }

  public static getItem(key:string) : any{

    if(PVStorage.data){
      return PVStorage.data.find(x=>x.key == key).value;
    }
  }
  public static removeItem(key:string){
    if(PVStorage.data)
      PVStorage.data = PVStorage.data.filter(x => x.key != key);
  }

  public static setItem(key:string, value:any){
    if(PVStorage.data)
      PVStorage.data.push({'key':key, 'value':value});
    else
      PVStorage.data = [{'key':key, 'value':value}];
  }

}

interface IKeyValue{
  key:string,
  value:any
}
