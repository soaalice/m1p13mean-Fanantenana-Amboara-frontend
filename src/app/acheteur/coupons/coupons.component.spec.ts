import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CouponsComponent } from './coupons.component';
import { CouponsService } from '../../core/services/coupons.service';

describe('CouponsComponent', () => {
  let component: CouponsComponent;
  let fixture: ComponentFixture<CouponsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponsComponent],
      providers: [
        {
          provide: CouponsService,
          useValue: {
            getActiveCoupons: () => of({
              data: [],
              pagination: { page: 1, pages: 1, total: 0, limit: 10 }
            })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
