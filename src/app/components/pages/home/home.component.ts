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
    [24,22,61,49,83,35],
    [23,39,78,28,65,42],
    [67,56,92,24,53,54],
    [71,43,91,67,40,49],
  ];
  data : any[][];
  X : number[] = [9,11,28,6,14,5];
  Y : number[] = [18,32,14,9];
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
    for (let i = 0; i < this.number_line; i++) {
      let newLine = [];
      for (let j = 0; j < this.number_column; j++) {
        newLine.push(0);     
      }
      this.data.push(newLine);
    }
    
  }
  generateNumber(min : number = 1, max : number = 99) {
    return Math.round(Math.random() * (max - min) + min);
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

  // onInput(event : any){
  //   let el = event.target;
  //   let idElementToArray =  el.getAttribute('id').split('x');
  //   let lineIndex = parseInt(idElementToArray[0]);
  //   let colIndex = parseInt(idElementToArray[1]);    
  //   this.matrice[lineIndex][colIndex] = isNaN(parseFloat(el.value)) ? 0 : parseFloat(el.value);
  // }

  // onInputColumn(event : any){
  //   let el = event.target;
  //   let idElementToArray =  el.getAttribute('id').split('x');
  //   let colIndex = parseInt(idElementToArray[1]);    
  //   this.X[colIndex] = isNaN(parseFloat(el.value)) ? 0 : parseFloat(el.value);
  // }
  // onInputLine(event : any){
  //   let el = event.target;
  //   let idElementToArray =  el.getAttribute('id').split('x');
  //   let lineIndex = parseInt(idElementToArray[1]);    
  //   this.Y[lineIndex] = isNaN(parseFloat(el.value)) ? 0 : parseFloat(el.value);
  // }
  onCalculate(){
    for (let i = 0; i < this.number_column ; i++) {
      this.minicoMethod(i)
    }
  }

  minicoMethod(column: number){
    var line =  0;
    var minimum = this.matrice[line][column];
    // for (let j = 0; j < this.number_line; j++) { 
      console.log(this.X[column]);
      
      if (this.X[column] > 0) {
        for (let i = 1; i < this.number_line ; i++) {      
          const value = this.matrice[i][column];
          if ( minimum != '-' && this.Y[i] != 0 &&  minimum > value ) {
            minimum = value
            line = i;
          }
        }
        this.differanceExpDes(line,column);    
      }
    }!
  }
  differanceExpDes(line:number,column:number){
    console.log('line',line);
    
    var x = this.X[column];
    var y = this.Y[line];
    if (x > y) {
      var less = y
      this.X[column] = this.X[column] - less;
      this.Y[line] = 0;
      for (let index = column; index < this.number_column ; index++) {
        if (index == column ) {
          this.data[line][column] = less;
          console.log(this.data);    
        }else{
          this.data[line][index] = '-';
          console.log('Ao',line,index);
        }
      }
    }else if (x < y) {
      var less = x
      this.Y[line] = this.Y[line] - less;
      this.X[column] = 0;
      for (let index = line; index < this.number_line; index++) {
        if (index == line) {
          this.data[line][column] = less;
          console.log(this.data);        
        }else{
          this.data[index][column] = '-';
        }
      }
    }
    else{
      var less = y
      this.X[column] = 0;
      this.Y[line] = 0;
      this.data[line][column] = less;
    }
  }
}
