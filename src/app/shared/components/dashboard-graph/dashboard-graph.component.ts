import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  ChartConfiguration,
  ChartData,
  ChartType
} from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

export type DashboardGraphType = 'bar' | 'doughnut' | 'pie' | 'line';

@Component({
  selector: 'app-dashboard-graph',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './dashboard-graph.component.html',
  styleUrl: './dashboard-graph.component.scss'
})
export class DashboardGraphComponent {
  @Input() title = '';
  @Input() data: [string, number][] = [];
  @Input() color = '#3b82f6';
  @Input() type: DashboardGraphType = 'bar';

  get chartType(): ChartType {
    return this.type;
  }

  get chartData(): ChartData {
    const labels = this.data.map(([label]) => label);
    const values = this.data.map(([, value]) => value);
    const palette = this.buildPalette(values.length);

    const baseDataset = {
      data: values,
      label: this.title
    };

    if (this.type === 'pie' || this.type === 'doughnut') {
      return {
        labels,
        datasets: [
          {
            ...baseDataset,
            backgroundColor: palette,
            borderColor: '#ffffff',
            borderWidth: 2
          }
        ]
      };
    }

    if (this.type === 'line') {
      return {
        labels,
        datasets: [
          {
            ...baseDataset,
            borderColor: this.color,
            backgroundColor: this.withOpacity(this.color, 0.25),
            pointBackgroundColor: this.color,
            tension: 0.25,
            fill: true
          }
        ]
      };
    }

    return {
      labels,
      datasets: [
        {
          ...baseDataset,
          backgroundColor: palette,
          borderRadius: 6,
          maxBarThickness: 36
        }
      ]
    };
  }

  get chartOptions(): ChartConfiguration['options'] {
    const isCircular = this.type === 'pie' || this.type === 'doughnut';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: isCircular,
          position: 'bottom'
        }
      },
      scales: isCircular
        ? undefined
        : {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
    };
  }

  private buildPalette(size: number): string[] {
    const defaults = [
      '#3b82f6',
      '#22c55e',
      '#f59e0b',
      '#ef4444',
      '#a855f7',
      '#06b6d4',
      '#84cc16'
    ];

    if (size <= defaults.length) {
      return defaults.slice(0, size);
    }

    return Array.from({ length: size }, (_, index) => {
      const hue = Math.round((360 / size) * index);
      return `hsl(${hue} 70% 52%)`;
    });
  }

  private withOpacity(color: string, opacity: number): string {
    const normalized = color.trim();

    if (normalized.startsWith('#')) {
      const hex = normalized.slice(1);
      const isShort = hex.length === 3;
      const expanded = isShort
        ? hex.split('').map(char => `${char}${char}`).join('')
        : hex;

      if (expanded.length !== 6) {
        return color;
      }

      const r = parseInt(expanded.slice(0, 2), 16);
      const g = parseInt(expanded.slice(2, 4), 16);
      const b = parseInt(expanded.slice(4, 6), 16);

      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    return color;
  }
}
