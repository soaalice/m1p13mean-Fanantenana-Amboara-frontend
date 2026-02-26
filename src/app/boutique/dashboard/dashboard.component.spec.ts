import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const dashboardServiceMock: Pick<DashboardService, 'getBoutiqueDashboard'> = {
    getBoutiqueDashboard: () =>
      of({
        customers: {
          total: 0,
          byMonth: {}
        }
      })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        {
          provide: DashboardService,
          useValue: dashboardServiceMock
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
