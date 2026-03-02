import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DatesSetArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import { TransactionsService } from '../../core/services/transactions.service';
import { Transaction } from '../../shared/models/transaction';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

const LOYER_COLOR = { bg: '#fef3c7', border: '#d97706' };

@Component({
  selector: 'app-transactions-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    FullCalendarModule,
    LoaderComponent,
  ],
  templateUrl: './transactions-calendar.component.html',
  styleUrl: './transactions-calendar.component.scss'
})
export class TransactionsCalendarComponent implements OnInit {
  isLoading = false;
  loadError: string | null = null;

  /** Currently visible date range tracked across navigation */
  private currentRangeStart: Date = new Date();
  private currentRangeEnd: Date = new Date();

  readonly legend = [
    { label: 'Loyer', ...LOYER_COLOR },
  ];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, multiMonthPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left:   'prev,next today',
      center: 'title',
      right:  'multiMonthYear,dayGridMonth,timeGridWeek',
    },
    views: {
      multiMonthYear: {
        buttonText: 'Année',
        multiMonthMaxColumns: 3,
        multiMonthMinWidth: 240,
      },
      dayGridMonth: { buttonText: 'Mois' },
      timeGridWeek: { buttonText: 'Semaine' },
    },
    locale: 'fr',
    height: 'auto',
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', meridiem: false },
    eventDidMount: info => {
      info.el.title = info.event.extendedProps['tooltip'] ?? '';
    },
    datesSet: (info: DatesSetArg) => this.onDatesSet(info),
    events: [],
  };

  constructor(private transactionsService: TransactionsService) {}

  ngOnInit(): void {
    // Initial load is triggered via datesSet on calendar render
  }

  /** Called by FullCalendar whenever the visible date range changes (navigation, view switch) */
  private onDatesSet(info: DatesSetArg): void {
    this.currentRangeStart = info.start;
    this.currentRangeEnd   = info.end;
    this.loadLoyerTransactions();
  }

  /** Public — called by the Refresh button */
  loadTransactions(): void {
    this.loadLoyerTransactions();
  }

  private loadLoyerTransactions(): void {
    this.isLoading = true;
    this.loadError = null;

    const startDate = this.currentRangeStart.toISOString();
    const endDate   = this.currentRangeEnd.toISOString();

    this.transactionsService.getLoyerForCalendar(startDate, endDate).subscribe({
      next: response => {
        this.calendarOptions = { ...this.calendarOptions, events: this.toCalendarEvents(response.data) };
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Erreur lors du chargement des transactions LOYER.';
        this.isLoading = false;
      },
    });
  }

  private toCalendarEvents(transactions: Transaction[]): EventInput[] {
    return transactions.map(tx => {
      const label = `LOYER — ${tx.periode ?? ''} · ${tx.total.toLocaleString('fr-MG')} MGA`;
      return {
        id:              tx._id,
        title:           label,
        start:           tx.date ? new Date(tx.date) : new Date(),
        allDay:          false,
        backgroundColor: LOYER_COLOR.bg,
        borderColor:     LOYER_COLOR.border,
        textColor:       LOYER_COLOR.border,
        extendedProps:   { tooltip: label },
      } as EventInput;
    });
  }
}
