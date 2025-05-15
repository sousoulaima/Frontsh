import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Observable } from 'rxjs';
import { ReservationSalle, ReservationSalleService } from '../../../services/reservation-salle.service';
import { SalleFormation, SalleFormationService } from '../../../services/salle-formation.service';
import { Formateur, FormateurService } from '../../../services/formateur.service';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' })),
      ]),
    ]),
    trigger('filterAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
  ],
})
export class ReservationComponent implements OnInit {
  searchQuery = '';
  filterSalleCode = '';
  showFilter = false;
  showModal = false;
  showViewModal = false;
  showDeleteConfirm = false;
  isEditing = false;
  reservationToDelete: ReservationSalle | null = null;
  viewedReservation: ReservationSalle | null = null;
  today = new Date().toISOString().split('T')[0];

  reservations: ReservationSalle[] = [];
  filteredReservations: ReservationSalle[] = [];
  currentReservation: Partial<ReservationSalle> = this.resetReservation();
  salles: SalleFormation[] = [];
  formateurs: Formateur[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private reservationService: ReservationSalleService,
    private salleService: SalleFormationService,
    private formateurService: FormateurService
  ) {}

  ngOnInit(): void {
    this.loadReservations();
    this.loadSalles();
    this.loadFormateurs();
  }

  loadReservations(): void {
    this.reservationService.getAll().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.filteredReservations = [...reservations];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading reservations:', err)
    });
  }

  loadSalles(): void {
    this.salleService.getAll().subscribe({
      next: (salles) => {
        this.salles = salles;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading salles:', err)
    });
  }

  loadFormateurs(): void {
    this.formateurService.getAll().subscribe({
      next: (formateurs) => {
        this.formateurs = formateurs;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading formateurs:', err)
    });
  }

  resetReservation(): Partial<ReservationSalle> {
    return {
      id: undefined,
      datereservation: this.today,
      montantreservation: '',
      salle_formation_codesalle: undefined,
      formateur_codefor: undefined,
    };
  }

  filterReservations(): void {
    this.filteredReservations = this.reservations.filter((reservation) => {
      const query = this.searchQuery.toLowerCase();
      const matchesSearch =
        (reservation.id?.toString() || '').toLowerCase().includes(query) ||
        (reservation.datereservation || '').toLowerCase().includes(query) ||
        (reservation.salle_formation?.designationsalle || '').toLowerCase().includes(query) ||
        `${reservation.formateur?.nomfor || ''} ${reservation.formateur?.prenomfor || ''}`.toLowerCase().includes(query) ||
        (reservation.montantreservation || '').toLowerCase().includes(query);
      const matchesSalle = this.filterSalleCode ?
        reservation.salle_formation_codesalle?.toString() === this.filterSalleCode : true;
      return matchesSearch && matchesSalle;
    });
    this.cdr.detectChanges();
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
    this.cdr.detectChanges();
  }

  getSalleDesignation(codeSalle: number | undefined): string {
    if (!codeSalle) return 'N/A';
    const salle = this.salles.find(s => s.codesalle === codeSalle);
    return salle ? salle.designationsalle : 'N/A';
  }

  getFormateurName(codeFor: number | undefined): string {
    if (!codeFor) return 'N/A';
    const formateur = this.formateurs.find(f => f.codefor === codeFor);
    return formateur ? `${formateur.nomfor} ${formateur.prenomfor}` : 'N/A';
  }

  openAddReservationModal(): void {
    this.isEditing = false;
    this.currentReservation = this.resetReservation();
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditReservationModal(reservation: ReservationSalle): void {
    this.isEditing = true;
    this.currentReservation = {
      id: reservation.id,
      datereservation: reservation.datereservation ? reservation.datereservation.split('T')[0] : this.today,
      montantreservation: reservation.montantreservation,
      salle_formation_codesalle: reservation.salle_formation_codesalle,
      formateur_codefor: reservation.formateur_codefor,
    };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.currentReservation = this.resetReservation();
    this.cdr.detectChanges();
  }

  saveReservation(): void {
    const reservationData = {
      ...this.currentReservation,
      datereservation: this.currentReservation.datereservation + 'T00:00:00.000Z',
      salle_formation_codesalle: this.currentReservation.salle_formation_codesalle,
      formateur_codefor: this.currentReservation.formateur_codefor,
      montantreservation: this.currentReservation.montantreservation,
      statut: "en_attente",
    };

    const operation = this.isEditing
      ? this.reservationService.update(this.currentReservation.id!.toString(), reservationData as ReservationSalle)
      : this.reservationService.create(reservationData as Omit<ReservationSalle, 'id' | 'created_at' | 'updated_at' | 'salle_formation' | 'formateur'>);

    operation.subscribe({
      next: () => {
        this.loadReservations();
        this.closeModal();
      },
      error: (err) => console.error('Error saving reservation:', err)
    });
  }

  viewReservation(reservation: ReservationSalle): void {
    this.viewedReservation = reservation;
    this.showViewModal = true;
    this.cdr.detectChanges();
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewedReservation = null;
    this.cdr.detectChanges();
  }

  confirmDeleteReservation(reservation: ReservationSalle): void {
    this.reservationToDelete = reservation;
    this.showDeleteConfirm = true;
    this.cdr.detectChanges();
  }

  deleteReservation(): void {
    if (this.reservationToDelete?.id) {
      this.reservationService.delete(this.reservationToDelete.id.toString()).subscribe({
        next: () => {
          this.loadReservations();
          this.cancelDelete();
        },
        error: (err) => console.error('Error deleting reservation:', err)
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.reservationToDelete = null;
    this.cdr.detectChanges();
  }
}