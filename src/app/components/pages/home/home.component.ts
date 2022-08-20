import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { linkModel } from 'src/app/models/model.link';
import { NodeModel } from 'src/app/models/model.node';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('step') step: ElementRef
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
    console.log(this.matrice);    
    console.log(this.R);    
    console.log(this.B);    
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
    var table = document.createElement('table');
    table.setAttribute('style','border-collapse: collapse')
    var thead = document.createElement('thead');
    var trh = document.createElement('tr');
    trh.setAttribute('style','height: 50px')
    var tbody = document.createElement('tbody');
    trh.appendChild(document.createElement('th'))
    for (let i = 0; i < this.number_column; i++) {
      let th = document.createElement('th');
      th.innerText = (i+1).toString()
      trh.appendChild(th)
    }
    thead.appendChild(trh);
    table.appendChild(thead);
    for (let i = 0; i < this.data.length; i++) {
      let tr = document.createElement('tr');
      let tdFirst = document.createElement('td');
      tdFirst.innerText = this.alfa[i]
      tdFirst.setAttribute('style','padding: 15px;')
      tr.appendChild(tdFirst)
      for (let j = 0; j < this.data[i].length; j++) {
        let td = document.createElement('td');
        td.setAttribute('style','border: 1px solid #000;padding: 15px;width: 20px;text-align:center')
        td.innerText = this.data[i][j];
        tr.appendChild(td)
      }
      let tdLast = document.createElement('td');
      tdLast.innerText = this.R[i].toString();
      tr.appendChild(tdLast)
      tbody.appendChild(tr)
    }
    let trLast = document.createElement('tr');
    trLast.appendChild(document.createElement('td'))
    for (let i = 0; i < this.B.length; i++) {
      let tdLast = document.createElement('td');
      tdLast.setAttribute('style','padding: 15px;width: 20px;text-align:center')
      tdLast.innerText = this.B[i].toString();
      trLast.appendChild(tdLast)
    }
    tbody.appendChild(trLast)
    table.appendChild(tbody);
    this.step.nativeElement.appendChild(table)
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
    this.R[lineIndex] = isNaN(parseFloat(el.value)) ? 0 : parseFloat(el.value);
    
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
      if (breakerCompte == 1000000) {
        console.log(this.Vx);
        console.log(this.Vy);
        
        break
      }
      breakerCompte++
    } 
    console.log('Vx',this.Vx);
    console.log('Vy',this.Vy);
    // this.marquage();
  }

  valeurAleatoire(){
    this.matrice = [];
    this.data = [];
    this.R = [];
    this.B = [];
    for (let i = 0; i < this.number_line; i++) {
      // this.matrice.push([]);
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
    console.log(lamdas);
    
    var _lamdas = lamdas.filter(lamda => {
        return lamda.value < 0
      });
    console.log(_lamdas);
    if (_lamdas.length > 0) {
      for (let i = 0; i < _lamdas.length; i++) {
        var satisfied = false;
        var path : {x: number , y: number, value: number}[] = [];
        var start = {..._lamdas[i]};
        start.value = this.matrice[start.x][start.y];
        path.push(start)
        var current = start;
        for (let j = 0; j < this.number_line; j++) {
          console.log(`${j}, ${current.y}`, this.data[j][current.y]);
          
          if (!isNaN(this.data[j][current.y]) && i != current.x) {
            if (path[path.length - 1].value > 0) {
              path.push({x:j,y:current.y,value:-this.data[j][current.y]})
            }else{
              path.push({x:j,y:current.y,value:this.data[j][current.y]})
            }

            var lastPath = path[path.length - 1];
            var badPathX = [];
            var badPathY = [];
            while (!satisfied) {
              let resLine = this.findNumberInLine(lastPath.y);
              if (resLine.found) {
                let resCol = this.findNumberInColumn(lastPath.x);
                if (resCol.found) {
                    lastPath = {x:resLine.index, y:resCol.index, value: this.data[resLine.index][resCol.index]}
                    if (path[path.length - 1].value > 0) {
                      path.push({x:resLine.index, y:resCol.index, value: -this.data[resLine.index][resCol.index]})
                    }else{
                      path.push({x:resLine.index, y:resCol.index, value: this.data[resLine.index][resCol.index]})
                    }
                }else{
                  badPathX.push(lastPath.x)
                }
              }else{
                badPathY.push(lastPath.y)
              }
            }
            // for (let k = 0; k < this.number_column; k++) {
            //   if (!isNaN(this.data[lastPath.x][k]) && k != lastPath.x) {
            //     current = {x: lastPath.x , y: k, value: this.data[lastPath.x][k]}
            //     if (start.x == current.x && start.y == current.y && start.value == current.value) {
            //       satisfied =  true;
            //     }
            //     // break;
            //   }
            // }
          }
        }
        console.log(satisfied);
        console.log(path);
      }
    }
  }

  findNumberInLine(lastPath: any, badPath: number[] = []){
    var res = {found: false, index: -1}
    for (let i = 0; i < this.data.length; i++) {
      const e = this.data[i][lastPath.y];
      if (!isNaN(e) && i != lastPath.x && badPath.includes(i)) {
        res = {found: true, index: i}
        break;
      }
    }
    return res
  }

  findNumberInColumn(lastPath: any, badPath: number[] = []){
    var res = {found: false, index: -1}
    for (let i = 0; i < this.data.length; i++) {
      const e = this.data[lastPath.x][i];
      if (!isNaN(e) && i != lastPath.y && badPath.includes(i)) {
        res = {found: true, index: i}
        break;
      }
    }
    return res
  }

}
