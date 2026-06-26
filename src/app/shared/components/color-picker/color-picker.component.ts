import {
  Component, Input, Output, EventEmitter, ElementRef, ViewChild,
  OnChanges, AfterViewInit, OnDestroy, SimpleChanges,
  CUSTOM_ELEMENTS_SCHEMA, HostListener, ChangeDetectorRef, inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import 'vanilla-colorful/hex-color-picker.js';

const PRESETS = [
  '#7c3aed','#06b6d4','#f43f5e','#10b981','#f59e0b',
  '#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316',
  '#ffffff','#e2e8f0','#94a3b8','#334155','#0f172a',
  '#fef3c7','#d1fae5','#dbeafe','#fce7f3','#000000',
];

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="cpicker" [class.open]="open">
      <button type="button" class="cpicker-trigger" (click)="toggle()">
        <span class="cpick-swatch" [style.background]="color"></span>
        <span class="cpick-hex">{{ color }}</span>
        <span class="cpick-chevron" [class.up]="open">▾</span>
      </button>

      @if (open) {
        <div class="cpicker-panel" (click)="$event.stopPropagation()">
          <hex-color-picker #pickerEl [attr.color]="color"></hex-color-picker>

          <div class="preset-grid">
            @for (p of presets; track p) {
              <button type="button" class="preset-dot"
                [style.background]="p" [class.sel]="p === color"
                (click)="select(p)" [title]="p">
              </button>
            }
          </div>

          <div class="hex-row">
            <span class="hex-hash">#</span>
            <input type="text" [value]="hexRaw()"
              (input)="onHexInput($event)"
              (keydown.enter)="close()"
              maxlength="6" class="hex-inp" placeholder="7c3aed" />
            <button type="button" class="hex-ok" (click)="close()">OK</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; position: relative; }

    .cpicker-trigger {
      display: flex; align-items: center; gap: 10px; width: 100%;
      padding: 8px 14px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px; cursor: pointer; color: #eeeeff;
      transition: border-color 0.15s, background 0.15s;
    }
    .cpicker-trigger:hover { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.09); }
    .cpicker.open .cpicker-trigger { border-color: #7c3aed; }

    .cpick-swatch {
      width: 26px; height: 26px; border-radius: 7px;
      border: 1px solid rgba(255,255,255,0.2); flex-shrink: 0;
      transition: transform 0.15s;
    }
    .cpicker-trigger:hover .cpick-swatch { transform: scale(1.1); }
    .cpick-hex {
      flex: 1; text-align: left; font-family: 'Courier New', monospace;
      font-size: 0.85rem; color: rgba(255,255,255,0.7); letter-spacing: 0.04em;
    }
    .cpick-chevron { color: rgba(255,255,255,0.3); transition: transform 0.2s; }
    .cpick-chevron.up { transform: rotate(180deg); }

    .cpicker-panel {
      position: absolute; top: calc(100% + 8px); left: 0; z-index: 200;
      width: 240px;
      background: #111127;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px; padding: 14px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15);
      animation: dropIn 0.18s cubic-bezier(0.22,1,0.36,1) both;
    }
    @keyframes dropIn {
      from { opacity:0; transform: translateY(-8px) scale(0.97); }
      to   { opacity:1; transform: none; }
    }

    /* vanilla-colorful overrides */
    hex-color-picker { width: 100% !important; }
    ::ng-deep hex-color-picker .saturation { border-radius: 8px !important; height: 140px !important; }
    ::ng-deep hex-color-picker .hue { border-radius: 6px !important; height: 14px !important; margin-top: 10px !important; }
    ::ng-deep hex-color-picker .color-picker { background: transparent !important; box-shadow: none !important; padding: 0 !important; width: 212px !important; }
    ::ng-deep hex-color-picker .saturation .cursor,
    ::ng-deep hex-color-picker .hue .cursor { width: 18px !important; height: 18px !important; border: 2px solid white !important; }

    /* Presets */
    .preset-grid {
      display: grid; grid-template-columns: repeat(10, 1fr);
      gap: 4px; margin: 12px 0 10px;
    }
    .preset-dot {
      width: 100%; aspect-ratio: 1; border-radius: 5px; padding: 0;
      border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
      transition: transform 0.12s;
    }
    .preset-dot:hover { transform: scale(1.25); z-index: 1; position: relative; }
    .preset-dot.sel { border: 2px solid white; box-shadow: 0 0 0 2px #7c3aed; }

    /* Hex row */
    .hex-row {
      display: flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; padding: 6px 10px;
    }
    .hex-hash { color: rgba(255,255,255,0.3); font-family: monospace; font-size: 0.9rem; }
    .hex-inp {
      flex: 1; background: transparent; border: none; color: #eeeeff;
      font-family: 'Courier New', monospace; font-size: 0.9rem;
      letter-spacing: 0.05em; text-transform: uppercase;
    }
    .hex-inp:focus { outline: none; }
    .hex-ok {
      padding: 3px 10px;
      background: rgba(124,58,237,0.3); border: 1px solid rgba(124,58,237,0.5);
      color: #c4b5fd; border-radius: 6px; font-size: 0.78rem; cursor: pointer;
    }
    .hex-ok:hover { background: rgba(124,58,237,0.5); }
  `],
})
export class ColorPickerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() color = '#7c3aed';
  @Output() colorChange = new EventEmitter<string>();
  @ViewChild('pickerEl') pickerEl?: ElementRef;

  open = false;
  presets = PRESETS;

  private cdr = inject(ChangeDetectorRef);
  private hostEl = inject(ElementRef);

  private changeHandler = (e: Event) => {
    const val = (e as CustomEvent).detail?.value;
    if (val && val !== this.color) {
      this.color = val;
      this.colorChange.emit(val);
      this.cdr.markForCheck();
    }
  };

  hexRaw() { return this.color.replace('#', ''); }

  ngAfterViewInit() { this.attachListener(); }

  ngOnChanges(ch: SimpleChanges) {
    if (ch['color'] && this.pickerEl?.nativeElement) {
      this.pickerEl.nativeElement.setAttribute('color', this.color);
    }
  }

  ngOnDestroy() {
    this.pickerEl?.nativeElement?.removeEventListener('color-changed', this.changeHandler);
  }

  private attachListener() {
    this.pickerEl?.nativeElement?.addEventListener('color-changed', this.changeHandler);
  }

  toggle() {
    this.open = !this.open;
    if (this.open) setTimeout(() => this.attachListener(), 50);
  }

  close() { this.open = false; }

  select(p: string) {
    this.color = p;
    this.colorChange.emit(p);
    this.pickerEl?.nativeElement?.setAttribute('color', p);
  }

  onHexInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value.replace(/[^0-9a-fA-F]/g, '');
    if (raw.length === 6) {
      const val = '#' + raw;
      this.color = val;
      this.colorChange.emit(val);
      this.pickerEl?.nativeElement?.setAttribute('color', val);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.hostEl.nativeElement.contains(e.target)) this.close();
  }
}
