

export class CSVExport{

  private data:any = null;
  private options:CSVExportOptions = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    showTitle: true,
    headers:["id", "nombre", "tipo", "info.code", "assoc", "father"]
  }

  constructor(data:any = [], options:CSVExportOptions = null){
    if(options) this.options = options;
    if(data){
      this.data = data;
      this.exportData();
    }
  }

  exportData(){
    let n = '\n';
    var properties = [];
    var props:string[] = this.options.headers.length == 0 ?
                         Object.getOwnPropertyNames(this.data[0]) :
                         this.options.headers ;
    console.log(props);
    var csvText = this.options.headers.join(',') + n;
    for(let row of this.data){
      var txtRow = [];
      for(let p of props){
        if(p.indexOf('|') > 0){
          if(p.indexOf('|json') > 0){
            let val = Reflect.get(row, p.replace('|json',''));
            txtRow.push('"' + JSON.stringify(val).split('"').join('""') + '"');
          }else{
            txtRow.push('');
          }
        }else if(p.indexOf('.')>0){
          var tmpVal:any = row;
          var pps = p.split('.');
          for(let pp of pps){
            tmpVal = Reflect.get(tmpVal, pp);
          }
          if(tmpVal.toString().indexOf('"') > 0){
            txtRow.push('"' + tmpVal.toString().split('"').join('""') + '"');
          }else{
            txtRow.push(tmpVal);
          }
        }else{
          let val = Reflect.get(row, p);
          if(val != null){
            if(val.toString().indexOf('"') > 0){
              txtRow.push('"' + val.toString().split('"').join('""') + '"');
            }else{
              txtRow.push(val);
            }
          }
        }
      }
      csvText += txtRow.join(',') + n;
    }
    console.log(csvText);

    /*var blob = new Blob([csvText], { type:"text/csv;charset=utf-8;" });
    var e = document.createEvent('MouseEvents');
    let a = document.createElement('a');
    a.download = "data.csv";
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    e.initEvent('click', true, false);
    a.dispatchEvent(e);*/
  }



}

export interface CSVExportOptions{
  fieldSeparator:string,
  quoteStrings:string,
  decimalSeparator:string,
  showLabels:boolean,
  showTitle:boolean,
  headers: string[]
}
