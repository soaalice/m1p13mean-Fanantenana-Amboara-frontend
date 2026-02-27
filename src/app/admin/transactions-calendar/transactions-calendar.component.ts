import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import { AuthService } from '../../core/services/auth.service';
import { TransactionsService } from '../../core/services/transactions.service';
import { Transaction, TransactionType } from '../../shared/models/transaction';
import { cA } from '@fullcalendar/core/internal-common';

const TYPE_COLORS: Record<string, { bg: string; border: string }> = {
  [TransactionType.RECHARGE]: { bg: '#dcfce7', border: '#16a34a' },
  [TransactionType.PURCHASE]: { bg: '#dbeafe', border: '#2563eb' },
  [TransactionType.RENT]:     { bg: '#fef3c7', border: '#d97706' },
};

@Component({
  selector: 'app-transactions-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    FullCalendarModule,
  ],
  templateUrl: './transactions-calendar.component.html',
  styleUrl: './transactions-calendar.component.scss'
})
export class TransactionsCalendarComponent implements OnInit {
  isLoading = false;
  loadError: string | null = null;

  readonly legend = [
    { type: TransactionType.RECHARGE, label: 'Recharge', ...TYPE_COLORS[TransactionType.RECHARGE] },
    { type: TransactionType.PURCHASE, label: 'Purchase', ...TYPE_COLORS[TransactionType.PURCHASE] },
    { type: TransactionType.RENT,     label: 'Rent',     ...TYPE_COLORS[TransactionType.RENT]     },
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
        buttonText: 'Year',
        multiMonthMaxColumns: 3,
        multiMonthMinWidth: 240,
      },
      dayGridMonth:   { buttonText: 'Month' },
      timeGridWeek:   { buttonText: 'Week' },
    },
    locale: 'en',
    height: 'auto',
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', meridiem: false },
    eventDidMount: info => {
      info.el.title = info.event.extendedProps['tooltip'] ?? '';
    },
    events: [],
  };

  constructor(
    private authService: AuthService,
    private transactionsService: TransactionsService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    const user = this.authService.getCurrentUser();
    if (!user?._id) {
      this.loadError = 'Unable to retrieve the user account.';
      return;
    }

    this.isLoading = true;
    this.loadError = null;

    this.transactionsService.getAllTransactions(1, 500).subscribe({
      next: response => {
        const events = this.toCalendarEvents(response.data);
        this.calendarOptions = { ...this.calendarOptions, events };
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Error loading transactions.';
        this.isLoading = false;
      },
    });
  }

  getLabel(transaction: Transaction): string {
    switch (transaction.type) {
      case TransactionType.RENT:
        return `${transaction.type} - ${transaction.periode}`;
      default:
        return `${transaction.type} - ${transaction.total} MGA`;
    }
  }

  private toCalendarEvents(transactions: Transaction[]): EventInput[] {
    return transactions.map(tx => {
      const colors = TYPE_COLORS[tx.type] ?? { bg: '#f1f5f9', border: '#94a3b8' };
      const date = tx.date ? new Date(tx.date) : new Date();
      return {
        id:              tx._id,
        title:          `${this.getLabel(tx)}`,
        start:          date,
        allDay:         false,
        backgroundColor: colors.bg,
        borderColor:    colors.border,
        textColor:      colors.border,
        extendedProps:  { tooltip: `${this.getLabel(tx)}` },
      } as EventInput;
    });
  }


}
