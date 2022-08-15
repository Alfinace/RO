import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { linkModel } from 'src/app/models/model.link';
import { NodeModel } from 'src/app/models/model.node';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public matriceForm: FormGroup;
  public showDiagram: boolean = false;
  public nodeData: Array<NodeModel> = [];
  
  public linkData: Array<linkModel>  = []; 
  public number_line : number ;
  public number_column : number ;
  public lines: Array<number> =[];
  public columns: Array<number> =[];
  public max: any;
;
  public Vx: Array<any> =[];
  public Vy: Array<any> =[];
  public alfa = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  public nodeList: NodeListOf<Element>;
  public matrice : any[][];
  public data: any[][];
  public B : number[] = [];
  public R : number[] = [];
  constructor(
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) { }
  ngOnInit(): void {
    this.matriceForm = this.formBuilder.group({
      matrice:this.formBuilder.array([])
    })
    // this.initialize();
  }
  private initialize(){
    this.data = [];
    this.matrice = [];
    this.nodeData = [];
    var space = 0;
    for (let i = 0; i < this.number_line; i++) {
      this.nodeData.push({key:i,text:this.alfa[i],loc:"100 "+(100+space).toString()})
      this.data.push(Array(this.number_column).fill(0));
      this.matrice.push(Array(this.number_column).fill(0));
      space += 70;
    }
    space = 0;
    for (let i = 1; i <= this.number_column; i++) {
      this.nodeData.push({key:this.number_line+i -1,text:i.toString(),loc:"300 "+(100+space).toString()});
      space += 70;
    }
    this.R = Array(this.number_line).fill(0);
    this.B = Array(this.number_column).fill(0);    
  }
  public onGenarate(){ 
    this.columns = [];
    this.lines = [];
    this.Vx = Array(this.number_line).fill(NaN);
    this.Vy = Array(this.number_column).fill(NaN);
    for (let i = 0; i < this.number_line; i++) {
      this.lines.push(i);
    }
    for (let i = 0; i < this.number_column; i++) {
      this.columns.push(i);
    }    
    this.initialize();
    this.valeurAleatoire();
    console.log(this.matrice);
    console.log('R',this.R);
    console.log('B',this.B);
    
  }
  public onCalculate(){
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
      }
    }
    
    this.calculZValue();
    
  }

  // calcule Z et cherche maximun
  private calculZValue(){
    var z : number = 0;
    this.max  = { value: 0, x: null, y: null};
    var tmpLinkData: Array<linkModel> = [];
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data[i].length; j++) {
        const value = this.data[i][j];
        
        if (!isNaN(value)) {
          tmpLinkData.push({
            from: i,
            to: this.number_line + j,
            text: this.matrice[i][j].toString()
          })
          z += value * this.matrice[i][j];
          if (this.max.value < this.matrice[i][j]) {
            this.max ={ value: this.matrice[i][j], x:i, y:j}
          }
        }
      }
    }

    this.linkData = tmpLinkData;
    this.showDiagram = true;
    console.log(this.data);
    this.findVxAndVy();
  }
  public onInput(event : any){
    let el = event.target;
    let idElementToArray =  el.getAttribute('id').split('x');
    let lineIndex = parseInt(idElementToArray[0]);
    let colIndex = parseInt(idElementToArray[1]);    
    this.matrice[lineIndex][colIndex] = isNaN(parseFloat(el.value)) ? 0 : parseFloat(el.value);
  }

  public onInputColumn(event : any){
    let el = event.target;
    let idElementToArray =  el.getAttribute('id').split('x');
    let colIndex = parseInt(idElementToArray[1]);    
    this.B[colIndex] = isNaN(parseFloat(el.value)) ? 0 : parseFloat(el.value);
  }
  public onInputLine(event : any){
    let el = event.target;
    let idElementToArray =  el.getAttribute('id').split('x');
    let lineIndex = parseInt(idElementToArray[1]);    
    this.R[lineIndex] = isNaN(parseFloat(el.value)) ? 0 : parseFloat(el.vaslue);
  }


  findVxAndVy(){
    var {x, y} = this.max;
    console.log(this.max);
    var breakerCompte = 0;
    //mandroso   
    while (this.Vx.includes(NaN) || this.Vy.includes(NaN)) {
            
      for (let i = 0; i < this.number_line; i++) {

        for (let j = 0; j < this.number_column; j++) {
          let value = this.data[i][j]  
          if (!isNaN(value) && !isNaN(this.Vy[j])) {
            this.Vx[i] = (this.Vy[j] - this.matrice[i][j]) >= 0 ? this.Vy[j] - this.matrice[i][j] : NaN ;
          }else if(i == x && !isNaN(value)){
            if (j == y && isNaN(this.Vx[i])) {
              this.Vx[i] = 0;
              this.Vy[j] = this.max.value;
            }else{
              this.Vy[j] = this.matrice[i][j] + this.Vx[i];
            }
          }else{
            if (!isNaN(value) && !isNaN(this.Vx[i]) && this.Vx[i] != 0 && isNaN(this.Vy[j])) {
              this.Vy[j] = this.matrice[i][j] + this.Vx[i];
            }
          }
        }
      }
      if (breakerCompte == 100000) {
        break
      }
      breakerCompte++
    } 
    console.log('Vx',this.Vx);
    console.log('Vy',this.Vy);
  }

  valeurAleatoire(){
    this.matrice = [];
    this.data = [];
    this.R = [];
    this.B = [];
    for (let i = 0; i < this.number_line; i++) {
      this.matrice.push([]);
      this.R.push(this.randomNum(1,100));
      this.data.push(Array(this.number_column).fill(0));
      for (let j = 0; j < this.number_column; j++) {
        this.matrice[i].push(this.randomNum(1,100))
      }
    }
    for (let j = 0; j < this.number_column; j++) {
      this.B.push(this.randomNum(1,100));
    }
  }

  randomNum(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min; // You can remove the Math.floor if you don't want it to be an integer
  }

  marquage() {
    var lamdas : {x: number , y: number, value: number}[] = [];
    for (let i = 0; i < this.number_line; i++) {
      for (let j = 0; j < this.number_column; j++) {
        if (isNaN(this.data[i][j])) lamdas.push({x:i,y:j,value:this.Vx[i]+this.matrice[i][j]-this.Vy[j]})
      }      
    }
    lamdas = lamdas.filter(l => l.value < 0);
    if (lamdas.length > 0) {
      for (let i = 0; i < lamdas.length; i++) {
        var satisfied = false;
        var path : {x: number , y: number, value: number}[] = [];
        const start = lamdas[i];
        path.push(start)
        var current = start;
        for (let j = 0; j < this.number_line; j++) {
          if (!isNaN(this.data[i][current.y]) && i != current.x) {
            if (path[path.length - 1].value > 0) {
              path.push({x:j,y:current.y,value:-this.data[i][current.y]})
            }else{
              path.push({x:j,y:current.y,value:this.data[i][current.y]})
            }
            var lastPath = path[path.length - 1];
            for (let k = 0; k < this.number_column; k++) {
              if (!isNaN(this.data[lastPath.x][k]) && k != lastPath.x) {
                current = {x: lastPath.x , y: k, value: this.data[lastPath.x][k]}
                if (start.x == current.x && start.y == current.y && start.value == current.value) {
                  
                }
                break;
              }
            }
          }
        }
      }
    }
  }

}

