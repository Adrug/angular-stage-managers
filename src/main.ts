import "zone.js/dist/zone";
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { bootstrapApplication } from "@angular/platform-browser";
import { LoadTodos, TodosEffects, TodosService } from "./elf-store";
import { HttpClientModule } from "@angular/common/http";
import { Actions, provideEffects, provideEffectsManager } from "@ngneat/effects-ng";

@Component({
  selector: "my-app",
  standalone: true,
  providers: [TodosService],
  imports: [CommonModule],
  template: `
    <h1>Hello from {{ name }}!</h1>
    <a target="_blank" href="https://angular.io/start">
      Learn more about Angular
    </a>
  `,
})
export class App implements OnInit {
  name = "Angular";

  constructor(
    private todosRepo: TodosService,
    private todosEffects: TodosEffects,
    private actions: Actions

  ) {}

  ngOnInit(): void {
      // direct call way
      this.todosRepo.getTodos().subscribe();

      // direct call effect
      this.todosEffects.getTodos();
      // actions like way
      this.actions.dispatch(LoadTodos());
  }
}

bootstrapApplication(App, {
  providers: [
    HttpClientModule,
    provideEffectsManager(),
    provideEffects(TodosEffects),
  ],
});
