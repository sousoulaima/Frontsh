import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import Chart from 'chart.js/auto';
import { DashboardService } from '../../services/dashboard.service';

interface Abonnement {
  id: number;
  CodeAbo: number;
  DateAbo: string;
  TotalHTAbo: string;
  TotalRemise: string;
  TotalNHT: string;
  TotalTTC: string;
  Solde: string;
  RestePaye: string;
  MTPaye: string;
  DateDeb: string;
  DateFin: string;
  created_at?: string;
  updated_at?: string;
}

interface Adherent {
  id: number;
  Code: number;
  Nom: string;
  Prenom: string;
  Profession: string;
  Email: string;
  Adresse: string;
  Telephone1: string;
  Telephone2: string;
  DateNaissance: string;
  CIN: string;
  created_at?: string;
  updated_at?: string;
}

interface Salle {
  id: number;
  Code: number;
  Designation: string;
  Capacite: number;
  PrixJour: string;
  PrixHeure: string;
  created_at?: string;
  updated_at?: string;
}

interface Formateur {
  id: number;
  Code: number;
  Nom: string;
  Prenom: string;
  Email: string;
  Telephone: string;
  Adresse: string;
  CreeLe: string;
  MisAJourLe: string;
  created_at?: string;
  updated_at?: string;
}

interface Reservation {
  id: number;
  ID: number;
  DateReservation: string;
  Salle: string;
  Formateur: string;
  Montant: string;
  CreeLe: string;
  MisAJourLe: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DatePipe, DashboardService]
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('abonnementsChart') abonnementsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('reservationsChart') reservationsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('abonnementsTtcChart') abonnementsTtcChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('adherentsProfessionChart') adherentsProfessionChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('reservationsPerSalleChart') reservationsPerSalleChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('formateursCreationChart') formateursCreationChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueTrendsChart') revenueTrendsChartRef!: ElementRef<HTMLCanvasElement>;

  abonnements: Abonnement[] = [];
  adherents: Adherent[] = [];
  salles: Salle[] = [];
  formateurs: Formateur[] = [];
  reservations: Reservation[] = [];

  totalStats: any = {};
  reservationsStats: any = {};
  dateRanges: any = {};
  sallesStatus: any = {};
  occupancyRate: number = 0;
  dailyReservations: any[] = [];
  professions: any[] = [];
  averageCapacity: number = 0;
  formateursByCreation: any[] = [];
  abonnementsTTC: any[] = [];
  reservationsPerSalle: any[] = [];

  private abonnementsChart!: Chart;
  private reservationsChart!: Chart;
  private abonnementsTtcChart!: Chart;
  private adherentsProfessionChart!: Chart;
  private reservationsPerSalleChart!: Chart;
  private formateursCreationChart!: Chart;
  private revenueTrendsChart!: Chart;

  constructor(private dashboardService: DashboardService, private datePipe: DatePipe) {}

  ngAfterViewInit() {
    this.loadStats();
  }

  loadStats() {
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        this.totalStats = res.total_stats || {};
        this.reservationsStats = res.reservations || {};
        this.dateRanges = res.date_ranges || {};
        this.sallesStatus = res.salles_status_today || {};
        this.occupancyRate = res.occupancy_rate || 0;
        this.dailyReservations = res.daily_reservations || [];
        this.professions = res.professions || [];
        this.averageCapacity = res.average_capacity || 0;
        this.formateursByCreation = res.formateurs_by_creation || [];
        this.abonnementsTTC = res.abonnements_ttc || [];

        this.abonnements = res.all_data?.abonnements || [];
        this.adherents = res.all_data?.adherents || [];
        this.salles = res.all_data?.salles || [];
        this.formateurs = res.all_data?.formateurs || [];
        this.reservations = res.all_data?.reservations || [];

        this.reservationsPerSalle = this.salles.map(salle => {
          const count = this.reservations.filter(res => res.Salle === salle.Designation).length;
          return { salle: salle.Designation, total: count };
        });

        this.createCharts();
      },
      error: (err) => console.error('Erreur lors de la récupération des données:', err)
    });
  }

  refreshStats() {
    this.loadStats();
  }

  createCharts() {
    this.createAbonnementsChart();
    this.createReservationsChart();
    this.createAbonnementsTtcChart();
    this.createAdherentsProfessionChart();
    this.createReservationsPerSalleChart();
    this.createFormateursCreationChart();
    this.createRevenueTrendsChart();
  }

  calculateTotalTTC(abonnements: Abonnement[]): number {
    return abonnements.reduce((sum, abo) => {
      const ttc = parseFloat(abo.TotalTTC.replace(' DT', '').replace(',', ''));
      return sum + (isNaN(ttc) ? 0 : ttc);
    }, 0);
  }

  calculateAverageAge(adherents: Adherent[]): number {
    const currentYear = new Date().getFullYear();
    const validAges = adherents
      .map(adherent => {
        const birthYear = new Date(adherent.DateNaissance).getFullYear();
        return birthYear > 0 && birthYear <= currentYear ? currentYear - birthYear : null;
      })
      .filter(age => age !== null) as number[];
    return validAges.length > 0 ? Math.round(validAges.reduce((sum, age) => sum + age, 0) / validAges.length) : 0;
  }

  calculateTotalMontant(reservations: Reservation[]): number {
    return reservations.reduce((sum, res) => {
      const montant = parseFloat(res.Montant.replace(' DT', '').replace(',', ''));
      return sum + (isNaN(montant) ? 0 : montant);
    }, 0);
  }

  createAbonnementsChart() {
    const ctx = this.abonnementsChartRef?.nativeElement?.getContext('2d');
    if (ctx) {
      this.abonnementsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Online', 'Offline'],
          datasets: [{
            data: [this.abonnements.length, Math.max(10 - this.abonnements.length, 0)],
            backgroundColor: ['#2563eb', '#e5e7eb'],
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#1f2937', font: { size: 12 } } },
            tooltip: { backgroundColor: '#1f2937', titleFont: { size: 14 }, bodyFont: { size: 12 } }
          },
        }
      });
    }
  }

  toggleAbonnementsChart(mode: 'online' | 'offline') {
    if (this.abonnementsChart) {
      this.abonnementsChart.data.datasets[0].data = mode === 'online' 
        ? [this.abonnements.length, Math.max(10 - this.abonnements.length, 0)]
        : [Math.max(10 - this.abonnements.length, 0), this.abonnements.length];
      this.abonnementsChart.update();
    }
  }

  createReservationsChart() {
    const ctx = this.reservationsChartRef?.nativeElement?.getContext('2d');
    if (ctx) {
      this.reservationsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.dailyReservations.map(res => this.datePipe.transform(res.day, 'dd/MM/yyyy')),
          datasets: [{
            label: 'Réservations',
            data: this.dailyReservations.map(res => res.total),
            backgroundColor: '#14b8a6',
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          scales: {
            x: { beginAtZero: true, ticks: { color: '#1f2937', font: { size: 12 } } },
            y: { ticks: { color: '#1f2937', font: { size: 12 } } }
          },
          plugins: { 
            legend: { display: false },
            tooltip: { backgroundColor: '#1f2937', titleFont: { size: 14 }, bodyFont: { size: 12 } }
          },
        }
      });
    }
  }

  toggleReservationsChart(mode: 'online' | 'offline') {
    if (this.reservationsChart) {
      this.reservationsChart.data.datasets[0].data = mode === 'online'
        ? this.dailyReservations.map(res => res.total)
        : this.dailyReservations.map(res => res.total * 0.8);
      this.reservationsChart.update();
    }
  }

  createAbonnementsTtcChart() {
    const ctx = this.abonnementsTtcChartRef?.nativeElement?.getContext('2d');
    if (ctx) {
      this.abonnementsTtcChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.abonnementsTTC.map(abo => `Abo ${abo.CodeAbo}`),
          datasets: [
            {
              label: 'Total TTC (DT)',
              data: this.abonnementsTTC.map(abo => parseFloat(abo.TotalTTC.replace(' DT', '').replace(',', ''))),
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              fill: true,
              tension: 0.4,
            },
            {
              label: 'Previous Period',
              data: this.abonnementsTTC.map(abo => parseFloat(abo.TotalTTC.replace(' DT', '').replace(',', '')) * 0.8),
              borderColor: '#6b7280',
              backgroundColor: 'rgba(107, 108, 128, 0.1)',
              fill: true,
              tension: 0.4,
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, ticks: { color: '#1f2937', font: { size: 12 } } },
            x: { ticks: { color: '#1f2937', font: { size: 12 } } }
          },
          plugins: { 
            legend: { position: 'top', labels: { color: '#1f2937', font: { size: 12 } } },
            tooltip: { backgroundColor: '#1f2937', titleFont: { size: 14 }, bodyFont: { size: 12 } }
          },
        }
      });
    }
  }

  toggleAbonnementsTtcChart(mode: 'online' | 'offline') {
    if (this.abonnementsTtcChart) {
      this.abonnementsTtcChart.data.datasets[0].data = mode === 'online'
        ? this.abonnementsTTC.map(abo => parseFloat(abo.TotalTTC.replace(' DT', '').replace(',', '')))
        : this.abonnementsTTC.map(abo => parseFloat(abo.TotalTTC.replace(' DT', '').replace(',', '')) * 0.9);
      this.abonnementsTtcChart.data.datasets[1].data = mode === 'online'
        ? this.abonnementsTTC.map(abo => parseFloat(abo.TotalTTC.replace(' DT', '').replace(',', '')) * 0.8)
        : this.abonnementsTTC.map(abo => parseFloat(abo.TotalTTC.replace(' DT', '').replace(',', '')) * 0.7);
      this.abonnementsTtcChart.update();
    }
  }

  createAdherentsProfessionChart() {
    const ctx = this.adherentsProfessionChartRef?.nativeElement?.getContext('2d');
    if (ctx) {
      this.adherentsProfessionChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.professions.map(prof => prof.Profession),
          datasets: [
            {
              label: 'Online',
              data: this.professions.map(prof => prof.total),
              backgroundColor: '#2563eb',
              borderRadius: 4,
            },
            {
              label: 'Offline',
              data: this.professions.map(prof => prof.total * 0.7),
              backgroundColor: '#d1d5db',
              borderRadius: 4,
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, ticks: { color: '#1f2937', font: { size: 12 } } },
            x: { ticks: { color: '#1f2937', font: { size: 12 } } }
          },
          plugins: { 
            legend: { position: 'top', labels: { color: '#1f2937', font: { size: 12 } } },
            tooltip: { backgroundColor: '#1f2937', titleFont: { size: 14 }, bodyFont: { size: 12 } }
          },
        }
      });
    }
  }

  toggleAdherentsProfessionChart(mode: 'online' | 'offline') {
    if (this.adherentsProfessionChart) {
      this.adherentsProfessionChart.data.datasets[0].data = mode === 'online'
        ? this.professions.map(prof => prof.total)
        : this.professions.map(prof => prof.total * 0.9);
      this.adherentsProfessionChart.data.datasets[1].data = mode === 'online'
        ? this.professions.map(prof => prof.total * 0.7)
        : this.professions.map(prof => prof.total * 0.6);
      this.adherentsProfessionChart.update();
    }
  }

  createReservationsPerSalleChart() {
    const ctx = this.reservationsPerSalleChartRef?.nativeElement?.getContext('2d');
    if (ctx) {
      this.reservationsPerSalleChart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: this.reservationsPerSalle.map(item => item.salle),
          datasets: [
            {
              label: 'Réservations',
              data: this.reservationsPerSalle.map(item => item.total),
              backgroundColor: 'rgba(20, 184, 166, 0.2)',
              borderColor: '#14b8a6',
              borderWidth: 2,
              pointBackgroundColor: '#14b8a6',
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            r: {
              beginAtZero: true,
              ticks: { color: '#1f2937', font: { size: 12 } },
              grid: { color: '#e5e7eb' },
              angleLines: { color: '#e5e7eb' },
              pointLabels: { color: '#1f2937', font: { size: 12 } }
            }
          },
          plugins: { 
            legend: { position: 'top', labels: { color: '#1f2937', font: { size: 12 } } },
            tooltip: { backgroundColor: '#1f2937', titleFont: { size: 14 }, bodyFont: { size: 12 } }
          },
        }
      });
    }
  }

  toggleReservationsPerSalleChart(mode: 'online' | 'offline') {
    if (this.reservationsPerSalleChart) {
      this.reservationsPerSalleChart.data.datasets[0].data = mode === 'online'
        ? this.reservationsPerSalle.map(item => item.total)
        : this.reservationsPerSalle.map(item => item.total * 0.8);
      this.reservationsPerSalleChart.update();
    }
  }

  createFormateursCreationChart() {
    const ctx = this.formateursCreationChartRef?.nativeElement?.getContext('2d');
    if (ctx) {
      this.formateursCreationChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.formateursByCreation.map(form => this.datePipe.transform(form.day, 'dd/MM/yyyy')),
          datasets: [
            {
              label: 'Formateurs (Online)',
              data: this.formateursByCreation.map(form => form.total),
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#2563eb',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
            },
            {
              label: 'Formateurs (Offline)',
              data: this.formateursByCreation.map(form => form.total * 0.8),
              borderColor: '#6b7280',
              backgroundColor: 'rgba(107, 108, 128, 0.1)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#6b7280',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, ticks: { color: '#1f2937', font: { size: 12 } } },
            x: { ticks: { color: '#1f2937', font: { size: 12 } } }
          },
          plugins: { 
            legend: { position: 'top', labels: { color: '#1f2937', font: { size: 12 } } },
            tooltip: { backgroundColor: '#1f2937', titleFont: { size: 14 }, bodyFont: { size: 12 } }
          },
        }
      });
    }
  }

  toggleFormateursCreationChart(mode: 'online' | 'offline') {
    if (this.formateursCreationChart) {
      this.formateursCreationChart.data.datasets[0].data = mode === 'online'
        ? this.formateursByCreation.map(form => form.total)
        : this.formateursByCreation.map(form => form.total * 0.9);
      this.formateursCreationChart.data.datasets[1].data = mode === 'online'
        ? this.formateursByCreation.map(form => form.total * 0.8)
        : this.formateursByCreation.map(form => form.total * 0.7);
      this.formateursCreationChart.update();
    }
  }

  createRevenueTrendsChart() {
    const ctx = this.revenueTrendsChartRef?.nativeElement?.getContext('2d');
    if (ctx) {
      this.revenueTrendsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.abonnementsTTC.map(abo => this.datePipe.transform(abo.DateAbo, 'dd/MM/yyyy') || `Abo ${abo.CodeAbo}`),
          datasets: [
            {
              label: 'Revenue Online',
              data: this.abonnementsTTC.map(abo => parseFloat(abo.TotalTTC.replace(' DT', '').replace(',', ''))),
              backgroundColor: '#2563eb',
              stack: 'combined',
              borderRadius: 4,
            },
            {
              label: 'Revenue Offline',
              data: this.abonnementsTTC.map(abo => parseFloat(abo.TotalTTC.replace(' DT', '').replace(',', '')) * 0.3),
              backgroundColor: '#6b7280',
              stack: 'combined',
              borderRadius: 4,
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, ticks: { color: '#1f2937', font: { size: 12 } }, stacked: true },
            x: { ticks: { color: '#1f2937', font: { size: 12 } } }
          },
          plugins: { 
            legend: { position: 'top', labels: { color: '#1f2937', font: { size: 12 } } },
            tooltip: { backgroundColor: '#1f2937', titleFont: { size: 14 }, bodyFont: { size: 12 } }
          },
        }
      });
    }
  }

  toggleRevenueTrendsChart(mode: 'online' | 'offline') {
    if (this.revenueTrendsChart) {
      this.revenueTrendsChart.data.datasets[0].data = mode === 'online'
        ? this.abonnementsTTC.map(abo => parseFloat(abo.TotalTTC.replace(' DT', '').replace(',', '')))
        : this.abonnementsTTC.map(abo => parseFloat(abo.TotalTTC.replace(' DT', '').replace(',', '')) * 0.9);
      this.revenueTrendsChart.data.datasets[1].data = mode === 'online'
        ? this.abonnementsTTC.map(abo => parseFloat(abo.TotalTTC.replace(' DT', '').replace(',', '')) * 0.3)
        : this.abonnementsTTC.map(abo => parseFloat(abo.TotalTTC.replace(' DT', '').replace(',', '')) * 0.2);
      this.revenueTrendsChart.update();
    }
  }
}