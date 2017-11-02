import { Renderer2, ElementRef, ContentChildren} from '@angular/core';
import { Directive, HostListener, HostBinding, QueryList,
         EventEmitter, Output, Input, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JcolumnDirective } from './jcolumn.directive';
import { IService } from '../services/iservice';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';

@Directive({
  selector: '[appJtable]'
})
export class JtableDirective implements AfterContentInit{
  @ContentChildren(JcolumnDirective) columns:QueryList<JcolumnDirective>;

  @Input('data')
  @Output('data') public data:any[] = [];

  @Input('resultsPerPage')
  public set resultsPerPage(count:number){
    this.params.count = count;
    if(this.params && this.params.getQueryParams() && this.serv)
      this.query();
  }

  @Input('service') public serv:IService;

  @Output('nextEnabled') public nextEnabled(){
    return this.params.nextEnabled();
  }
  @Output('prevEnabled') public prevEnabled(){
    return this.params.prevEnabled();
  }
  @Output('showNumbers') public showNumbers(count:number) : number[]{
    return this.params.showNumbers(count);
  }
  @Output('goNext') public goNext(by:number){
    return this.params.next(by).getUrlParams();
  }
  @Output('goPrev') public goPrev(by:number){
    return this.params.prev(by).getUrlParams();
  }
  @Output('currentPage') public currentPage(){
    return this.params.currentPage();
  }

  private lastWord = '';



  @Input('query') public query(word:string = null){
    this.textChanged.next(word);
  }

  private _query(word:string = null){
    if(word && word.replace(' ', '') == '') this.params.word = null;
    else if(word) this.params.word = word;
    console.log(`w: ${word} l: ${this.lastWord}`);
    if(word != this.lastWord && word != null){
       this.params.from = 0;
     }
    //console.log(this.params.getQueryParams());
    this.serv.getData(this.params.getQueryParams()).subscribe(res=>{
      let rc = res.headers.get('rowcount');
      console.log(rc);
      if(rc != NaN && rc != 0){
          this.params.total = parseInt(rc);
      }
      if(res.json().status){
        this.data = res.json().data;
      }else{
        console.log('D: ' + res.json().data + ' Msg: ' + res.json().msg);
      }
    });
    this.lastWord = word;
  }

  private params = new QueryParams();
  private currentUrl = '';


  textChanged: Subject<string> = new Subject<string>();

  constructor(private renderer2:Renderer2,
              private elementRef:ElementRef,
              private aRoute:ActivatedRoute) {
      this.textChanged
          .debounceTime(300) // wait 300ms after the last event before emitting last event
          .distinctUntilChanged() // only emit if value is different from previous value
          .subscribe(model =>{
              this._query(model);
          });
  }

  ngOnInit(){
    this.currentUrl = this.aRoute.pathFromRoot.join();
    this.aRoute.queryParams.subscribe(p=>{
      let from = p['from'] || 0;
      let count = p['count'] || this.params.count;
      let word = p['word'] || null;
      let order = p['orderby'] || null;
      this.params.from = from;
      this.params.count = count;
      this.params.word = word;
      if(order){
        for(let o of order.split(',')){
          this.params.addOrder(o);
        }
      }
      this._query(word);
    }, error=>{

      console.log("errorsin");
    });
  }

  ngAfterContentInit(){
    this.columns.forEach(col=>{
      for(let o of this.params.getOrders()){
        if(col.name == o){
          col.setOrder(false);
          //col.order = true;
        }
      }
      col.orderChanged.subscribe(event=>{
        if(event.order == ""){
          this.params.removeOrder(event.name);
        }else{
          this.params.addOrder(event.name);
        }
        this.params.from = 0;
        this._query();
      });
    })
  }

}

class QueryParams{
  from: number = 0;
  count: number = 10;
  word: string = null;
  total: number = 40;
  private specialWords = [];
  private orders:string[] = [];

  // *** Special words ***
  addSpecialWord(key:string, value:any){
    this.specialWords.push({'key':key, 'value':value});
  }
  removeSpecialWord(key:string){
    this.specialWords = this.specialWords.filter(x=>{ x.key != key});
  }

  getOrders() : string[]{
    return this.orders;
  }

  // *** Order By's ***
  addOrder(key:string){
    if(this.orders.find(x=>{ return x == key}) == null)
      this.orders.push(key);
  }
  removeOrder(key:string){
    this.orders = this.orders.filter(x=>{ return x !== key});
  }

  getUrlParams():string{
    var query:any = {};
    query.from = this.from;
    query.count = this.count;
    if(this.word) query.word = this.word;
    if(this.orders.length > 0) query.orderby = this.orders.join(',');
    return query;
  }

  getQueryParams() : any{
    var word = `?from=${this.from}&count=${this.count}`;
    if(this.word)
      word += `&query=${this.word}`;
    for(let [k,v] of this.specialWords){
      word += `&${k}=${v}`;
    }
    if(this.orders.length > 0)
      word += `&orders=${this.orders.join(',')}`;
    return word;
  }

  showNumbers(count:number) : number[]{
    var values : number[] = [];
    let current = this.currentPage();
    var _fromValue = 0; var _toValue = 0;
    var _pivot = Math.floor(count/2);

    if(current + _pivot * 2 > this.totalPages()){
      _toValue = this.totalPages();
    }else if(current + _pivot < this.totalPages()){
      if(current - _pivot <= 0){
        _toValue = 1 + _pivot * 2;
      }else{
        _toValue = current + _pivot;
      }
    }else if(current + _pivot * 2 < this.totalPages()){   //Set max page
      _toValue = current + _pivot * 2;
    }else{
      _toValue = this.totalPages();
    }

    if(current - _pivot <= 0){ //Set min page
      _fromValue = 0;
    }else if(current + _pivot >= this.totalPages()){
      if(current - 1 - _pivot * 2 >= 0){
        _fromValue = current - 1 - _pivot * 2;
      }else{
        _fromValue = 0;
      }
    }else{
      _fromValue = current - 1 - _pivot;
    }


    //console.log(`Cur:${current} Piv:${_pivot} From:${_fromValue} To:${_toValue} Tot:${this.totalPages()}`);

    for(let i=_fromValue;i<_toValue;i++){
      values.push(i+1);
    }
    return values;
  }

  // *** Returns currentPage starting at 0
  currentPage() : number{
    return Math.ceil(this.from/this.count) + 1;
  }

  totalPages() : number{
    //console.log(`Total: ${this.total} Count: ${this.count}`);
    return Math.ceil(this.total/this.count);
  }

  nextEnabled() : boolean{
    return (1*this.from + 1*this.count) < this.total;
  }
  prevEnabled() : boolean{
    return this.from != 0;
  }

  next(by:number = 1) : QueryParams{
    let qp = new QueryParams();
    Object.assign(qp,this);
    qp.from = qp.count * by;
    if(1*qp.from < this.total)
      return qp;
    else return this;
  }

  prev(by:number = 1) : QueryParams{
    if(!this.prevEnabled()) return this;
    let qp = new QueryParams();
    Object.assign(qp,this);
    qp.from = qp.count * (by - 2);
    if(qp.from >= 0)
      return qp;
    else return this;
  }


}
