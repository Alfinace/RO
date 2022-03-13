import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  matriceForm: FormGroup;
  number_line : number;
  number_column : number;
  lines = <any>[];
  columns = <any>[];
  nodeList: NodeListOf<Element>;
  matrice : number[][] = [];
  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.matriceForm = this.formBuilder.group({
      matrice:this.formBuilder.array([])
    })
  }
  initialize(){
    for (let i = 0; i < this.number_line; i++) {
      let newLine = [];
      for (let j = 0; j < this.number_column; j++) {
        newLine.push(0)
      }
      this.matrice.push(newLine);
    }
    console.log(this.matrice); 
  }
  onGenarate(){
    this.columns = [];
    this.lines = [];
    for (let i = 0; i < this.number_line; i++) {
      this.lines.push(i);
    }
    for (let i = 0; i < this.number_column; i++) {
      this.columns.push(i);
    }     
    this.initialize();
  }

  onInput(event : any){
    let el = event.target;
    let idElementToArray =  el.getAttribute('id').split('x');
    let lineIndex = parseInt(idElementToArray[0]);
    let colIndex = parseInt(idElementToArray[1]);
    this.matrice[lineIndex][colIndex] = parseFloat(el.value);
    console.log(this.matrice);
  }
}
