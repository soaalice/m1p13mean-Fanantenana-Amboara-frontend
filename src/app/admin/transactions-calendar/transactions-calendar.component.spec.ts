import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsCalendarComponent } from './transactions-calendar.component';

describe('TransactionsCalendarComponent', () => {
  let component: TransactionsCalendarComponent;
  let fixture: ComponentFixture<TransactionsCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionsCalendarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransactionsCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
