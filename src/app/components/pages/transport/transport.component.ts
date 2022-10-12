import { Component, OnInit } from '@angular/core';
import * as go from 'gojs';

const $ = go.GraphObject.make;

@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss']
})
export class TransportComponent /* implements OnInit */ {
  /********************************VARIABLES*******************************/
  availableCount:number=0;
  orderedCount:number=0;
  alphabets:string[]=[];
  form:any;
  costMap = new Map<string,number>();
  availableMap = new Map<number,number>();
  orderedMap = new Map<number,number>();
  costLinesMap = new Map<number,{ [key: number]: number }>();
  costColsMap = new Map<number, { [key: number]: number }>();
  minLinesMap = new Map<number, { [key: string]: string | number }>();
  minColsMap = new Map<number, { [key: string]: string | number }>();
  deltaMaxim = new Map<string,boolean|number>();
  costResult = new Map<string, number | null>();
  tree=new Map<string, Map<number,number>>();
  Z = new Map<string, any>();
  availableResult= new Map<number, number[]>();
  orderedResult= new Map<number, number[]>();
  blocked_line: number[]=[];
  blocked_col: number[]=[];
  isDone: boolean=false;
  maxCxy: any;
  nodeData: any;
  linkData: any;
  Vx: Map<number, number> = new Map();
  Vy: Map<number, number> = new Map();
  count=0;
  loop: number=0;
  /******************************************************************* */
  
  /*************************FUNCTIONS*****************************************/
  getAvail(val: number) {
    this.removeHtmlElements();
    this.alphabets=[];
    this.availableCount=val;
    let begin=65;
    for (let i = begin; i < begin+this.availableCount; i++) {
      this.alphabets.push(String.fromCharCode(i));
    } 
  }
  getOrd(val: number) {
    this.removeHtmlElements();
    this.orderedCount=val;
  }
  clearEverything() {
    this.costMap.clear();
    this.availableMap.clear();
    this.orderedMap.clear();
    this.costLinesMap.clear();
    this.costColsMap.clear();
    this.minLinesMap.clear();
    this.minColsMap.clear();
    this.deltaMaxim.clear();
    this.costResult.clear();
    this.availableResult.clear();
    this.orderedResult.clear();
  }
  removeHtmlElements() {
    let sBase = document.getElementById("sBase") as HTMLElement;
    while (sBase.hasChildNodes()) {  
      sBase.removeChild(sBase.firstChild!);
    }

    let sOpt = document.getElementById("sOpt") as HTMLElement;
    while (sOpt.hasChildNodes()) {  
      sOpt.removeChild(sOpt.firstChild!);
    }

    let m_div = document.getElementById('mainDiv');
    let transport= document.getElementById('transport')  as HTMLElement;
    if (m_div) {
      m_div.remove();
    }
    while (transport.hasChildNodes()) {  
      transport.removeChild(transport.firstChild!);
    }
    
     let optimal= document.getElementById('optimal')  as HTMLElement;
    while (optimal.hasChildNodes()) {  
      optimal.removeChild(optimal.firstChild!);
    }
  }

  onSubmit(_form:any){
    this.form=_form
    /*** initialize maps ****/
    this.clearEverything();
    
    /************************/
    for (let i = 0; i < this.availableCount; i++) {
      for (let j = 0; j < this.orderedCount; j++) {
        this.costMap.set(`${i}${j}`,_form["costInputR"+i+"C"+j]);
        this.costResult.set(`${i}${j}`,null);
      }
      this.availableMap.set(i,_form["availableInputR"+i]);
    }
    for (let k = 0; k < this.orderedCount; k++) {
      this.orderedMap.set(k,_form["askedInputC"+k]);
    }
    for (let index = 0; index < this.availableCount; index++) {
      this.availableResult.set(index, [this.availableMap.get(index)!]);
    }
    for (let index = 0; index < this.orderedCount; index++) {
      this.orderedResult.set(index, [this.orderedMap.get(index)!]);
    }
    //CREATE DOCUMENT
  
    this.createAndShowCostTable()

    //cost per line
    for (let line = 0; line < this.availableCount; line++) {
      let tempLineObj: { [key: number]: number }={};
      for (let col = 0; col <this.orderedCount; col++) {
        tempLineObj[col] = this.costMap.get(`${line}${col}`)!;
      }
      this.costLinesMap.set(line,tempLineObj);
    }
    //cost per column
    for (let col = 0; col < this.orderedCount; col++) {
      let tempColObj: { [key: number]: number }={};
      for (let line = 0; line < this.availableCount; line++) {
        tempColObj[line] = this.costMap.get(`${line}${col}`)!;
      }
      this.costColsMap.set(col,tempColObj);
    }
    while (true) {
      if (this.costLinesMap.size<=0 && this.costColsMap.size<=0) {
        break;
      }
      let maxInLine: number = -Infinity;
      let maxInCol: number = -Infinity;
      let lineOfMax: number = Infinity;
      let colOfMax: number = Infinity;
      if (this.costLinesMap.size > 0) {
        this.minLinesMap = this.diffBetween2Mins(this.availableCount, this.orderedCount, this.costLinesMap);
        for (let index = 0; index < this.availableCount; index++) {
          if (!this.minLinesMap.has(index)) {
            continue;
          }
          if (this.minLinesMap.get(index)!['delta']>maxInLine) {
            maxInLine = +this.minLinesMap.get(index)!['delta'];
            lineOfMax = index;
          }
        }
      }
      if (this.costColsMap.size > 0) {
        this.minColsMap = this.diffBetween2Mins(this.orderedCount, this.availableCount, this.costColsMap);
        for (let index = 0; index < this.orderedCount; index++) {
            if (!this.minColsMap.has(index)) {
              continue;
            }
            if (this.minColsMap.get(index)!['delta']>maxInCol) {
              maxInCol = +this.minColsMap.get(index)!['delta'];
              colOfMax = index;
            }
        }
      }
      if (maxInLine>=maxInCol) {
        this.deltaMaxim = this.deltaMax(this.orderedCount, maxInLine, this.costLinesMap, lineOfMax, true);
      } else if(maxInCol>=maxInLine){
        this.deltaMaxim = this.deltaMax(this.availableCount, maxInCol, this.costColsMap, colOfMax, false);
      }
      this.createAndShowMinTable(this.minLinesMap,this.minColsMap,this.deltaMaxim);
      this.calculateCost(this.deltaMaxim, this.availableMap, this.orderedMap, this.costResult,this.availableCount, this.orderedCount,this.costLinesMap, this.costColsMap);
      
    }
    this.degenerateCase();
    this.calculateZ();
  }
  calculateZ() {
    let z: number = 0;
    let formula: string = "";
    this.maxCxy = { value: -Infinity, x: null, y: null };
    for (let i = 0; i < this.availableCount; i++) {

      for (let index = 0; index < this.orderedCount; index++) {
        const value = this.costResult.get(`${i}${index}`);
        if (value !== null) {
          if (formula.length === 0) {
            formula += (this.costResult.get(`${i}${index}`)! + '*' + this.costMap.get(`${i}${index}`)!);
          } else {
            formula += '+' + (this.costResult.get(`${i}${index}`)! + '*' + this.costMap.get(`${i}${index}`)!);
          }
          z += (this.costResult.get(`${i}${index}`)! * this.costMap.get(`${i}${index}`)!);
          const cost = this.costMap.get(`${i}${index}`)!;
          if (this.maxCxy.value < cost) {
            this.maxCxy = { value: cost, x: i, y: index };
          }
        }
      }
    }
    this.Z.set('formula', formula);
    this.Z.set('value', z);
    console.log(this.Z);
      this.showResTable();
    var p = 0;
    while (!this.isDone) {
      if (p > 0) {
        this.maxCxy = { value: 0, x: null, y: null };
        for (let i = 0; i < this.availableCount; i++) {
          for (let index = 0; index < this.orderedCount; index++) { 
            const value = this.costResult.get(`${i}${index}`);
            if (value !== null) {
              const cost = this.costMap.get(`${i}${index}`)!;
              if (this.maxCxy.value < cost) {
                this.maxCxy = { value: cost, x: i, y: index };
              }
            }
          }
        }
      }
      console.log("before")
      console.log(this.costResult)
      this.calculateVxVy(p);
      console.log("after")
      console.log(this.costResult)
      p++;
    }
  }
  calculateVxVy(p:number) {
    let a = 0;
    this.Vx.clear();
    this.Vy.clear();
    while (this.Vx.size != this.availableCount || this.Vy.size != this.orderedCount) {
      for (let i = 0; i < this.availableCount; i++) {
        for (let j = 0; j < this.orderedCount; j++) {
          let value = this.costResult.get(`${i}${j}`);
          if (value != null && this.Vy.has(j)) {
            this.Vx.set(i, this.Vy.get(j)! - this.costMap.get(`${i}${j}`)!);
          } else if (i == this.maxCxy.x && value != null) {
            if (j == this.maxCxy.y && !this.Vx.has(i)) {
              this.Vx.set(i, 0);
              this.Vy.set(j, this.maxCxy.value);
            } else if(this.Vx.has(i)) {
              this.Vy.set(j, this.costMap.get(`${i}${j}`)! + this.Vx.get(i)!);
            }
          } else {
            if (
              value != null &&
              this.Vx.has(i) &&
              i != this.maxCxy.x &&
              !this.Vy.has(j)
            ) {
              this.Vy.set(j, this.costMap.get(`${i}${j}`)! + this.Vx.get(i)!);
            }
          }
        }
      }
      if (this.count == 3 && a == 2) {
        break;
      }
      console.log("a : "+ a);
      a++;
    }
    this.createAndShowTree(p);
    console.log(this.Vx)
    console.log(this.Vy)
    let hasNegVx = false;
    let hasNegVy = false;
    for (let [key,value] of this.Vx){
      if (value < 0) {
        hasNegVx = true;
        break;
      }
    }
    for (let [key,value] of this.Vy){
      if (value < 0) {
        hasNegVy = true;
        break;
      }
    }
    if (!hasNegVy || !hasNegVx) {
    
        this.marking();
      
    } else {
      this.isDone = true;
        console.log("vitaaaaaa")

    }
    this.loop++;
    this.count++;
  }

  marking() {
    let neg_delta_xy: { line: number, col: number, delta: any }[] = [];
    let transport = document.getElementById('transport') as HTMLElement;
    let main_div = document.createElement('div');
    main_div.setAttribute('class', 'col-sm-4 col-md-4');
    let p = document.createElement('p');
    p.innerHTML = "Relations de coûts marginaux"
    main_div.append(p);
    let ul = document.createElement('ul');
    for (let i = 0; i < this.availableCount; i++) {
      for (let j = 0; j < this.orderedCount; j++) {
        let value = this.costResult.get(`${i}${j}`);
        if (value == null) {
          let li = document.createElement('li');
          let d = this.Vx.get(i)! + this.costMap.get(`${i}${j}`)! - this.Vy.get(j)!;
          //show deltas
          if (d < 0) {
            li.style.color = 'red';
            neg_delta_xy.push({ line: i, col: j, delta: d });
          }
          li.innerHTML = "&delta;( " + this.alphabets[i] + " , " + (j + 1) + " ) = " + d;
          ul.append(li);
        }
      }
    }
    main_div.append(ul);
    transport.append(main_div);
      if (neg_delta_xy.length == 0) {
        console.log("no neg deltaxy")
        this.isDone = true;
        console.log("vitaaaaaa")
        }
        //if there's a negative marginal cost
      if (neg_delta_xy.length > 0) {
    let gains: { line: number; col: number; value: number; min?: any }[] = [];
    //loop through it:for each negative marginal cost
    let mark_paths: any[] = [];
    for (let index = 0; index < neg_delta_xy.length; index++) {
      let start = { ...neg_delta_xy[index] };
      start.delta = '-';
      let path = [];
      let blocked_line = [];
      let blocked_col = [];
      for (let i = 0; i < this.orderedCount; i++) {
        let count = 0;
        for (let j = 0; j < this.availableCount; j++) {
          if (this.costResult.get(`${j}${i}`) != null || start.col == i) {
            count++;
          }
        }
        if (count < 2) {
          blocked_col.push(i);
        }
      }
      for (let i = 0; i < this.availableCount; i++) {
        let count = 0;
        for (let j = 0; j < this.orderedCount; j++) {
          if (this.costResult.get(`${i}${j}`) != null || start.line == i) {
            count++;
          }
        }
        if (count < 2) {
          blocked_line.push(i);
        }
      }
      path.push(start);
      let res = this.find(path, blocked_line, blocked_col);
      for (let index = 1; index < res.length; index++) {
        const element = res[index];
        if (index % 2 == 0) {
          if (res[index - 1].col != element.col) {
            res.splice(index - 1, 1);
          }
        } else {
          if (res[index - 1].line != element.line) {
            res.splice(index - 1, 1);
          }
        }
      }
      mark_paths.push(res);
      let minusTotal = 0;
      let plusTotal = 0;
      let minusMin = 0;
      let plusMin = 0;
      for (let i = 0; i < this.availableCount; i++) {
        for (let j = 0; j < this.orderedCount; j++) {
          let pathIndex = res.findIndex((r) => r.line == i && r.col == j);
          if (pathIndex != -1) {
            if (pathIndex % 2 == 0) {
              minusTotal += this.costMap.get(`${i}${j}`)!;
              if (this.costResult.get(`${i}${j}`) != null) {
                if (minusMin > this.costResult.get(`${i}${j}`)!) {
                  minusMin = this.costResult.get(`${i}${j}`)!;
                }
                if (minusMin == 0) {
                  minusMin = this.costResult.get(`${i}${j}`)!;
                }
              }
              res[pathIndex].sign = '-';
            } else {
              plusTotal += this.costMap.get(`${i}${j}`)!;
              if (this.costResult.get(`${i}${j}`) != null) {
                if (plusMin > this.costResult.get(`${i}${j}`)!) {
                  plusMin = this.costResult.get(`${i}${j}`)!;
                }
                if (plusMin == 0) {
                  plusMin = this.costResult.get(`${i}${j}`)!;
                }
              }
              res[pathIndex].sign = '+';
            }
          }

        }
      }
    
         if ((plusTotal-minusTotal)==neg_delta_xy[index].delta) {
        gains.push({
          ...res[res.length - 1],
         min: minusMin,
          value: (plusTotal-minusTotal) * minusMin,
        });
      }
      
      console.log(res);
      this.showMarkingTable(res);
      
    }
    console.log("gains =>")
    console.log(gains)
    let minGain = gains[0];
    let index = 0;
    for (let i = 1; i < gains.length - 1; i++) {
      if (gains[i].value < minGain.value) {
        minGain = gains[i];
      }
    }
        let divGain = document.createElement("div");
        divGain.setAttribute('class',"col-sm-4")
        let ulGain = document.createElement("ul");
        for (let i = 0; i < gains.length; i++) {
          let li = document.createElement("li");
          if (minGain == gains[i]) {
            li.style.color = "red";
          }
          li.innerHTML = "gain( " + this.alphabets[gains[i].line] + " , " + (gains[i].col + 1 )+ " ) = " + gains[i].value;
          ulGain.append(li);
        }
        divGain.append(ulGain)
        transport.append(divGain);
        console.log("mingain")
        console.log(minGain)
    //BUG
        console.log("mark_paths:=>")
        console.log(mark_paths)
    for (let i = mark_paths[index].length - 1; i >= 0; i--) {
      const r = mark_paths[index][i];
      if (i == mark_paths[index].length - 1) {
        //new_cost
        this.costResult.set(`${r.line}${r.col}`, minGain.min);
      } else if (i % 2 == 0) {
        if (this.costResult.get(`${r.line}${r.col}`) == minGain.min) {
          this.costResult.set(`${r.line}${r.col}`, null);
        } else {
          this.costResult.set(`${r.line}${r.col}`, this.costResult.get(`${r.line}${r.col}`)! - minGain.min);
        }
      } else {
        this.costResult.set(`${r.line}${r.col}`, this.costResult.get(`${r.line}${r.col}`)! + minGain.min);
      }
    }
    let new_z: number = this.Z.get('value') + minGain.value;
    this.Z.set('formula',this.Z.get('value')+""+minGain.value)
    this.Z.set('value', new_z);
    this.showResTable();
    
  } 
  }
  showResTable() {
     let transport = document.getElementById('transport') as HTMLElement;
    let main_div = document.createElement('div');
        let main_table = document.createElement('table');
        let main_thead = document.createElement('thead');
        let main_tr0 = document.createElement('tr');
        let main_th0 = document.createElement('th');
        let main_th2 = document.createElement('th');
        let main_tbody = document.createElement('tbody');
        main_table.setAttribute('class', 'table table-borderless');
        main_div.setAttribute('class', 'table-responsive-sm col-sm-4');
        main_div.setAttribute('id', 'mainDiv');
        main_tr0.append(main_th0);
        for (let k = 0; k < this.orderedCount; k++) {
          let th1 = document.createElement('th');
          th1.setAttribute('class', 'small');
          th1.innerHTML =''+ (k + 1);
          main_tr0.append(th1);
        }
        main_tr0.append(main_th2);
        main_thead.append(main_tr0);
        main_table.append(main_thead);
        for (let k1 = 0; k1 < this.availableCount; k1++) {
          let tr1 = document.createElement('tr');
          let td1 = document.createElement('td');
          td1.setAttribute('class', 'small');
          td1.style.fontWeight = 'bold';
          td1.innerHTML =this.alphabets[k1];
          tr1.append(td1);
          for (let k2 = 0; k2 < this.orderedCount; k2++) {
            let td2 = document.createElement('td');
            td2.setAttribute('style', 'border:1px solid grey;width:60px;height:40px;');
            if (this.costResult.get(`${k1}${k2}`)==Number.EPSILON) {
              td2.innerHTML = "ε";
            } else {
              
              td2.innerHTML =this.costResult.get(`${k1}${k2}`)?''+this.costResult.get(`${k1}${k2}`):'-';
            }
            tr1.append(td2);
          }
          main_tbody.append(tr1);
        }
        main_table.append(main_tbody);
        main_div.append(main_table);
        let p = document.createElement('p');
        p.innerHTML = 'Z = ' + this.Z.get('formula') + ' = ' + this.Z.get('value');
        main_div.append(p)
        transport.append(main_div);

  }
  createAndShowTree(p: number) {
    console.log("p :" + p)
    console.log(this.costResult)
    let transport = document.getElementById('transport') as HTMLElement;
    //DIAGRAM
    let divDiag = document.createElement('div');
    divDiag.setAttribute('class', 'col-sm-8 col-md-8');
    divDiag.setAttribute('id', 'myDiagram-'+p);
    transport.append(divDiag)
    //GOJS
    let diagram = $(go.Diagram, 'myDiagram-'+p);
    diagram.nodeTemplateMap.add("node",
      $(go.Node, "Spot", new go.Binding("location","loc",go.Point.parse),
        $(go.Panel, "Auto", { alignment: go.Spot.Right },
          $(go.Shape, "Circle",
            { strokeWidth: 1 ,fill: "white" }
          ),
          $(go.TextBlock,
            { margin: 8 },
            new go.Binding("text", "key")
          )
        )
        ,
        $(go.Panel,"Auto",new go.Binding("alignment","V_align"),
          $(go.Shape, "Circle",
            { strokeWidth: 0,fill: "transparent"}
          ),
          $(go.TextBlock,
            // { margin: new go.Margin(0,18,0,0) },
            new go.Binding("margin","V_marg"),
            new go.Binding("text", "V_text")
            // "Vx/Vy"
          )
        )
      )
    );
    
    diagram.linkTemplateMap.add("link",
      $(go.Link,
        {curve:go.Link.Bezier},
        $(go.Shape),
        $(go.Shape, { toArrow: "Standard" }),
        $(go.TextBlock,new go.Binding("text","text_link"),{segmentOffset:new go.Point(0,5)})
      )
    );
    let treeArr = [];
    let fromTo = [];
    for (let index = 0; index < this.orderedCount; index++) {
      treeArr.push(
        { key: index + 1, V_text: this.Vy.get(index), V_align: go.Spot.Right, V_marg: new go.Margin(0, 0, 0, 18), category: 'node' ,loc:"300 "+(70*index)+""},
      );
        
    }
      for (let i = 0; i < this.availableCount; i++) {
        treeArr.push(
          { key: this.alphabets[i],V_text: this.Vx.get(i), V_align: go.Spot.Left, V_marg: new go.Margin(0, 18, 0, 0), category: "node", loc:"0 "+(90*i)+""}
        );
        for (let j = 0; j < this.orderedCount; j++) {
          if (this.costResult.get(`${i}${j}`)!=null) {
            let value = this.costMap.get(`${i}${j}`);
            fromTo.push({ to: j + 1, from: this.alphabets[i], text_link: value, category: "link" });
          }
        }
      }
    
    diagram.model = new go.GraphLinksModel(
      treeArr,
      fromTo
      );
  }
  showMarkingTable(paths:any[]) {
    let transport = document.getElementById('transport') as HTMLElement;
    let main_div = document.createElement('div');
    let main_table = document.createElement('table');
    let main_thead = document.createElement('thead');
    let main_tr0 = document.createElement('tr');
    let main_th0 = document.createElement('th');
    let main_th2 = document.createElement('th');
    let main_tbody = document.createElement('tbody');
    main_table.setAttribute('class', 'table table-borderless');
    main_div.setAttribute('class', 'table-responsive-sm col-sm-4');
    main_div.setAttribute('id', 'mainDiv');
      main_tr0.append(main_th0);
      for (let k = 0; k < this.orderedCount; k++) {
        let th1 = document.createElement('th');
        th1.setAttribute('class', 'small');
        th1.innerHTML =''+ (k + 1);
        main_tr0.append(th1);
      }
      main_tr0.append(main_th2);
      main_thead.append(main_tr0);
      main_table.append(main_thead);
      for (let k1 = 0; k1 < this.availableCount; k1++) {
        let tr1 = document.createElement('tr');
        let td1 = document.createElement('td');
        td1.setAttribute('class', 'small');
        td1.style.fontWeight = 'bold';
        td1.innerHTML =this.alphabets[k1];
        tr1.append(td1);
        for (let k2 = 0; k2 < this.orderedCount; k2++) {
          let td2 = document.createElement('td');
          td2.setAttribute('style', 'border:1px solid grey;width:60px;height:40px;');
          if (this.costResult.get(`${k1}${k2}`) == Number.EPSILON) {
            td2.innerHTML = "ε";
          } else {
              
            td2.innerHTML = this.costResult.get(`${k1}${k2}`) ? '' + this.costResult.get(`${k1}${k2}`) : '-';
          }
          paths.forEach(element => {
            if (element.line == k1 && element.col == k2 && (element.delta == this.costResult.get(`${k1}${k2}`)  || element.delta == '-')) {
              let p = document.createElement("p");
              p.style.width = "15px";
              p.style.height = "17px";
              p.style.borderRadius = "100%";
              p.style.backgroundColor = 'red';
              p.style.color = "white";
              p.style.fontWeight = "bold";
              p.style.fontSize = "13px";
              p.style.float = "right";
              p.style.marginTop = "-7px";
              p.style.marginRight = "-7px";
              p.innerHTML += element.sign;
              td2.append(p);
            }
          });
          tr1.append(td2);
        }
        main_tbody.append(tr1);
      }
      main_table.append(main_tbody);
      main_div.append(main_table);
      transport.append(main_div);

  }
  degenerateCase() {
    let arcNb: number = 0;
    let nbElemEachLine = [];
     for (let i = 0; i < this.availableCount; i++) {
      let nb = 0;
      for (let j = 0; j < this.orderedCount; j++) {
        if (this.costResult.get(`${i}${j}`) != null) {
          nb += 1;
        }
      }
       nbElemEachLine.push(nb);
       arcNb += nb;
     }
     if ((this.availableCount + this.orderedCount - 1) > arcNb) {
      console.log("cas degenere")
      console.log(arcNb)
      console.log(nbElemEachLine);
      let col = [];
      for (let i = 0; i < this.orderedCount; i++) {
        let count = { i: 0, line: 0, col: 0 };
        for (let j = 0; j < this.availableCount; j++) {
          const element = this.costResult.get(`${j}${i}`);
          if (element!=null) {
            count.i++;
            count.line = j;
            count.col = i;
          }
        }
        if (count.i < 2) {
          col.push({ ...count });
        }
      }
      //let r = Math.floor(Math.random() * col.length);
      const max = Math.max(...nbElemEachLine);
      if (this.loop < 1) {
         var index = nbElemEachLine.indexOf(max);
       } else {
        var index = 1;
       }
      for (let i = 0; i < col.length; i++) {
        const element = col[i];
        if (this.costResult.get(`${index}${element.col}`) == null) {
          this.costResult.set(`${index}${element.col}`, Number.EPSILON);
          break;
        }
      }
    }
    

  }
  find(path: any[], blocked_line: number[], blocked_col: number[]) {
    let ok = false;
    this.blocked_line = blocked_line;
    this.blocked_col = blocked_col;
    while (!ok) {
      for (let i = 0; i < this.orderedCount; i++) {
        if (this.costResult.get(`${path[0].line}${i}`) != null) {
          if (!this.blocked_col.includes(i) && path[0].col != i) {
            let index = path.findIndex(p => p.col == i && p.line == path[0].line && p.delta == this.costResult.get(`${path[0].line}${i}`));
            path.unshift({
              line: path[0].line,
              col: i,
              delta: this.costResult.get(`${path[0].line}${i}`),
            });
            break;
          }
        }
      }
      if (path[path.length - 1].col == path[0].col && path.length > 3) {
        break;
      }
      for (let i = 0; i < this.alphabets.length; i++) {
        if (this.costResult.get(`${i}${path[0].col}`) != null) {
          if (!this.blocked_line.includes(i) && path[0].line != i) {
            let index = path.findIndex(p => p.line == i && p.col == path[0].col && p.delta == this.costResult.get(`${i}${path[0].col}`));
            if (index == -1) {
              path.unshift({
                line: i,
                col: path[0].col,
                delta:this.costResult.get(`${i}${path[0].col}`),
              });
            } else {
              if (path.length % 2 != 0) {
                this.blocked_col.push(path[0].col);
              } else {
                this.blocked_col.push(path[0].col + 1);
              }
              path.splice(0, path.length - 2)
            }
            break;
          }
        }
      }
      if (path[path.length - 1].line == path[0].line && path.length > 3) {
        break;
      }
    }
    return path;
  }
  diffBetween2Mins(N1:number,N2:number,costs:Map<number,{ [key: number]: number }>){
    //FOR LINES : N1:available,N2:ordered,n1:col number 1,n2:col number 2,i:line,j and k : cols
    //FOR COLUMNS : N1:ordered,N2:available,n1:line number 1,n2:line number 2,i:col,j and k : lines
    let mins = new Map<number, { [key: string]: string | number }>();
    //choose 2 mins for each rows/cols
    for (let i = 0; i < N1; i++) {
      let min1=Infinity;
      let min2 = Infinity;
      let min = Infinity;
      let n1:number=0;
      let n2: number = 0;
      if (!costs.has(i)) {
        continue;
      }
      for (let j = 0; j < N2; j++) {
         if (costs.get(i)![j]===undefined) {
        continue;
        }
        if((costs.get(i)![j])<min1){
          min1=costs.get(i)![j];
          n1=j;
        }
      }
      for (let k = 0; k < N2; k++) {
         if (costs.get(i)![k]===undefined) {
          continue;
        }
        if((n1!==k )&& (costs.get(i)![k])>=min1 && (costs.get(i)![k])<min2){
          min2=costs.get(i)![k];
          n2=k
          }
      }
     
      if (min1===Infinity && min2!==Infinity) {
        min = min2;
        n1=n2
      } else if (min2===Infinity && min1!==Infinity) {
        min = min1;
        n2 = n1;
      } else {
        min = min2 - min1;
      }
      
      //add elem to mins
      mins.set(i,{'min1':`${i}${n1}`,'min2':`${i}${n2}`,'delta':min});
     
    }
    return mins;
  }
  deltaMax(N:number,max:number,costs:Map<number,{ [key: number]: number }>,index1:number,isInLine:boolean
    ){
      //FOR LINE:index1:line number,inLine=true,N:demande,max=lineMax,index2:col number
      //FOR Col:index1:col number,inLine=false,N:dispo,max=colMax,index2:line number

    let delta=new Map<string, boolean | number>();
    let costMin:number=Infinity;
    let index2:number=Infinity;
    for (let i = 0; i < N; i++) {
      //choose the min cost in that line/col
      if (!costs.has(index1) || costs.get(index1)![i]===undefined) {
        continue;
      }
      if (costs.get(index1)![i]<costMin) {
        costMin = costs.get(index1)![i];
        index2=i;
      }
    }
    delta.set('isInLine',isInLine);
    delta.set('deltaMax',max);
    delta.set('value',costMin);
    if (isInLine===true) {
      delta.set('lineNumber',index1);
      delta.set('colNumber',index2);
    }else{
      delta.set('lineNumber',index2);
      delta.set('colNumber',index1);
    }
    return delta;
  }
  calculateCost(
    delta_max:Map<string,boolean|number>,
    avail_map:Map<number,number>,
    ord_map:Map<number,number>,
    new_cost: Map<string, number | null>,
    N1: number,
    N2: number,
    costLines:Map<number,{ [key: number]: number }>,
    costCols:Map<number,{ [key: number]: number }>
    )
  {
    let l:number=+delta_max.get('lineNumber')!;
    let c:number=+delta_max.get('colNumber')!;
    let avail:number=avail_map.get(l)!;
    let ord: number = ord_map.get(c)!;
    let newAvail:number=0;
    let newAsked:number=0;
    let newCost:number=0;
    if (avail<ord) {
      newCost=avail;
      newAvail=0;
      newAsked = ord - avail;
      costLines.delete(l);
      for (let index = 0; index < N2; index++) {
        if (!costCols.has(index)) {
          continue;
        }
        if (costCols.get(index)![l]===undefined) {
          continue;
        }
        delete (costCols.get(index)![l]);
      }
    }else if(ord<avail){
      newCost=ord;
      newAvail=avail-ord;
      newAsked = 0;
      costCols.delete(c);
      for (let index = 0; index < N1; index++) {
        if (!costLines.has(index)) {
          continue;
        }
        if (costLines.get(index)![c]===undefined) {
          continue;
        }
        delete (costLines.get(index)![c])
      }
    }else{
      newCost = avail | ord;
      costLines.delete(l);
       for (let index = 0; index < N2; index++) {
        if (!costCols.has(index)) {
          continue;
        }
          if (costCols.get(index)![l]===undefined) {
          continue;
        }
        delete (costCols.get(index)![l]);
      }
      costCols.delete(c);
        for (let index = 0; index < N1; index++) {
        if (!costLines.has(index)) {
          continue;
        }
        if (costLines.get(index)![c]===undefined) {
          continue;
        }
        delete (costLines.get(index)![c])
      }
    }
    for (let index = 0; index < N1; index++) {
      if (!costLines.has(index)) {
        continue;
      }
      let x = costLines.get(index) as object;
      if (Object.keys(x).length===0) {
        costLines.delete(index);
      }
    }
    for (let index = 0; index < N2; index++) {
      if (!costCols.has(index)) {
        continue;
      }
      let x = costCols.get(index) as object;
      if (Object.keys(x).length === 0) {
        costCols.delete(index);
      }
    }
    new_cost.set(`${l}${c}`, newCost);
    if (this.availableResult.has(l)) {
        this.availableResult.get(l)!.push(newAvail);
    } else {
        this.availableResult.set(l,[newAvail]);
      
    }
    if (this.orderedResult.has(c)) {
        this.orderedResult.get(c)!.push(newAsked);
    } else {
        this.orderedResult.set(c,[newAsked]);
      
    }
    this.createAndShowResult(new_cost,this.availableResult,this.orderedResult);
    avail_map.set(l,newAvail);
    ord_map.set(c, newAsked);
  
  }
  createAndShowResult(
    new_cost: Map<string, number | null>,
    newAvail: Map<number, number[]>,
    newAsked: Map<number, number[]>
  ) {
        let transport= document.getElementById('transport')  as HTMLElement;
        let main_div = document.createElement('div');
        let main_p = document.createElement('p');
        let main_table = document.createElement('table');
        let main_thead = document.createElement('thead');
        let main_tr0 = document.createElement('tr');
        let main_th0 = document.createElement('th');
        let main_th2 = document.createElement('th');
        let main_tbody = document.createElement('tbody');
        main_table.setAttribute('class', 'table table-borderless');
        main_div.setAttribute('class', 'table-responsive-sm col-sm-4');
        main_div.setAttribute('id', 'mainDiv');
        main_p.innerHTML = 'Quantités effectivement transportées';
        main_div.append(main_p);
        main_tr0.append(main_th0);
        for (let k = 0; k < this.orderedCount; k++) {
          let th1 = document.createElement('th');
          th1.setAttribute('class', 'small');
          th1.innerHTML =''+ (k + 1);
          main_tr0.append(th1);
        }
        main_tr0.append(main_th2);
        main_thead.append(main_tr0);
        main_table.append(main_thead);
        for (let k1 = 0; k1 < this.alphabets.length; k1++) {
          let tr1 = document.createElement('tr');
          let td1 = document.createElement('td');
          td1.setAttribute('class', 'small');
          td1.style.fontWeight = 'bold';
          td1.innerHTML =this.alphabets[k1];
          tr1.append(td1);
          for (let k2 = 0; k2 < this.orderedCount; k2++) {
            let td2 = document.createElement('td');
            td2.setAttribute('style', 'border:1px solid grey;width:60px;height:40px;');
            td2.innerHTML =new_cost.get(`${k1}${k2}`)?''+new_cost.get(`${k1}${k2}`):'-';
            tr1.append(td2);
          }
          
          if (newAvail.has(k1)) {
            for (let index = 0; index < newAvail.get(k1)!.length; index++) {
              let td4 = document.createElement('td');
              if (index === 0) {
                td4.style.color = 'green';
              } else {
                td4.style.color = 'purple';
              }
              td4.innerHTML = '' + newAvail.get(k1)![index];
              tr1.append(td4);
            }
          }
          main_tbody.append(tr1);
        }
          let tds = [];
          let first_tr = document.createElement('tr');
          let first_td = document.createElement('td');
          tds.push(first_td);
          for (let k = 0; k < this.orderedCount; k++) {
            if (newAsked.has(k)) {
              let tdk = tds[k] as HTMLTableCellElement;
              for (let index = 0; index < newAsked.get(k)!.length; index++) {
                let p = document.createElement('p');
                if (index === 0) {
                  p.style.color = 'green';
                  if (k===0) {
                    let td = document.createElement('td');
                    first_tr.append(td);
                  }
                } else {
                  p.style.color = 'purple';
                }  
                p.innerHTML = '' + newAsked.get(k)![index];
                tdk.append(p);
              }
              first_tr.append(tdk);
              let td = document.createElement('td');
              tds.push(td);
            }
            
          }
        main_tbody.append(first_tr);
        main_table.append(main_tbody);
        main_div.append(main_table);
        transport?.append(main_div);
   
  }
  createAndShowCostTable() {
    this.removeHtmlElements();
    /**************** **********/
    let sBase = document.getElementById("sBase") as HTMLElement;
    sBase.style.backgroundColor = "lightgrey";
    let center = document.createElement("center");
    let h5 = document.createElement("h5");
    h5.innerHTML = "Différence maximale (Algorithme de Balas Hammer)";
    h5.style.fontWeight = "bold";
    center.append(h5);
    sBase.append(center);
    let transport= document.getElementById('transport')  as HTMLElement;
    /************************ */
    let div = document.createElement('div');
    let p = document.createElement('p');
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tr0 = document.createElement('tr');
    let tr2 = document.createElement('tr');
    let th0 = document.createElement('th');
    let th2 = document.createElement('th');
    let tbody = document.createElement('tbody');
    let td = document.createElement('td');
    table.setAttribute('class', 'table table-borderless');
    div.setAttribute('class', 'table-responsive-sm col-sm-4');
    p.innerHTML = 'Tableau des coûts unitaires de transport';
    div.append(p);
    tr0.append(th0);
    for (let k = 0; k < this.orderedCount; k++) {
      let th1 = document.createElement('th');
      th1.setAttribute('class', 'small');
      th1.innerHTML =''+ (k + 1);
      tr0.append(th1);
    }
    tr0.append(th2);
    thead.append(tr0);
    table.append(thead);
    for (let k1 = 0; k1 < this.alphabets.length; k1++) {
    let tr1 = document.createElement('tr');

      let td1 = document.createElement('td');
      td1.setAttribute('class', 'small');
      td1.style.fontWeight = 'bold';
      td1.innerHTML =this.alphabets[k1];
      tr1.append(td1);
      for (let k2 = 0; k2 < this.orderedCount; k2++) {
        let td2 = document.createElement('td');
        td2.setAttribute('style', 'border:1px solid grey;width:60px;height:40px;');
        td2.innerHTML =''+this.costMap.get(`${k1}${k2}`);
        tr1.append(td2);
      }
       let td3 = document.createElement('td');
      td3.innerHTML =''+this.availableMap.get(k1);
      tr1.append(td3);
      tbody.append(tr1);
    }
    tr2.append(td);
    for (let k = 0; k < this.orderedCount; k++) {
      let td = document.createElement('td');
      td.innerHTML = '' + this.orderedMap.get(k);
      tr2.append(td);
    }
    tbody.append(tr2);
    table.append(tbody);
    div.append(table);
    transport?.append(div);
  }
  createAndShowMinTable(minLines: Map<number, { [key: string]: string | number }>,
    minCols: Map<number, { [key: string]: string | number }>,
    deltaMax: Map<string, boolean | number>
  ) {
    let transport= document.getElementById('transport')  as HTMLElement;
    let div = document.createElement('div');
    let p = document.createElement('p');
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tr0 = document.createElement('tr');
    let tr2 = document.createElement('tr');
    let th0 = document.createElement('th');
    let th2 = document.createElement('th');
    let tbody = document.createElement('tbody');
    let td = document.createElement('td');
    table.setAttribute('class', 'table table-borderless');
    div.setAttribute('class', 'table-responsive-sm col-sm-4');
    p.innerHTML = 'Différence entre les 2 coûts les plus petit';
    div.append(p);
    tr0.append(th0);
    for (let k = 0; k < this.orderedCount; k++) {
      let th1 = document.createElement('th');
      th1.setAttribute('class', 'small');
      th1.style.height = '40px';
      if (this.costColsMap.has(k)) {
        th1.innerHTML =''+ (k + 1);
      }
      tr0.append(th1);
    }
    tr0.append(th2);
    thead.append(tr0);
    table.append(thead);
    for (let k1 = 0; k1 < this.alphabets.length; k1++) {
      let tr1 = document.createElement('tr');

      let td1 = document.createElement('td');
      td1.setAttribute('class', 'small');
      td1.style.height = '40px';
      td1.style.fontWeight = 'bold';
       if (this.costLinesMap.has(k1)) {
          td1.innerHTML =this.alphabets[k1];
        }
        tr1.append(td1);
      for (let k2 = 0; k2 < this.orderedCount; k2++) {
        let td2 = document.createElement('td');
        td2.setAttribute('style', 'border:1px solid grey;width:60px;height:40px;');
        if (!this.costLinesMap.has(k1)) {
          tr1.append(td2);
          continue;
        }
        if (deltaMax.get('lineNumber')===k1 && deltaMax.get('colNumber')===k2) {
          td2.style.backgroundColor = 'pink';
        }
        td2.innerHTML =this.costLinesMap.get(k1)![k2]?''+this.costLinesMap.get(k1)![k2]:'';
        tr1.append(td2);
      }
      let td3 = document.createElement('td');
        if (minLines.get(k1)===undefined) {
          tr1.append(td3);
          tbody.append(tr1);
          continue;
        }
        if (deltaMax.get('isInLine') === true && deltaMax.get('lineNumber') === k1) {
          td3.style.color = 'red';
            
        } else {
          td3.style.color = 'blue';
        }
        td3.innerHTML =''+minLines.get(k1)!['delta'];
        tr1.append(td3);
        tbody.append(tr1);
    }
    tr2.append(td);
    for (let k = 0; k < this.orderedCount; k++) {

      let td = document.createElement('td');
      if (minCols.get(k) === undefined) {
        tr2.append(td);
        continue;
      }
       if (deltaMax.get('isInLine') === false && deltaMax.get('colNumber') === k) {
          td.style.color = 'red';
            
        } else {
          td.style.color = 'blue';
        }
      td.innerHTML = '' + minCols.get(k)!['delta'];
      tr2.append(td);
    }
    tbody.append(tr2);
    table.append(tbody);
    div.append(table);
    transport?.append(div);
  }
}
