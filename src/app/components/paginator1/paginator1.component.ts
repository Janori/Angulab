import { Component, OnInit, Input} from '@angular/core';
import { JtableDirective } from '../../elements/jtable.directive';

@Component({
  selector: 'app-paginator1',
  templateUrl: './paginator1.component.html',
  styleUrls: ['./paginator1.component.css']
})
export class Paginator1Component implements OnInit {
  @Input('table') tb:JtableDirective;
  @Input('showResults') count:number;

  constructor() { }

  ngOnInit() {
  }

}
