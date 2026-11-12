import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'igd-general-market',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
  ],
  templateUrl: './general-market.html',
  styleUrl: './general-market.css',
})
export class GeneralMarketPage {
  orderBookCollapsed = false;
  detailsCollapsed = false;

  activeTool = 'market';

  toggleOrderBook(): void {
    this.orderBookCollapsed = !this.orderBookCollapsed;
  }

  toggleDetails(): void {
    this.detailsCollapsed = !this.detailsCollapsed;
  }

  selectTool(tool: string): void {
    this.activeTool = tool;
  }
}