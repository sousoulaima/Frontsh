import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { UserService } from '../../services/user.service';
import { User } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-utilisateurs',
  templateUrl: './gestion-utilisateurs.component.html',
  styleUrls: ['./gestion-utilisateurs.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' })),
      ]),
    ]),
  ],
})
export class GestionUtilisateursComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery = '';
  filterRole = '';
  filterStatus = '';
  showFilter = false;
  showModal = false;
  showViewModal = false;
  showDeleteConfirm = false;
  isEditing = false;
  currentUser: Partial<User> & { password?: string } = {};
  viewedUser: User | null = null;
  userToDelete: User | null = null;
  errorMessage: string | null = null;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        if (error.message === 'Session expirée. Veuillez vous reconnecter.') {
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = 'Erreur lors du chargement des utilisateurs';
        }
        this.cdr.detectChanges();
      },
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesRole = this.filterRole ? user.role === this.filterRole : true;
      const matchesStatus = this.filterStatus ? user.status === this.filterStatus : true;
      return matchesSearch && matchesRole && matchesStatus;
    });
    this.cdr.detectChanges();
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
    this.cdr.detectChanges();
  }

  openAddUserModal(): void {
    this.isEditing = false;
    this.currentUser = { role: 'Administrateur', status: 'Actif', password: '' };
    this.errorMessage = null;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditUserModal(user: User): void {
    this.isEditing = true;
    this.currentUser = { ...user };
    this.errorMessage = null;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.currentUser = {};
    this.errorMessage = null;
    this.cdr.detectChanges();
  }

  saveUser(): void {
    this.errorMessage = null;

    if (this.isEditing && (this.currentUser as User).id) {
      this.userService.updateUser(this.currentUser as User).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          if (error.message === 'Session expirée. Veuillez vous reconnecter.') {
            this.router.navigate(['/login']);
          } else {
            this.errorMessage = 'Erreur lors de la mise à jour de l’utilisateur';
          }
          this.cdr.detectChanges();
        },
      });
    } else {
      if (!this.currentUser.password) {
        this.errorMessage = 'Le mot de passe est requis pour ajouter un utilisateur';
        this.cdr.detectChanges();
        return;
      }

      this.userService.addUser(this.currentUser as Partial<User> & { password: string }).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
        error: (error) => {
          console.error('Erreur lors de l’ajout:', error);
          if (error.message === 'Session expirée. Veuillez vous reconnecter.') {
            this.router.navigate(['/login']);
          } else if (error.message === 'Email déjà utilisé ou données invalides') {
            this.errorMessage = 'Erreur : Email déjà utilisé ou données invalides';
          } else {
            this.errorMessage = 'Erreur lors de l’ajout de l’utilisateur';
          }
          this.cdr.detectChanges();
        },
      });
    }
  }

  viewUser(user: User): void {
    this.viewedUser = user;
    this.showViewModal = true;
    this.cdr.detectChanges();
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewedUser = null;
    this.cdr.detectChanges();
  }

  confirmDeleteUser(user: User): void {
    this.userToDelete = user;
    this.showDeleteConfirm = true;
    this.cdr.detectChanges();
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.userToDelete = null;
    this.cdr.detectChanges();
  }

  deleteUser(): void {
    if (this.userToDelete?.id) {
      this.userService.deleteUser(this.userToDelete.id).subscribe({
        next: () => {
          this.loadUsers();
          this.cancelDelete();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          if (error.message === 'Session expirée. Veuillez vous reconnecter.') {
            this.router.navigate(['/login']);
          } else {
            this.errorMessage = 'Erreur lors de la suppression de l’utilisateur';
          }
          this.cdr.detectChanges();
        },
      });
    }
  }

  getRoleClass(role: string | undefined): string {
    switch (role) {
      case 'Administrateur':
        return 'role-admin';
      case 'Adhérent':
        return 'role-adherent';
      case 'Agent Accueil':
        return 'role-agent';
      case 'Formateur':
        return 'role-trainer';
      default:
        return '';
    }
  }
}