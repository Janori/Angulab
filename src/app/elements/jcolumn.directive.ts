import { Renderer2, ElementRef } from '@angular/core';
import { Directive, HostListener, HostBinding,
         EventEmitter, Output, Input, OnInit  } from '@angular/core';

@Directive({
  selector: '[appJcolumn]'
})
export class JcolumnDirective {
  private arrow:ElementRef;

  @Output() public orderChanged : EventEmitter<IColumnEvent> = new EventEmitter();

  @Output('order') public order:boolean = true;
  @Input('order') public setOrder(order:boolean){
    this.order = order;
    this.showOrderBy();
  }
  //private header:string = '-';

  //@HostBinding('style.background') private background = '#fff';
  @Input('name') public name:string = '';

  constructor(private renderer2:Renderer2,
              private elementRef:ElementRef) {
  }

  ngOnInit(){
    let h = this.elementRef.nativeElement.innerHTML ? this.elementRef.nativeElement.innerHTML : '';
    this.elementRef.nativeElement.innerHTML = '';
    let header = this.renderer2.createText(h);
    this.arrow = this.renderer2.createElement('i');

    this.elementRef.nativeElement.text = '';
    this.renderer2.addClass(this.arrow, 'fa');
    this.renderer2.addClass(this.arrow, 'fa-chevron-up');
    this.renderer2.addClass(this.elementRef.nativeElement, 'jcolumn');

    this.renderer2.appendChild(this.elementRef.nativeElement, this.arrow);
    this.renderer2.appendChild(this.elementRef.nativeElement, header);
  }


  @HostListener('click', ['$event']) public mouseOver(evt){
    evt.preventDefault();
    evt.stopPropagation();

    var cev:IColumnEvent = {
      name: this.name,
      order: '',
    }

    this.order = !this.order;
    if(!this.order) cev.order = 'desc';
    this.orderChanged.emit(cev);
    this.showOrderBy();
  }

  @HostListener('mouseleave', ['$event']) public mouseLeave(evt){
    evt.preventDefault();
    evt.stopPropagation();

  }

  private showOrderBy(){
    if(this.order){ //ASC
      this.renderer2.removeClass(this.arrow, 'fa-chevron-down');
      this.renderer2.addClass(this.arrow, 'fa-chevron-up');
    }else{ //DESC
      this.renderer2.removeClass(this.arrow, 'fa-chevron-up');
      this.renderer2.addClass(this.arrow, 'fa-chevron-down');
    }
  }

}

export interface IColumnEvent{
  name:string,
  order:string,
}
