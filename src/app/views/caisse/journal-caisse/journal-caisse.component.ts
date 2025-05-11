// journal-caisse.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ReglementService, Reglement } from '../../../services/reglement.service';
import { ModaliteRegService, ModaliteReg } from '../../../services/modalite-reg.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-journal-caisse',
  templateUrl: './journal-caisse.component.html',
  styleUrls: ['./journal-caisse.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatIconModule
  ]
})
export class JournalCaisseComponent implements OnInit {
  reglements: Reglement[] = [];
  filteredReglements: Reglement[] = [];
  modaliteRegs: ModaliteReg[] = [];
  filteredModalites: ModaliteReg[] = [];
  startDate: Date | null = null;
  endDate: Date | null = null;

  constructor(
    private reglementService: ReglementService,
    private modaliteService: ModaliteRegService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadModalites(),
      this.loadReglements()
    ]);
  }

  async loadModalites(): Promise<void> {
    try {
      const data = await this.modaliteService.getAll().toPromise();
      this.modaliteRegs = Array.isArray(data) ? data.map((item: any) => ({
        ...item,
        designationmod: item.designationMod || item.designationmod
      })) : [];
      this.filteredModalites = [...this.modaliteRegs];
    } catch (err) {
      console.error('Erreur lors du chargement des modalités:', err);
      this.modaliteRegs = [];
      this.filteredModalites = [];
    }
  }

  async loadReglements(): Promise<void> {
    try {
      const reglements = await this.reglementService.getAll().toPromise();
      this.reglements = Array.isArray(reglements) ? reglements.map(reg => ({
        codereg: reg.codereg,
        datereg: this.parseDate(reg.datereg),
        mtreg: reg.mtreg,
        numchq: reg.numchq,
        numtraite: reg.numtraite,
        commentaire: reg.commentaire,
        modalite_reg: String(reg.modalite_reg || reg.modaliteReg || reg.modalite_reg_id || ''),
        abonnement_codeabo: reg.abonnement_codeabo || reg.abonnementCodeabo || reg.abonnement_id
      })) : [];
      this.filteredReglements = [...this.reglements];
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Erreur lors du chargement des règlements:', err);
      this.reglements = [];
      this.filteredReglements = [];
    }
  }

  parseDate(date: string): string {
    if (!date) return '';
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString().split('T')[0];
  }

  onDateChange(): void {
    if (!this.startDate || !this.endDate) {
      this.filteredReglements = [...this.reglements];
      return;
    }

    const start = new Date(this.startDate.setHours(0, 0, 0, 0));
    const end = new Date(this.endDate.setHours(23, 59, 59, 999));

    this.filteredReglements = this.reglements.filter(reglement => {
      const regDate = new Date(reglement.datereg);
      return regDate >= start && regDate <= end;
    });
    this.cdr.detectChanges();
  }

  getModaliteName(codeMod: string | undefined): string {
    if (!codeMod) return 'Non défini';
    const mod = this.filteredModalites.find(m => String(m.codeMod) === String(codeMod));
    return mod?.designationmod || 'Non défini';
  }

  calculateTotal(): number {
    return this.filteredReglements.reduce((sum, reglement) => {
      const amount = parseFloat(String(reglement.mtreg));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  }

  async exportToPDF(): Promise<void> {
    const DATA = document.getElementById('pdfContent');
    if (!DATA) return;

    try {
      const canvas = await html2canvas(DATA, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('journal-caisse.pdf');
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
    }
  }
}