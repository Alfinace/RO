import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  matriceForm: FormGroup;
  number_line : number = 4;
  number_column : number = 6;
  lines = <any>[];
  columns = <any>[];
  alfa = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  nodeList: NodeListOf<Element>;
  matrice : any[][] = [
    [9,12,9,6,9,10],
    [7,3,7,7,5,5],
    [6,5,9,11,3,11],
    [6,8,11,2,2,10],
  ];
  data: any[][];
  B : number[] = [40,30,70,20,40,20];
  R : number[] = [50,60,20,90];
  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.matriceForm = this.formBuilder.group({
      matrice:this.formBuilder.array([])
    })
    this.initialize();
  }
  initialize(){
    this.data = [];
    for (let i = 0; i < this.R.length; i++) {
      let newLine = [];
      for (let j = 0; j < this.B.length; j++) {
        newLine.push(0);     
      }
      this.data.push(newLine);
    }
    this.data = Array.from(this.data);    
  }
  onGenarate(){
    this.columns = [];
    this.lines = [];
    for (let i = 0; i < this.number_line; i++) {
      this.lines.push(i);
      // this.Y.push(0);
    }
    for (let i = 0; i < this.number_column; i++) {
      this.columns.push(i);
      // this.X.push(0);
    }     
    this.initialize();
  }
  onCalculate(){
    var i = 0;    
    while (i < this.B.length) {
      let completed = true;
      var begin = 0;
      for (let a = 0; a < this.R.length; a++) {
        if (this.data[a][i] == 0) {
          begin = a;
          completed = false;
          break;
        }
      }
      if (completed) {
        i++;
        console.log(completed);
      }else{
        var min = this.matrice[begin][i];        
        var min_index = begin;
        for (let j = 1; j < this.matrice.length; j++) {
          let value = this.matrice[j][i];
          if (min > value && this.data[j][i] == 0) {
            min = value;
            min_index = j;
          }
        }
        if (this.B[i] > this.R[min_index]) {
          let diff = this.B[i] - this.R[min_index];          
          this.B[i] = diff;
          for (let k = 0; k < this.B.length; k++) {
            if (i == k && this.data[min_index][k] == 0) {
              this.data[min_index][k] = this.R[min_index];
            }else if (this.data[min_index][k] == 0){
              this.data[min_index][k] = '-';
            }
          }
          this.R[min_index] = 0;
          continue;
        } else if (this.B[i] < this.R[min_index]) {
          let diff = this.R[min_index] - this.B[i];
          this.R[min_index] = diff;
          for (let k = 0; k < this.R.length; k++) {
            if (k == min_index && this.data[k][i] == 0) {
              this.data[k][i] =  this.B[i];
            }else if (this.data[k][i] == 0) {
              this.data[k][i] ='-';
            }
          }
          this.B[i] = 0;
          i++;
        } else{
          this.data[min_index][i] = this.B[i];
          this.B[i] = 0;
          this.R[min_index] = 0;
          i++
          
          break;
        }        
        // if (i == 5) {
        //   break
        // }
      }
    }

    this.findZ();
  }

  findZ(){
    var z : number = 0;
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data[i].length; j++) {
        const value = this.data[i][j];
        if (!isNaN(value)) {
          z += value * this.matrice[i][j];
        }
      }
    }
    console.log(z);
    
  }
  onInput(event : any){
    let el = event.target;
    let idElementToArray =  el.getAttribute('id').split('x');
    let lineIndex = parseInt(idElementToArray[0]);
    let colIndex = parseInt(idElementToArray[1]);    
    this.matrice[lineIndex][colIndex] = isNaN(parseFloat(el.value)) ? 0 : parseFloat(el.value);
  }

  onInputColumn(event : any){
    let el = event.target;
    let idElementToArray =  el.getAttribute('id').split('x');
    let colIndex = parseInt(idElementToArray[1]);    
    this.B[colIndex] = isNaN(parseFloat(el.value)) ? 0 : parseFloat(el.value);
  }
  onInputLine(event : any){
    let el = event.target;
    let idElementToArray =  el.getAttribute('id').split('x');
    let lineIndex = parseInt(idElementToArray[1]);    
    this.R[lineIndex] = isNaN(parseFloat(el.value)) ? 0 : parseFloat(el.value);
  }
}
