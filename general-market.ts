import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';

import {
  BrnResizableGroup,
  BrnResizableHandle,
  BrnResizablePanel,
} from '@spartan-ng/brain/resizable';

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

      @switch (kind) {

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
  @Input() kind = '';
}



@Component({
  selector: 'igd-general-market',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    BrnResizableGroup,
    BrnResizablePanel,
    BrnResizableHandle,
  ],
  templateUrl: './general-market.html',
  styleUrl: './general-market.css',
})
export class GeneralMarketPage implements OnInit {

  activeTool = 'market';

  // Root order in RTL:
  // 1. Order book (right)
  // 2. Instrument details (middle)
  // 3. Market column (left)

  rootLayout: number[] = [22, 34, 44];

  // Market column: watch above portfolio
  marketLayout: number[] = [62, 38];

  // Center column: details above chart
  centerLayout: number[] = [43, 57];

  showOrderBook = false;
  showActivity = false;

  private readonly layoutStorageKey =
    'igd.general-market.layouts.v2';

  private readonly lastLayoutStorageKey =
    'igd.general-market.last-layout.v2';

  ngOnInit(): void {
    this.restoreLastLayout();
  }

  // ----------------------------------------------------------
  // LAYOUT EVENTS
  // ----------------------------------------------------------

  onRootLayoutChange(layout: number[]): void {
    if (!Array.isArray(layout) || layout.length < 2) return;

    this.rootLayout = [...layout];
    this.persistLastLayout();
  }

  onMarketLayoutChange(layout: number[]): void {
    if (!Array.isArray(layout) || layout.length !== 2) return;

    this.marketLayout = [...layout];
    this.persistLastLayout();
  }

  onCenterLayoutChange(layout: number[]): void {
    const expected = this.showActivity ? 3 : 2;

    if (!Array.isArray(layout) || layout.length !== expected) return;

    this.centerLayout = [...layout];
    this.persistLastLayout();
  }

  // ----------------------------------------------------------
  // PRESETS
  // ----------------------------------------------------------

  applyPreset(
    preset: 'default' | 'trading' | 'analysis' | 'history'
  ): void {

    switch (preset) {

      case 'default':
        this.showOrderBook = false;
        this.showActivity = false;
        this.rootLayout = [44, 56];
        this.marketLayout = [62, 38];
        this.centerLayout = [43, 57];
        break;

      case 'trading':
        this.showOrderBook = true;
        this.showActivity = false;
        this.rootLayout = [22, 34, 44];
        this.marketLayout = [65, 35];
        this.centerLayout = [38, 62];
        break;

      case 'analysis':
        this.showOrderBook = false;
        this.showActivity = false;
        this.rootLayout = [42, 58];
        this.marketLayout = [55, 45];
        this.centerLayout = [30, 70];
        break;

      case 'history':
        this.showOrderBook = true;
        this.showActivity = true;
        this.rootLayout = [20, 34, 46];
        this.marketLayout = [58, 42];
        this.centerLayout = [28, 37, 35];
        break;
    }

    this.persistLastLayout();
  }

  // ----------------------------------------------------------
  // PANEL VISIBILITY
  // ----------------------------------------------------------

  toggleOrderBook(): void {

    this.showOrderBook = !this.showOrderBook;

    this.rootLayout = this.showOrderBook
      ? [22, 34, 44]
      : [44, 56];

    this.persistLastLayout();
  }

  toggleActivity(): void {

    this.showActivity = !this.showActivity;

    this.centerLayout = this.showActivity
      ? [30, 40, 30]
      : [43, 57];

    this.persistLastLayout();
  }

  // ----------------------------------------------------------
  // NAMED LAYOUTS
  // ----------------------------------------------------------

  saveNamedLayout(): void {

    const name = window.prompt('نام چیدمان را وارد کنید:');

    if (!name || !name.trim()) return;

    try {

      const layouts = this.readNamedLayouts();

      layouts[name.trim()] = this.getLayoutSnapshot();

      localStorage.setItem(
        this.layoutStorageKey,
        JSON.stringify(layouts)
      );

    } catch {

      window.alert(
        'ذخیره چیدمان انجام نشد. فضای ذخیره‌سازی مرورگر را بررسی کنید.'
      );
    }
  }

  loadNamedLayout(): void {

    const layouts = this.readNamedLayouts();
    const names = Object.keys(layouts);

    if (names.length === 0) {
      window.alert('هنوز چیدمان اختصاصی ذخیره نشده است.');
      return;
    }

    const selected = window.prompt(
      'نام چیدمان موردنظر را دقیقاً وارد کنید:\n\n' +
      names.join('\n')
    );

    if (!selected || !layouts[selected]) return;

    try {

      this.applyLayoutSnapshot(layouts[selected]);
      this.persistLastLayout();

    } catch {

      window.alert('بازیابی چیدمان انتخاب‌شده ناموفق بود.');
    }
  }

  private getLayoutSnapshot(): Record<string, unknown> {

    return {
      version: 2,
      rootLayout: [...this.rootLayout],
      marketLayout: [...this.marketLayout],
      centerLayout: [...this.centerLayout],
      showOrderBook: this.showOrderBook,
      showActivity: this.showActivity,
    };
  }

  private applyLayoutSnapshot(snapshot: any): void {

    if (!snapshot || snapshot.version !== 2) {
      throw new Error('Unsupported layout version.');
    }

    if (
      !Array.isArray(snapshot.marketLayout) ||
      snapshot.marketLayout.length !== 2
    ) {
      throw new Error('Invalid market layout.');
    }

    if (
      !Array.isArray(snapshot.centerLayout) ||
      snapshot.centerLayout.length !==
        (snapshot.showActivity ? 3 : 2)
    ) {
      throw new Error('Invalid center layout.');
    }

    if (
      !Array.isArray(snapshot.rootLayout) ||
      snapshot.rootLayout.length !==
        (snapshot.showOrderBook ? 3 : 2)
    ) {
      throw new Error('Invalid root layout.');
    }

    this.showOrderBook = Boolean(snapshot.showOrderBook);
    this.showActivity = Boolean(snapshot.showActivity);

    this.rootLayout = [...snapshot.rootLayout];
    this.marketLayout = [...snapshot.marketLayout];
    this.centerLayout = [...snapshot.centerLayout];
  }

  private readNamedLayouts(): Record<string, any> {

    try {

      const raw = localStorage.getItem(this.layoutStorageKey);

      if (!raw) return {};

      const parsed = JSON.parse(raw);

      return parsed && typeof parsed === 'object'
        ? parsed
        : {};

    } catch {

      return {};
    }
  }

  // ----------------------------------------------------------
  // LAST LAYOUT PERSISTENCE
  // ----------------------------------------------------------

  private persistLastLayout(): void {

    try {

      localStorage.setItem(
        this.lastLayoutStorageKey,
        JSON.stringify(this.getLayoutSnapshot())
      );

    } catch {
      // Workspace remains usable if storage is unavailable.
    }
  }

  private restoreLastLayout(): void {

    try {

      const raw = localStorage.getItem(this.lastLayoutStorageKey);

      if (!raw) {
        this.applyPreset('default');
        return;
      }

      this.applyLayoutSnapshot(JSON.parse(raw));

    } catch {

      this.applyPreset('default');
    }
  }

  resetLayout(): void {
    this.applyPreset('default');
  }

  // ----------------------------------------------------------
  // VERTICAL TOOLBAR ACTIONS
  // ----------------------------------------------------------

  selectTool(tool: string): void {

    this.activeTool = tool;

    if (tool === 'history' && !this.showActivity) {
      this.toggleActivity();
    }
  }
}