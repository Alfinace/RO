import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as go from 'gojs';
import { DataSyncService, DiagramComponent, PaletteComponent } from 'gojs-angular';
@Component({
  selector: 'app-custom-diagram',
  templateUrl: './custom-diagram.component.html',
  styleUrls: ['./custom-diagram.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomDiagramComponent implements AfterViewInit {
  @ViewChild('myDiagramDiv', { static: true }) public myDiagramComponent: DiagramComponent;
  public diagramNodeData: Array<any> = [
    {"key":1, "text":"20",  "loc":"100 100"},
    {"key":2, "text":"52",  "loc":"100 170"},
    {"key":3, "text":"20",  "loc":"100 240"},
    {"key":4, "text":"4",  "loc":"100 310"},
    {"key":5, "text":"54",  "loc":"100 380"},
    {"key":7, "text":"24",  "loc":"100 450"},
    {"key":8, "text":"71",  "loc":"300 100"},
    {"key":9, "text":"4",  "loc":"300 170"},
    {"key":10, "text":"8",  "loc":"300 240"},
    {"key":11, "text":"2",  "loc":"300 310"},
    {"key":12, "text":"10",  "loc":"300 380"},
    {"key":13, "text":"32",  "loc":"300 450"} 
   
  ];
  public diagramLinkData: Array<any> = [
    {from: 1, to: 13 },
    {from: 1, to: 8 },
  ];
  constructor() { }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
  }

  public initDiagram(): go.Diagram {
    
    const $ = go.GraphObject.make;
    const dia = $(go.Diagram, {
      "draggingTool.isEnabled": false,
      'undoManager.isEnabled': true, // must be set to allow for model change listening
      // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
      model: $(go.GraphLinksModel,
        {
          linkKeyProperty: 'key' // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        }
      )
    });
    // define the Node template
    dia.nodeTemplate =
    $(go.Node, "Spot",
      { locationSpot: go.Spot.Center },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape,
        {
          figure:'Circle',
          width: 50, height: 50, fill: "white",
          portId: "", cursor: "pointer",
          fromLinkable: true,
          fromLinkableSelfNode: false, fromLinkableDuplicates: false,  // optional
          toLinkable: true,
          toLinkableSelfNode: false, toLinkableDuplicates: false  // optional
        },
        new go.Binding("fill")),
      $(go.Shape, { width: 70, height: 70, fill: "transparent", stroke: null }),
      $(go.TextBlock,
        new go.Binding("text")));
  
        dia.linkTemplate =
        $(go.Link,
          { reshapable: true, resegmentable: true },
          //{ routing: go.Link.Orthogonal },  // optional, but need to keep LinkingTool.temporaryLink in sync, above
          { adjusting: go.Link.Stretch },  // optional
          new go.Binding("points", "points").makeTwoWay(),
          $(go.Shape, { strokeWidth: 1.5 }),
          $(go.Shape, { toArrow: "OpenTriangle" }));
    return dia;
  }
  

  public diagramDivClassName: string = 'myDiagramDiv';
  public diagramModelData = { prop: 'value' };
  
  // When the diagram model changes, update app data to reflect those changes
  public diagramModelChange = (changes: any) => {
    this.diagramNodeData = DataSyncService.syncNodeData(changes, this.diagramNodeData);
    this.diagramLinkData = DataSyncService.syncLinkData(changes, this.diagramLinkData);
    this.diagramModelData = DataSyncService.syncModelData(changes, this.diagramModelData) as any;
  };

}
