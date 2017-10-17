import { Component, OnInit, ViewChild } from '@angular/core';
import { MembersService } from '../../services/members.service';
import { Service } from '../../services/service';
import { JtableDirective } from '../../elements/jtable.directive';
import { NgModel } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  @ViewChild('tbMember', { read: JtableDirective}) tb:JtableDirective;
  @ViewChild('txtSearch') ts;
  values:number[] = [5,10,20,50,100,200,500];

  text:string = "";

  textChanged(e){
    this.modelChanged.next(e);
    //this.tb.query(e);
  }


  model: string;
  modelChanged: Subject<string> = new Subject<string>();

  constructor(private membersService:MembersService) {
    this.modelChanged
        .debounceTime(300) // wait 300ms after the last event before emitting last event
        .distinctUntilChanged() // only emit if value is different from previous value
        .subscribe(model =>{
            this.tb.query(model);
        });
  }

  showMore(){
    this.tb.resultsPerPage = 30;
  }
  changed($event){
    this.tb.resultsPerPage = $event;
  }

  ngOnInit() {
    //this.tb.resultsPerPage(30);
    /*Service.clearStorage();
    if(Service.getStorage('auth_token') == null){
      this.membersService.getNewtoken("admin", "secret").subscribe(val=>{
        this.membersService.getMembers("").subscribe(data=>{
          console.log(data);
        });
      });
    }*/
  }

}
