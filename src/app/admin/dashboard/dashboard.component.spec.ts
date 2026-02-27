import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../core/services/dashboard.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  const dashboardServiceMock = {
    getAdminDashboard: jasmine.createSpy('getAdminDashboard').and.returnValue(of({
      boxes: {
        total: 2,
        byState: {
          AVAILABLE: 0,
          RENTED: 2
        }
      },
      users: {
        total: 5,
        byRole: {
          ADMIN: 1,
          BOUTIQUE: 3,
          ACHETEUR: 1
        }
      }
    }))
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
