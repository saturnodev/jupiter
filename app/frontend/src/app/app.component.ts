import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styles: [
    ':host { display: flex; flex-direction: column; height: 100vh; min-height: 100vh; }',
    'router-outlet { flex: 1 1 0; min-height: 0; display: block; }',
  ],
})
export class AppComponent {}
