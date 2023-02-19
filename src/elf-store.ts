import { createStore } from '@ngneat/elf';
import { withEntities } from '@ngneat/elf-entities';
import { createEffect, ofType, createAction, props } from '@ngneat/effects';
import { trackRequestResult } from '@ngneat/elf-requests';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ToDo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const todoStore = createStore({ name: 'todos' }, withEntities<ToDo>());

todoStore.update();

const loadTodos = createAction('[Todos] Load');
const UpdateTodo = createAction('[Todos] Load', props());
const UpdateTodoSuccess = createAction('[Todos] Load');
const UpdateTodoFail = createAction('[Todos] Load');

// export const loadTodos$ = createEffect((actions) =>
//   actions.pipe(
//     ofType(loadTodos),
//     switchMap((todo) => todosApi.loadTodos()),
//     tap(setTodos)
//   )
// );

@Injectable()
export class TodosRepository {
  constructor(private http: HttpClient) {}

  getTodos() {
    return this.http
      .get('https://jsonplaceholder.typicode.com/users/1/todos')
      .pipe(trackRequestResult(['todos']));
  }
}
