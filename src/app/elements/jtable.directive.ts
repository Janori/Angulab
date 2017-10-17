import { Renderer2, ElementRef, ContentChildren} from '@angular/core';
import { Directive, HostListener, HostBinding, QueryList,
         EventEmitter, Output, Input, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JcolumnDirective } from './jcolumn.directive';
import { IService } from '../services/iservice';

@Directive({
  selector: '[appJtable]'
})
export class JtableDirective implements AfterContentInit{
  @ContentChildren(JcolumnDirective) columns:QueryList<JcolumnDirective>;

  @Input('data')
  @Output('data') public data:any;

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

  @Input('query') public query(word:string = null){
    if(word && word.replace(' ', '') == '') this.params.word = null;
    else if(word) this.params.word = word;
    //console.log(this.params.getQueryParams());
    console.log(this.params.count);
    this.serv.getData(this.params.getQueryParams()).subscribe(res=>{
      let rc = res.headers.get('rowcount');
      if(rc != NaN){
        this.params.total = parseInt(rc);
      }
      this.data = res.json().data;
    });
  }

  private params = new QueryParams();
  private currentUrl = '';

  constructor(private renderer2:Renderer2,
              private elementRef:ElementRef,
              private aRoute:ActivatedRoute) { }

  ngOnInit(){
    this.currentUrl = this.aRoute.pathFromRoot.join();
    this.aRoute.queryParams.subscribe(p=>{
      let from = p['from'] || 0;
      let count = p['count'] || this.params.count;
      let word = p['word'] || null;
      let order = p['orderby'] || [];

      this.params.from = from;
      this.params.count = count;
      this.params.word = word;
      for(let o of order){
        this.params.addOrder(o);
      }
      this.query();
    }, error=>{

      console.log("errorsin");
    });
  }

  ngAfterContentInit(){
    this.columns.forEach(col=>{
      col.orderChanged.subscribe(event=>{
        if(event.order == ""){
          this.params.removeOrder(event.name);
        }else{
          this.params.addOrder(event.name);
        }
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

  // *** Order By's ***
  addOrder(key:string){
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
    /*var word = `?from=${this.from}&count=${this.count}`;
    if(this.word) word += `&word=${this.word}`;
    if(this.orders.length > 0)
      word += `&orderby=${this.orders.join(',')}`
    return word;*/
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
