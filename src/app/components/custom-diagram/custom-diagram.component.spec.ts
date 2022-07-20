import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDiagramComponent } from './custom-diagram.component';

describe('CustomDiagramComponent', () => {
  let component: CustomDiagramComponent;
  let fixture: ComponentFixture<CustomDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomDiagramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
