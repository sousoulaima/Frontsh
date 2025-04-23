import { DOCUMENT, CommonModule, NgIf } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, ViewChild, effect, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Chart, ChartOptions, registerables } from 'chart.js';
import { DashboardChartsData, IChartProps } from './dashboard-charts-data';

// Register all Chart.js elements
Chart.register(...registerables);

interface ISpace {
  name: string;
  type: string;
  status: string;
  revenue: number;
}

interface IClient {
  name: string;
  email: string;
  avatarColor: string;
  initials: string;
  hasCustomIcon?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgIf],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #document: Document = inject(DOCUMENT);
  readonly #chartsData: DashboardChartsData = inject(DashboardChartsData);

  // Reference to the Chart.js canvas
  @ViewChild('visitorChart') visitorChart!: ElementRef<HTMLCanvasElement>;

  // Total revenue
  public totalRevenue: number = 8249210;

  // Space metrics
  public coworkingOccupancy: number = 37;
  public coworkingTotal: number = 40;
  public sharedSpaceOccupancy: number = 32;
  public sharedSpaceTotal: number = 38;
  public virtualOfficeOccupancy: number = 120;
  public virtualOfficeTotal: number = 120;
  public privateOfficeOccupancy: number = 6;
  public privateOfficeTotal: number = 18;

  // Selected period for visitor statistics
  public selectedPeriod: string = '1S';

  // Visitor chart data for different periods
  public visitorChartDataMap: { [key: string]: any } = {
    '1J': {
      labels: ['00h', '04h', '08h', '12h', '16h', '20h'],
      datasets: [
        {
          label: "Aujourd'hui",
          data: [50, 80, 120, 200, 150, 100],
          borderColor: '#9CA3AF',
          backgroundColor: 'rgba(156, 163, 175, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#9CA3AF',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#9CA3AF',
        },
        {
          label: 'Hier',
          data: [60, 90, 110, 180, 140, 90],
          borderColor: '#1E3A8A',
          backgroundColor: 'rgba(30, 58, 138, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#1E3A8A',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#1E3A8A',
        },
      ],
    },
    '1S': {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [
        {
          label: 'Cette semaine',
          data: [80, 200, 400, 300, 600, 100, 50],
          borderColor: '#9CA3AF',
          backgroundColor: 'rgba(156, 163, 175, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#9CA3AF',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#9CA3AF',
        },
        {
          label: 'Semaine dernière',
          data: [90, 150, 300, 350, 500, 120, 80],
          borderColor: '#1E3A8A',
          backgroundColor: 'rgba(30, 58, 138, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#1E3A8A',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#1E3A8A',
        },
      ],
    },
    '1M': {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      datasets: [
        {
          label: 'Ce mois',
          data: [1200, 1800, 1500, 2000],
          borderColor: '#9CA3AF',
          backgroundColor: 'rgba(156, 163, 175, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#9CA3AF',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#9CA3AF',
        },
        {
          label: 'Mois dernier',
          data: [1000, 1600, 1400, 1800],
          borderColor: '#1E3A8A',
          backgroundColor: 'rgba(30, 58, 138, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#1E3A8A',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#1E3A8A',
        },
      ],
    },
    '1A': {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [
        {
          label: 'Cette année',
          data: [5000, 6000, 5500, 7000, 6500, 8000, 7500, 7200, 6800, 7100, 6900, 7300],
          borderColor: '#9CA3AF',
          backgroundColor: 'rgba(156, 163, 175, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#9CA3AF',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#9CA3AF',
        },
        {
          label: 'Année dernière',
          data: [4800, 5800, 5300, 6700, 6200, 7800, 7300, 7000, 6600, 6900, 6700, 7100],
          borderColor: '#1E3A8A',
          backgroundColor: 'rgba(30, 58, 138, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#1E3A8A',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#1E3A8A',
        },
      ],
    },
  };

  public visitorChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12 }, color: '#1E3A8A' } },
      tooltip: { backgroundColor: '#1E3A8A', titleColor: '#fff', bodyColor: '#fff' },
    },
    scales: {
      x: { ticks: { color: '#1E3A8A' } },
      y: { beginAtZero: true, ticks: { color: '#1E3A8A', stepSize: 200 } },
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart',
    },
  };

  // Chart instance
  private chartInstance: Chart | null = null;

  // Spaces (activities)
  public spaces: ISpace[] = [
    { name: 'Espace Impla', type: 'Bureau privé', status: 'Occupé', revenue: 28000 },
    { name: 'Espace Ter-ter', type: 'Bureau virtuel', status: 'Disponible', revenue: 11080 },
    { name: 'Espace Skyulah', type: 'Coworking', status: 'Occupé', revenue: 12090 },
  ];

  // Clients with custom icon for Iman Thao
  public clients: IClient[] = [
    { name: 'Iman Thao', email: 'iman.thao@example.com', avatarColor: 'bg-teal-500', initials: 'IT', hasCustomIcon: true },
    { name: 'Dina Saoudi', email: 'dina.saoudi@example.com', avatarColor: 'bg-yellow-500', initials: 'DS' },
    { name: 'Nadia Chemsi', email: 'nadia.chemsi@example.com', avatarColor: 'bg-purple-500', initials: 'NC' },
  ];

  // User profile
  public user = {
    name: 'soulaima',
    role: 'Admin S.H_Coworking',
    initials: 'SH',
    avatarColor: 'bg-indigo-500',
  };

  // Chart signals
  public occupancyChart: IChartProps = { type: 'line' };
  public occupancyChartRef: WritableSignal<any> = signal(undefined);

  #occupancyChartRefEffect = effect(() => {
    if (this.occupancyChartRef()) {
      this.setChartStyles();
    }
  });

  public trafficRadioGroup = new FormGroup({
    trafficRadio: new FormControl('Week'),
  });

  ngOnInit(): void {
    this.initCharts();
    this.updateChartOnColorModeChange();
  }

  ngAfterViewInit(): void {
    this.updateVisitorChart();
  }

  initCharts(): void {
    this.occupancyChart = this.#chartsData.mainChart;
  }

  setVisitorPeriod(period: string): void {
    this.selectedPeriod = period;
    this.updateVisitorChart();
  }

  updateVisitorChart(): void {
    if (this.visitorChart) {
      const ctx = this.visitorChart.nativeElement.getContext('2d');
      if (ctx) {
        // Destroy previous chart instance if it exists
        if (this.chartInstance) {
          this.chartInstance.destroy();
        }
        // Create new chart instance
        this.chartInstance = new Chart(ctx, {
          type: 'line',
          data: this.visitorChartDataMap[this.selectedPeriod],
          options: this.visitorChartOptions,
        });
      }
    }
  }

  setTrafficPeriod(value: string): void {
    this.trafficRadioGroup.setValue({ trafficRadio: value });
    this.#chartsData.initMainChart(value);
    this.initCharts();
  }

  handleChartRef($chartRef: any) {
    if ($chartRef) {
      this.occupancyChartRef.set($chartRef);
    }
  }

  updateChartOnColorModeChange() {
    const handler = () => {
      this.setChartStyles();
    };

    this.#document.addEventListener('ColorSchemeChange', handler);

    this.#destroyRef.onDestroy(() => {
      this.#document.removeEventListener('ColorSchemeChange', handler);
    });
  }

  setChartStyles() {
    if (this.occupancyChartRef()) {
      setTimeout(() => {
        const options: ChartOptions = { ...this.occupancyChart.options };
        const scales = this.#chartsData.getScales();
        this.occupancyChartRef().options.scales = { ...options.scales, ...scales };
        this.occupancyChartRef().update();
      });
    }
  }
}