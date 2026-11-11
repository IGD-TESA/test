import { Component } from '@angular/core';

interface ShellSection {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly sections: ShellSection[] = [
    { id: 'overview', label: 'نمای کلی', icon: 'dashboard' },
    { id: 'market', label: 'بازار کلی', icon: 'storefront' },
    { id: 'assets', label: 'دارایی‌های من', icon: 'account_balance_wallet' },
    { id: 'contracts', label: 'قراردادها', icon: 'contract' },
    { id: 'services', label: 'خدمات', icon: 'handshake' },
    { id: 'settlement', label: 'تسویه', icon: 'account_balance' },
    { id: 'history', label: 'سوابق', icon: 'history' },
  ];

  selectedSectionId = 'overview';
  sidebarCollapsed = false;

  get selectedSection(): ShellSection {
    return this.sections.find(
      (section) => section.id === this.selectedSectionId,
    ) ?? this.sections[0];
  }

  selectSection(sectionId: string): void {
    this.selectedSectionId = sectionId;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}