import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as go from 'gojs';
import { DataSyncService, DiagramComponent, PaletteComponent } from 'gojs-angular';
import { linkModel } from 'src/app/models/model.link';
import { NodeModel } from 'src/app/models/model.node';
@Component({
  selector: 'app-custom-diagram',
  templateUrl: './custom-diagram.component.html',
  styleUrls: ['./custom-diagram.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomDiagramComponent {
  @ViewChild('myDiagramDiv', { static: true }) public myDiagramComponent: DiagramComponent;
  @Input() public diagramNodeData: Array<NodeModel> = [];
  @Input() public diagramLinkData: Array<linkModel> = [];
  constructor(private changeDetectorRef: ChangeDetectorRef) { }
  // ngAfterViewInit(): void {
  // this.changeDetectorRef.detectChanges();
  // }
  public initDiagram(): go.Diagram {
    
    const $ = go.GraphObject.make;
    const dia = $(go.Diagram, {
      "ExternalObjectsDropped": (e)=> {console.log(e);
      },
      // "draggingTool.isEnabled": false,
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
      { locationSpot: go.Spot.Center},
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape,
        {
          figure:'Circle',
          width: 50, height: 50, fill: "#33ceac",
          stroke:'white',
          portId: "", cursor: "pointer",
          strokeWidth: 0,
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
          { reshapable: true,
            resegmentable: true,
            selectable: false,      // links cannot be selected by the user
            curve: go.Link.Bezier,
          },
          // { routing: go.Link.Orthogonal },  // optional, but need to keep LinkingTool.temporaryLink in sync, above
          { adjusting: go.Link.Bezier },  // optional
          new go.Binding("points", "points").makeTwoWay(),
          $(go.Shape,  { isPanelMain: true, stroke: "black", strokeWidth: 1 },),
          $(go.Shape, { toArrow: "OpenTriangle", stroke: "black" }),
          $(go.TextBlock, {
            stroke:"#ff623e",
            font: '11pt serif',
            background: "white",
            overflow: go.TextBlock.OverflowEllipsis,
            maxLines: 2,
            margin: 20,
          },
            new go.Binding("text","text")));
    return dia;
  }
  

  public diagramDivClassName: string = 'myDiagramDiv';
  public diagramModelData = { prop: 'value' };
  
  // When the diagram model changes, update app data to reflect those changes
  public diagramModelChange = (changes: any) => {
    this.diagramNodeData = DataSyncService.syncNodeData(changes, this.diagramNodeData) as any;
    this.diagramLinkData = DataSyncService.syncLinkData(changes, this.diagramLinkData) as any;
    this.diagramModelData = DataSyncService.syncModelData(changes, this.diagramModelData) as any;
  };

}
