import { Component, input } from '@angular/core';

@Component({
  selector: 'igd-feature-placeholder-page',
  standalone: true,
  templateUrl: './feature-placeholder.page.html',
  styleUrl: './feature-placeholder.page.css',
})
export class FeaturePlaceholderPage {
  readonly heading = input.required<string>();
  readonly description = input.required<string>();
}