import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ColorModeService } from '@coreui/angular';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
  standalone: true,
  imports: [],
})
export class DefaultHeaderComponent {
  readonly #colorModeService = inject(ColorModeService);
  readonly #router = inject(Router);
  readonly colorMode = this.#colorModeService.colorMode;

  readonly colorModes = [
    { name: 'light', text: 'Light', icon: 'cilSun' },
    { name: 'dark', text: 'Dark', icon: 'cilMoon' },
    { name: 'auto', text: 'Auto', icon: 'cilContrast' },
  ];

  readonly icons = computed(() => {
    const currentMode = this.colorMode();
    return this.colorModes.find((mode) => mode.name === currentMode)?.icon ?? 'cilSun';
  });

  showThemeDropdown = false;
  showUserDropdown = false;
  showProfileDetails = false;

  sidebarId = input('sidebar1');
  isSidebarOpen = false;

  constructor() {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleThemeDropdown() {
    this.showThemeDropdown = !this.showThemeDropdown;
    this.showUserDropdown = false;
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
    this.showThemeDropdown = false;
  }

  logout() {
    // Optional: Add logout logic here (e.g., clear tokens, session, etc.)
    // Example: localStorage.removeItem('authToken');
    this.#router.navigate(['/login']);
  }

}