import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { linkModel } from 'src/app/models/model.link';
import { NodeModel } from 'src/app/models/model.node';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('step') step: ElementRef;
  @ViewChild('step2') step2: ElementRef;
  @ViewChild('step3') step3: ElementRef;
  public matriceForm: FormGroup;
  public showDiagram: boolean = false;
  public nodeData: Array<NodeModel> = [];
  public path: { x: number; y: number; value: number }[] = [];
  public linkData: Array<linkModel> = [];
  public number_line: number;
  public number_column: number;
  public lines: Array<number> = [];
  public columns: Array<number> = [];
  public max: any;
  public count = 0;
  public Vx: Array<any> = [];
  public Vy: Array<any> = [];
  public alfa = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  public nodeList: NodeListOf<Element>;
  public matrice: any[][] = [
    [21, 11, 84, 49, 13],
    [27, 52, 43, 29, 42],
    [11, 47, 14, 80, 93],
    [52, 14, 76, 74, 54],
  ];
  public data: any[][];
  public B: number[] = [800, 439, 50, 790, 1470];
  public R: number[] = [896, 782, 943, 928];
  ZValue: number;
  vita: boolean = false;
  line_blocked: number[];
  col_blocked: number[];
  constructor(
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.matriceForm = this.formBuilder.group({
      matrice: this.formBuilder.array([]),
    });
  }
  private initialize() {
    this.data = [];
    // this.matrice = [];
    this.nodeData = [];
    var space = 0;
    for (let i = 0; i < this.number_line; i++) {
      this.nodeData.push({
        key: i,
        text: this.alfa[i],
        loc: '100 ' + (100 + space).toString(),
      });
      this.data.push(Array(this.number_column).fill(0));
      // this.matrice.push(Array(this.number_column).fill(0));
      space += 70;
    }
    space = 0;
    for (let i = 1; i <= this.number_column; i++) {
      this.nodeData.push({
        key: this.number_line + i - 1,
        text: i.toString(),
        loc: '300 ' + (100 + space).toString(),
      });
      space += 70;
    }
    // this.R = Array(this.number_line).fill(0);
    // this.B = Array(this.number_column).fill(0);
  }
  public onGenarate() {
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
  public onCalculate() {
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
      } else {
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
            } else if (this.data[min_index][k] == 0) {
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
              this.data[k][i] = this.B[i];
            } else if (this.data[k][i] == 0) {
              this.data[k][i] = '-';
            }
          }
          this.B[i] = 0;
          i++;
        } else {
          this.data[min_index][i] = this.B[i];
          this.B[i] = 0;
          this.R[min_index] = 0;
          i++;
          break;
        }
      }
    }
    var table = document.createElement('table');
    table.setAttribute('style', 'border-collapse: collapse');
    var thead = document.createElement('thead');
    var trh = document.createElement('tr');
    trh.setAttribute('style', 'height: 50px');
    var tbody = document.createElement('tbody');
    trh.appendChild(document.createElement('th'));
    for (let i = 0; i < this.number_column; i++) {
      let th = document.createElement('th');
      th.innerText = (i + 1).toString();
      trh.appendChild(th);
    }
    thead.appendChild(trh);
    table.appendChild(thead);
    for (let i = 0; i < this.data.length; i++) {
      let tr = document.createElement('tr');
      let tdFirst = document.createElement('td');
      tdFirst.innerText = this.alfa[i];
      tdFirst.setAttribute('style', 'padding: 15px;');
      tr.appendChild(tdFirst);
      for (let j = 0; j < this.data[i].length; j++) {
        let td = document.createElement('td');
        td.setAttribute(
          'style',
          'border: 1px solid #000;padding: 15px;width: 20px;text-align:center'
        );
        td.innerText = this.data[i][j];
        tr.appendChild(td);
      }
      let tdLast = document.createElement('td');
      tdLast.setAttribute('style', 'padding: 15px');
      tdLast.innerText = this.R[i].toString();
      tr.appendChild(tdLast);
      tbody.appendChild(tr);
    }
    let trLast = document.createElement('tr');
    trLast.appendChild(document.createElement('td'));
    for (let i = 0; i < this.B.length; i++) {
      let tdLast = document.createElement('td');
      tdLast.setAttribute('style', 'padding: 15px');
      tdLast.innerText = this.B[i].toString();
      trLast.appendChild(tdLast);
    }
    tbody.appendChild(trLast);
    table.appendChild(tbody);
    this.step.nativeElement.appendChild(table);
    this.calculZValue();
  }

  // calcule Z et cherche maximun
  private calculZValue() {
    var z: number = 0;
    this.max = { value: 0, x: null, y: null };
    var tmpLinkData: Array<linkModel> = [];
    let output = 'Z = ';
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data[i].length; j++) {
        const value = this.data[i][j];

        if (!isNaN(value)) {
          tmpLinkData.push({
            from: i,
            to: this.number_line + j,
            text: this.matrice[i][j].toString(),
          });
          z += value * this.matrice[i][j];
          output += `${value}*${this.matrice[i][j]} + `;
          if (this.max.value < this.matrice[i][j]) {
            this.max = { value: this.matrice[i][j], x: i, y: j };
          }
        }
      }
    }
    this.ZValue = z as number;
    output = output.slice(0, -2);
    output += ` = ${z}`;
    let zHtml = document.createElement('div');
    zHtml.innerText = output;
    this.step2.nativeElement.appendChild(zHtml);
    this.linkData = tmpLinkData;
    this.showDiagram = true;
    var p = 0;
    while (!this.vita) {
      if (p > 0) {
        this.max = { value: 0, x: null, y: null };
        var tmpLinkData: Array<linkModel> = [];
        for (let i = 0; i < this.data.length; i++) {
          for (let j = 0; j < this.data[i].length; j++) {
            const value = this.data[i][j];
    
            if (!isNaN(value)) {
              tmpLinkData.push({
                from: i,
                to: this.number_line + j,
                text: this.matrice[i][j].toString(),
              });
              if (this.max.value < this.matrice[i][j]) {
                this.max = { value: this.matrice[i][j], x: i, y: j };
              }
            }
          }
        }
        this.linkData = tmpLinkData
      }
      this.findVxAndVy();
      
      // if (this.count > 10) {
      //   break
      // }
      p++
    }
  }
  public onInput(event: any) {
    let el = event.target;
    let idElementToArray = el.getAttribute('id').split('x');
    let lineIndex = parseInt(idElementToArray[0]);
    let colIndex = parseInt(idElementToArray[1]);
    this.matrice[lineIndex][colIndex] = isNaN(parseFloat(el.value))
      ? 0
      : parseFloat(el.value);
  }

  public onInputColumn(event: any) {
    let el = event.target;
    let idElementToArray = el.getAttribute('id').split('x');
    let colIndex = parseInt(idElementToArray[1]);
    this.B[colIndex] = isNaN(parseFloat(el.value)) ? 0 : parseFloat(el.value);
  }
  public onInputLine(event: any) {
    let el = event.target;
    let idElementToArray = el.getAttribute('id').split('x');
    let lineIndex = parseInt(idElementToArray[1]);
    this.R[lineIndex] = isNaN(parseFloat(el.value)) ? 0 : parseFloat(el.value);
  }

  findVxAndVy() {
    var { x, y } = this.max;
    console.log(this.max);
    
    this.Vx = Array(this.number_line).fill(NaN);
    this.Vy = Array(this.number_column).fill(NaN);
    let a = 0;   
    while (this.Vx.includes(NaN) || this.Vy.includes(NaN)) {
      for (let i = 0; i < this.number_line; i++) {
        for (let j = 0; j < this.number_column; j++) {
          let value = this.data[i][j];
          if (!isNaN(value) && !isNaN(this.Vy[j])) {
            this.Vx[i] = this.Vy[j] - this.matrice[i][j];
          } else if (i == x && !isNaN(value)) {
            if (j == y && isNaN(this.Vx[i])) {
              this.Vx[i] = 0;
              this.Vy[j] = this.max.value;
  
            } else if (!isNaN(this.Vx[i])){
              this.Vy[j] = this.matrice[i][j] + this.Vx[i];
              
            }
          } else {
            if (
              !isNaN(value) &&
              !isNaN(this.Vx[i]) &&
              i != x &&
              isNaN(this.Vy[j])
              ) { 
              this.Vy[j] = this.matrice[i][j] + this.Vx[i];
            }
          }
        }
      }
      if (this.count == 3 && a == 2) {
        break
      }
     a++
    }
    console.log(...this.data);
    console.log(this.Vx);
    console.log(this.Vy);
    let indexNy = this.Vx.findIndex((x => x < 0))
    let indexPy = this.Vy.findIndex((y => y < 0))
    if (indexPy == -1 || indexNy == -1) {
      this.marquage();
    }else{
      this.vita = true
    }

    this.count++
  }

  valeurAleatoire() {
    this.matrice = [];
    this.data = [];
    this.R = [];
    this.B = [];
    for (let i = 0; i < this.number_line; i++) {
      // this.matrice.push([]);
      this.R.push(this.randomNum(1, 100));
      this.data.push(Array(this.number_column).fill(0));
      for (let j = 0; j < this.number_column; j++) {
        this.matrice[i].push(this.randomNum(1, 100));
      }
    }
    for (let j = 0; j < this.number_column; j++) {
      this.B.push(this.randomNum(1, 100));
    }
  }

  randomNum(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min; // You can remove the Math.floor if you don't want it to be an integer
  }

  marquage() {
    var lamdas: { x: number; y: number; value: any }[] = [];
    var ul = document.createElement('ul');
    for (let i = 0; i < this.number_line; i++) {
      for (let j = 0; j < this.number_column; j++) {
        if (isNaN(this.data[i][j])) {
          let v = this.Vx[i] + this.matrice[i][j] - this.Vy[j];
          lamdas.push({
            x: i,
            y: j,
            value: v,
          });
          let li = document.createElement('li');
          li.setAttribute('style', 'margin: 10px;font-size: 18px;');
          if (v < 0) {
            li.setAttribute('style', 'color :red');
          }
          li.innerText = `λ(${this.alfa[i]}, ${j + 1}) = ${this.Vx[i]} + ${
            this.matrice[i][j]
          } - ${this.Vy[j]}`;
          ul.appendChild(li);
        }
      }
      let lres = document.createElement('div');
      lres.appendChild(ul);
      this.step2.nativeElement.appendChild(lres);
      lamdas = lamdas.filter((lamda) => {
        return lamda.value < 0;
      });
    }
    // let div = document.createElement('div');
    // ul = document.createElement('ul');
    if (lamdas.length === 0) {
      this.vita = true;
    }
    // for (let i = 0; i < lamdas.length; i++) {
    //   const element = lamdas[i];
      // let li = document.createElement('li');
      // li.setAttribute('style', 'margin: 10px;font-size: 18px;');
      // li.innerText = `λ(${this.alfa[element.x]}, ${element.y + 1}) = ${
      //   this.Vx[element.x]
      // } + ${this.matrice[element.x][element.y]} - ${this.Vy[element.y]}`;
      // ul.appendChild(li);
    // }
    // div.appendChild(ul);
    // this.step3.nativeElement.appendChild(div);
    
    if (lamdas.length > 0) {
      var gains: { x: number; y: number; value: number; min?: any }[] = [];
      var paths : any[] = [];
      for (let k = 0; k < lamdas.length; k++) {
        var start = { ...lamdas[k] };
        start.value = '-';
        let path = [];
        let line_blocked = [];
        let col_blocked = [];
        for (let i = 0; i < this.number_column; i++) {
          let count = 0;
          for (let j = 0; j < this.number_line; j++) {
            if (!isNaN(this.data[j][i]) || start.y == i) {
              count++;
            }
          }
          if (count < 2) { 
            col_blocked.push(i);
          }
        }
        for (let i = 0; i < this.number_line; i++) {
          let count = 0;
          for (let j = 0; j < this.number_column; j++) {
            if (!isNaN(this.data[i][j]) || start.x == i) {
              count++;
            }
          }
          if (count < 2) {
            line_blocked.push(i);
          }
        }
        path.push(start);
        let res = this.find(path, line_blocked, col_blocked);
        for (let index = 1; index < res.length; index++) {
          const element = res[index];
          if (index % 2 == 0) {
            if (res[index - 1].y != element.y) {
              res.splice(index - 1, 1);
            }
          } else {
            if (res[index - 1].x != element.x) {
              res.splice(index - 1, 1);
            }
          }
        }
        paths.push(res)
        var table = document.createElement('table');
        table.setAttribute('style', 'border-collapse: collapse');
        var thead = document.createElement('thead');
        var trh = document.createElement('tr');
        trh.setAttribute('style', 'height: 50px');
        var tbody = document.createElement('tbody');
        trh.appendChild(document.createElement('th'));
        for (let i = 0; i < this.number_column; i++) {
          let th = document.createElement('th');
          th.innerText = (i + 1).toString();
          trh.appendChild(th);
        }
        thead.appendChild(trh);
        table.appendChild(thead);
        var totalMoins = 0;
        var totalPlus = 0;
        var minMoins = 0;
        var minPlus = 0;
        for (let i = 0; i < this.data.length; i++) {
          let tr = document.createElement('tr');
          let tdFirst = document.createElement('td');
          tdFirst.innerText = this.alfa[i];
          tdFirst.setAttribute('style', 'padding: 15px;');
          tr.appendChild(tdFirst);
          for (let j = 0; j < this.data[i].length; j++) {
            let td = document.createElement('td');
            td.setAttribute(
              'style',
              'border: 1px solid #000;padding: 15px;width: 20px;text-align:center; position : relative'
            );
            let span = document.createElement('span');
            span.innerText = this.data[i][j];
            td.appendChild(span);
            let spanSign = document.createElement('span');
            
            
            let indexPath = res.findIndex((r) => r.x == i && r.y == j);            
            if (indexPath != -1) {
              spanSign.setAttribute(
                'style',
                `border: 1px solid #000;
                border-radius: 50%;
                background:yellow;
                padding: 3px;
                width: 17px;
                height: 17px;
                text-align:center;
                position: absolute;
                top: -3px;
                right: -4px;
                transform: scale(.7);`
              );
              if (indexPath % 2 == 0) {
                totalMoins += this.matrice[i][j];
                if (!isNaN(this.data[i][j])) {
                  if (minMoins > this.data[i][j]) {
                    minMoins = this.data[i][j];
                  }
                  if (minMoins == 0) {
                    minMoins = this.data[i][j];
                  }
                }
                spanSign.innerText = '-';
              } else {
                totalPlus += this.matrice[i][j];
                if (!isNaN(this.data[i][j])) {
                  if (minPlus > this.data[i][j]) {
                    minPlus = this.data[i][j];
                  }
                  if (minPlus == 0) {
                    minPlus = this.data[i][j];
                  }
                }
                spanSign.innerText = '+';
              }
            }
            td.appendChild(spanSign);
            tr.appendChild(td);
          }
          let tdLast = document.createElement('td');
          tdLast.setAttribute('style', 'padding: 15px');
          tdLast.innerText = this.R[i].toString();
          tr.appendChild(tdLast);
          tbody.appendChild(tr);
        }
        
        if (totalMoins > totalPlus) {
          gains.push({
            ...res[res.length - 1],
            min: minMoins,
            value: (totalMoins - totalPlus) * minMoins,
          });
        } if (totalMoins < totalPlus) {
          gains.push({
            ...res[res.length - 1],
            min: minPlus,
            value: (totalPlus - totalMoins) * minPlus,
          });
        }
        let trLast = document.createElement('tr');
        trLast.appendChild(document.createElement('td'));
        for (let i = 0; i < this.B.length; i++) {
          let tdLast = document.createElement('td');
          tdLast.setAttribute('style', 'padding: 15px');
          tdLast.innerText = this.B[i].toString();
          trLast.appendChild(tdLast);
        }
        tbody.appendChild(trLast);
        table.appendChild(tbody);
        let block = document.createElement('div');
        block.setAttribute(
          'style',
          'display: flex; justify-content: space-arround'
        );
        block.appendChild(table);
        block.append('minMoins'+minMoins);
        let container = document.createElement('div');
        container.appendChild(block);
        this.step3.nativeElement.appendChild(container);
      }
      var minGain = gains[0];
      var index = 0;
      for (let i = 1; i < gains.length -1; i++) {
        if (gains[i].value < minGain.value) {
          minGain = gains[i];
        }
      }
      for (let i = paths[index].length - 1; i >= 0; i--) {
        const r = paths[index][i];
        if (i == paths[index].length - 1) {
          this.data[r.x][r.y] = minGain.min;
        } else if (i % 2 == 0) {
          if (this.data[r.x][r.y] == minGain.min) {
            this.data[r.x][r.y] = '-';
          } else {
            this.data[r.x][r.y] = this.data[r.x][r.y] - minGain.min;
          }
        } else {
          this.data[r.x][r.y] = this.data[r.x][r.y] + minGain.min;
        }
      }
      
      let titleGain = document.createElement('h3');
        titleGain.innerText = `
      Gains obtenus par l’utilisation des relations de coûts marginaux négatifs
      `;
      let zElement = document.createElement('p');
      zElement.innerText = ` Z = ${this.ZValue} - ${minGain.value} = ${
        this.ZValue - minGain.value
      };`;
      let gain = document.createElement('div');
      gain.appendChild(titleGain);
      gain.appendChild(zElement);
      this.ZValue = this.ZValue - minGain.value;
      this.step3.nativeElement.appendChild(gain);
    }
  }

  find(path: any[], line_blocked: number[], col_blocked: number[]) {
    var ok = false;
    var c = 0;
   this.line_blocked  = line_blocked;
   this.col_blocked  = col_blocked;
    while (!ok) {
  
      for (let i = 0; i < this.number_column; i++) {
        if (!isNaN(this.data[path[0].x][i])) {
          if (!this.col_blocked.includes(i) && path[0].y != i) {
            let index = path.findIndex(p => p.y == i && p.x == path[0].x && p.value == this.data[path[0].x][i])
            // if (index != -1) {
              path.unshift({
                x: path[0].x,
                y: i,
                value: this.data[path[0].x][i],
              });
            // }else{
            //   line_blocked.push(path[0].x)
            //   path.splice(0,path.length - 2)
            // }
            break;
          }
        }
      }
      if (path[path.length - 1].y == path[0].y && path.length > 3) {
        
        break;
      }
      for (let i = 0; i < this.number_line; i++) {
        if (!isNaN(this.data[i][path[0].y])) {
          if (!this.line_blocked.includes(i) && path[0].x != i) {
            let index = path.findIndex(p => p.x == i && p.y == path[0].y && p.value == this.data[i][path[0].y])
            if (index == -1) {
              path.unshift({
                x: i,
                y: path[0].y,
                value: this.data[i][path[0].y],
              });
            }else{
              if (path.length%2 != 0) {
                this.col_blocked.push(path[0].y)
              }else{
                this.col_blocked.push(path[0].y + 1)
              }
              // if (path[path.length - 1].x ==2 && path[path.length - 1].y == 5) {
              //   this.col_blocked.push(2)
              // }
              path.splice(0,path.length - 2)
            }
            break;
          }
        }
      }
      if (path[path.length - 1].x == path[0].x && path.length > 3) {
        break;
      }
      
    }
    return path;
  }
}
