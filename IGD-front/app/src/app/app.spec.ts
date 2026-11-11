import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the application shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the IGD shell and primary navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[data-testid="igd-app-shell"]')).toBeTruthy();
    expect(element.querySelector('.primary-sidebar')).toBeTruthy();
    expect(element.querySelector('.secondary-sidebar')).toBeTruthy();
    expect(element.querySelector('.main-inset')).toBeTruthy();
    expect(element.textContent).toContain('بازار کلی');
  });

  it('should switch the selected shell section without loading a feature page', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.selectSection('market');

    expect(app.selectedSectionId).toBe('market');
    expect(app.selectedSection.label).toBe('بازار کلی');
  });

  it('should toggle the primary sidebar state', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app.sidebarCollapsed).toBe(false);

    app.toggleSidebar();

    expect(app.sidebarCollapsed).toBe(true);
  });
});