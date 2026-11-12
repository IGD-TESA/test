import { Component, Input, Type } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import {
  DockviewAngularModule,
  DockviewReadyEvent,
} from 'dockview-angular';

@Component({
  selector: 'igd-terminal-dock-panel',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
  ],
  template: `
    <section class="terminal-panel dock-terminal-panel">

      @switch (api?.params?.kind) {

        @case ('market-watch') {
          <div class="panel-heading">
            <div class="panel-title">
              <mat-icon>monitoring</mat-icon>
              <strong>دیده‌بان بازار کلی</strong>
            </div>
            <div class="panel-actions">
              <span class="panel-caption">فهرست بازارها و عرضه‌ها</span>
              <button mat-icon-button aria-label="تنظیمات دیده‌بان">
                <mat-icon>tune</mat-icon>
              </button>
            </div>
          </div>

          <div class="market-filter-bar">
            <button mat-button class="filter-active">همه بازارها</button>
            <button mat-button>کالا</button>
            <button mat-button>املاک</button>
            <button mat-button>سایر دارایی‌ها</button>
            <span class="filter-spacer"></span>
            <button mat-icon-button aria-label="جست‌وجوی بازار">
              <mat-icon>search</mat-icon>
            </button>
            <button mat-icon-button aria-label="فیلتر بازار">
              <mat-icon>filter_list</mat-icon>
            </button>
          </div>

          <div class="table-scroll">
            <table class="terminal-table market-table">
              <thead>
                <tr>
                  <th>نام عرضه / دارایی</th>
                  <th>بازار</th>
                  <th>قیمت</th>
                  <th>تغییرات</th>
                  <th>حجم</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="6" class="empty-table">
                    <mat-icon>table_chart</mat-icon>
                    <span>اطلاعات عرضه‌ها پس از اتصال سرویس بازار نمایش داده می‌شود.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="panel-footer">
            <span>دیده‌بان بازار</span>
            <span>آماده اتصال به سرویس کاتالوگ و عرضه‌ها</span>
          </footer>
        }

        @case ('portfolio') {
          <div class="panel-heading">
            <div class="panel-title">
              <mat-icon>account_balance_wallet</mat-icon>
              <strong>پرتفوی دارایی‌ها</strong>
            </div>
            <button mat-button class="text-action">
              مشاهده همه دارایی‌ها
              <mat-icon>chevron_left</mat-icon>
            </button>
          </div>

          <div class="portfolio-summary">
            <div class="summary-cell">
              <span>ارزش کل دارایی‌ها</span>
              <strong>—</strong>
            </div>
            <div class="summary-cell">
              <span>سود و زیان کل</span>
              <strong>—</strong>
            </div>
            <div class="summary-cell">
              <span>موقعیت‌های فعال</span>
              <strong>—</strong>
            </div>
          </div>

          <div class="table-scroll">
            <table class="terminal-table">
              <thead>
                <tr>
                  <th>دارایی</th>
                  <th>مقدار</th>
                  <th>ارزش</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="4" class="empty-table">
                    اطلاعات پرتفوی از سرویس دارایی‌ها دریافت خواهد شد.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        }

        @case ('instrument-details') {
          <div class="panel-heading compact-heading">
            <div class="panel-title">
              <mat-icon>info</mat-icon>
              <strong>اطلاعات نماد</strong>
            </div>
          </div>

          <div class="panel-body details-content">
            <div class="instrument-identity">
              <div class="instrument-placeholder">—</div>
              <strong>نمادی انتخاب نشده</strong>
              <span>جزئیات دارایی انتخابی</span>
            </div>

            <mat-divider></mat-divider>

            <div class="detail-row">
              <span>آخرین قیمت</span>
              <strong>—</strong>
            </div>
            <div class="detail-row">
              <span>تغییرات</span>
              <strong>—</strong>
            </div>
            <div class="detail-row">
              <span>حجم عرضه</span>
              <strong>—</strong>
            </div>
            <div class="detail-row">
              <span>وضعیت عرضه</span>
              <strong>—</strong>
            </div>

            <mat-divider></mat-divider>

            <div class="detail-section-title">اطلاعات تکمیلی</div>
            <button mat-button class="detail-link">مشخصات دارایی</button>
            <button mat-button class="detail-link">قراردادها و تعهدات</button>
            <button mat-button class="detail-link">سوابق و رویدادها</button>
          </div>
        }

        @case ('instrument-chart') {
          <div class="panel-heading">
            <div class="panel-title">
              <mat-icon>show_chart</mat-icon>
              <strong>نمودار و روند دارایی</strong>
            </div>
            <span class="panel-caption">نمایش پس از اتصال داده‌های بازار</span>
          </div>

          <div class="chart-placeholder">
            <mat-icon>monitoring</mat-icon>
            <strong>نمودار دارایی انتخابی</strong>
            <span>داده‌ای برای ترسیم نمودار دریافت نشده است.</span>
          </div>
        }

        @case ('orderbook') {
          <div class="panel-heading compact-heading">
            <div class="panel-title">
              <mat-icon>swap_vert</mat-icon>
              <strong>دفتر سفارش</strong>
            </div>
          </div>

          <div class="panel-body">
            <div class="orderbook-instrument">
              <span>نماد انتخابی</span>
              <strong>—</strong>
            </div>

            <div class="order-side sell-side">
              <div class="order-side-heading">
                <span>فروش</span>
                <span>قیمت</span>
                <span>مقدار</span>
              </div>
              <div class="order-empty">سفارشی وجود ندارد</div>
            </div>

            <div class="order-spread">
              <span>قیمت میانی</span>
              <strong>—</strong>
            </div>

            <div class="order-side buy-side">
              <div class="order-side-heading">
                <span>خرید</span>
                <span>قیمت</span>
                <span>مقدار</span>
              </div>
              <div class="order-empty">سفارشی وجود ندارد</div>
            </div>

            <div class="orderbook-legend">
              <span class="legend-sell">فروش</span>
              <span class="legend-buy">خرید</span>
            </div>
          </div>
        }

        @case ('activity') {
          <div class="panel-heading activity-heading">
            <div class="panel-title">
              <mat-icon>view_list</mat-icon>
              <strong>فضای کاری و سوابق</strong>
            </div>
            <span class="panel-caption">وضعیت مستقل سفارش، معامله و تسویه</span>
          </div>

          <mat-tab-group
            class="terminal-tabs"
            animationDuration="0ms"
            [disableRipple]="true">

            <mat-tab label="سفارشات فعال">
              <div class="tab-empty">
                سفارش‌های فعال پس از اتصال سرویس سفارش‌ها نمایش داده می‌شوند.
              </div>
            </mat-tab>

            <mat-tab label="تاریخچه سفارشات">
              <div class="tab-empty">تاریخچه سفارش‌ها</div>
            </mat-tab>

            <mat-tab label="معاملات">
              <div class="tab-empty">سوابق معاملات</div>
            </mat-tab>

            <mat-tab label="اجرای معامله">
              <div class="tab-empty">مراحل اجرای معامله</div>
            </mat-tab>

            <mat-tab label="وضعیت تسویه">
              <div class="tab-empty">وضعیت و سوابق تسویه</div>
            </mat-tab>
          </mat-tab-group>
        }

      }
    </section>
  `,
  styles: [`
    :host {
      display: flex;
      min-width: 0;
      min-height: 0;
      height: 100%;
      overflow: hidden;
    }

    .dock-terminal-panel {
      width: 100%;
      height: 100%;
    }

    .chart-placeholder {
      flex: 1;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: var(--terminal-muted, #777b72);
      background:
        linear-gradient(#e9e6dc 1px, transparent 1px),
        linear-gradient(90deg, #e9e6dc 1px, transparent 1px);
      background-size: 24px 24px;
    }

    .chart-placeholder mat-icon {
      font-size: 34px;
      width: 34px;
      height: 34px;
      color: var(--terminal-olive, #77764b);
    }

    .chart-placeholder strong {
      color: var(--terminal-green, #183d32);
    }
  `],
})
export class TerminalDockPanelComponent {
  @Input() api: any;
}

@Component({
  selector: 'igd-general-market',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    DockviewAngularModule,
  ],
  templateUrl: './general-market.html',
  styleUrl: './general-market.css',
})
export class GeneralMarketPage {
  activeTool = 'market';

  components: Record<string, Type<any>> = {
    terminalPanel: TerminalDockPanelComponent,
  };

  private dockApi: any = null;

  private readonly panelIds = [
    'market-watch',
    'portfolio',
    'instrument-details',
    'instrument-chart',
    'orderbook',
    'activity',
  ];

  private readonly layoutStorageKey = 'igd.general-market.layouts.v1';
  private readonly lastLayoutStorageKey = 'igd.general-market.last-layout.v1';

  onDockReady(event: DockviewReadyEvent): void {
    this.dockApi = event.api;

    let restored = false;

    try {
      const saved = localStorage.getItem(this.lastLayoutStorageKey);

      if (saved) {
        this.dockApi.fromJSON(JSON.parse(saved), {
          reuseExistingPanels: true,
        });
        restored = true;
      }
    } catch {
      localStorage.removeItem(this.lastLayoutStorageKey);
    }

    if (!restored) {
      this.applyPreset('default');
    }

    this.dockApi.onDidLayoutChange(() => {
      this.persistLastLayout();
    });
  }

  private persistLastLayout(): void {
    if (!this.dockApi) {
      return;
    }

    try {
      localStorage.setItem(
        this.lastLayoutStorageKey,
        JSON.stringify(this.dockApi.toJSON()),
      );
    } catch {
      // Layout remains usable if browser storage is unavailable.
    }
  }

  private removeKnownPanels(): void {
    if (!this.dockApi) {
      return;
    }

    for (const id of this.panelIds) {
      const panel = this.dockApi.getPanel(id);

      if (panel) {
        this.dockApi.removePanel(panel);
      }
    }
  }

  private addPanel(
    id: string,
    title: string,
    kind: string,
    referencePanel?: string,
    direction?: 'left' | 'right' | 'above' | 'below',
  ): void {
    const options: any = {
      id,
      component: 'terminalPanel',
      title,
      params: { kind },
    };

    if (referencePanel && direction) {
      options.position = {
        referencePanel,
        direction,
      };
    }

    this.dockApi.addPanel(options);
  }

  private createBaseLayout(
    includeOrderBook: boolean,
    includeActivity: boolean,
  ): void {
    this.addPanel('market-watch', 'دیده‌بان بازار', 'market-watch');

    this.addPanel(
      'portfolio',
      'پرتفوی',
      'portfolio',
      'market-watch',
      'below',
    );

    this.addPanel(
      'instrument-details',
      'اطلاعات نماد',
      'instrument-details',
      'market-watch',
      'right',
    );

    this.addPanel(
      'instrument-chart',
      'نمودار',
      'instrument-chart',
      'instrument-details',
      'below',
    );

    if (includeOrderBook) {
      this.addPanel(
        'orderbook',
        'دفتر سفارش',
        'orderbook',
        'instrument-details',
        'right',
      );
    }

    if (includeActivity) {
      this.addPanel(
        'activity',
        'فضای کاری و سوابق',
        'activity',
        includeOrderBook ? 'orderbook' : 'instrument-chart',
        'below',
      );
    }
  }

  applyPreset(
    preset: 'default' | 'trading' | 'analysis' | 'history',
  ): void {
    if (!this.dockApi) {
      return;
    }

    this.removeKnownPanels();

    switch (preset) {
      case 'default':
        this.createBaseLayout(false, false);
        break;

      case 'trading':
        this.createBaseLayout(true, false);
        break;

      case 'analysis':
        this.createBaseLayout(false, false);
        break;

      case 'history':
        this.createBaseLayout(true, true);
        break;
    }

    this.persistLastLayout();
  }

  toggleOrderBook(): void {
    if (!this.dockApi) {
      return;
    }

    const existing = this.dockApi.getPanel('orderbook');

    if (existing) {
      this.dockApi.removePanel(existing);
    } else {
      this.addPanel(
        'orderbook',
        'دفتر سفارش',
        'orderbook',
        'instrument-details',
        'right',
      );
    }

    this.persistLastLayout();
  }

  toggleActivity(): void {
    if (!this.dockApi) {
      return;
    }

    const existing = this.dockApi.getPanel('activity');

    if (existing) {
      this.dockApi.removePanel(existing);
    } else {
      this.addPanel(
        'activity',
        'فضای کاری و سوابق',
        'activity',
        'instrument-chart',
        'below',
      );
    }

    this.persistLastLayout();
  }

  saveNamedLayout(): void {
    if (!this.dockApi) {
      return;
    }

    const name = window.prompt('نام چیدمان را وارد کنید:');

    if (!name || !name.trim()) {
      return;
    }

    try {
      const layouts = this.readNamedLayouts();

      layouts[name.trim()] = this.dockApi.toJSON();

      localStorage.setItem(
        this.layoutStorageKey,
        JSON.stringify(layouts),
      );
    } catch {
      window.alert('ذخیره چیدمان انجام نشد. فضای ذخیره‌سازی مرورگر را بررسی کنید.');
    }
  }

  loadNamedLayout(): void {
    if (!this.dockApi) {
      return;
    }

    const layouts = this.readNamedLayouts();
    const names = Object.keys(layouts);

    if (names.length === 0) {
      window.alert('هنوز چیدمان اختصاصی ذخیره نشده است.');
      return;
    }

    const selected = window.prompt(
      'نام چیدمان موردنظر را دقیقاً وارد کنید:\n\n' +
      names.join('\n'),
    );

    if (!selected || !layouts[selected]) {
      return;
    }

    try {
      this.dockApi.fromJSON(layouts[selected], {
        reuseExistingPanels: true,
      });

      this.persistLastLayout();
    } catch {
      window.alert('بازیابی چیدمان انتخاب‌شده ناموفق بود.');
    }
  }

  private readNamedLayouts(): Record<string, any> {
    try {
      const raw = localStorage.getItem(this.layoutStorageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  resetLayout(): void {
    this.applyPreset('default');
  }

  selectTool(tool: string): void {
    this.activeTool = tool;

    if (tool === 'history') {
      const existing = this.dockApi?.getPanel('activity');

      if (!existing) {
        this.toggleActivity();
      }
    }
  }
}