import { createStore } from "@ngneat/elf";
import {
  selectActiveEntity,
  selectAllEntities,
  selectEntity,
  setEntities,
  updateEntities,
  withEntities,
} from "@ngneat/elf-entities";
import {
  createEffect,
  ofType,
  createAction,
  props,
  payload,
  createEffectFn,
  dispatch,
  actionsFactory,
  Actions,
} from "@ngneat/effects";
import {
  createRequestDataSource,
  joinRequestResult,
  trackRequestResult,
  withRequestsStatus,
} from "@ngneat/elf-requests";
import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, mergeMap, Observable, ReplaySubject, switchMap, tap } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { EffectFn } from "@ngneat/effects-ng";

interface ToDo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const todoStore$ = createStore(
  { name: "todos" },
  withEntities<ToDo>(),
  withRequestsStatus()
);

const todoActions = actionsFactory("todo");
const LoadTodos = todoActions.create("load todos");
const UpdateTodo = todoActions.create("update todo", props<{ todo: ToDo }>());
const UpdateTodoSuccess = todoActions.create(
  "update todo success",
  props<{ todo: ToDo }>()
);
const UpdateTodoFail = todoActions.create("update todo fail");
export { LoadTodos, UpdateTodo, UpdateTodoSuccess, UpdateTodoFail };

const { setSuccess, trackRequestStatus, data$ } = createRequestDataSource({
  data$: () => todoStore$.pipe(selectAllEntities()),
  requestKey: "todos",
  dataKey: "todos",
  store: todoStore$,
});

const todos$ = data$();
todos$.subscribe(({ error, loading, todos }) => console.log());

@Injectable()
export class TodosService {
  constructor(private http: HttpClient) {}

  getTodos() {
    return this.http.get<ToDo[]>("https://jsonplaceholder.typicode.com/todos");
  }

  updateTodo(todo: ToDo) {
    return this.http.put<ToDo>(
      `https://jsonplaceholder.typicode.com/todos/${todo.id}`,
      todo
    );
  }
}

@Injectable()
export class TodosEffects extends EffectFn {
  constructor(private todosService: TodosService) {
    super();
  }

  private setTodos = (todos: ToDo[]) => {
    todoStore$.update(setEntities(todos), setSuccess());
  };

  getTodosEffect$ = createEffect((actions) =>
    actions.pipe(
      ofType(LoadTodos),
      switchMap(() => this.todosService.getTodos()),
      tap(this.setTodos)
    )
  );

  getTodos = this.createEffectFn(($: Observable<void>) => {
    return $.pipe(
      trackRequestStatus(),
      switchMap(() => this.todosService.getTodos()),
      tap(this.setTodos)
    );
  });

  updateTodo = this.createEffectFn((todo$: Observable<ToDo>) =>
    todo$.pipe(
      switchMap((todo) => this.todosService.updateTodo(todo)),
      tap({
        next: (todo: ToDo) => todoStore$.update(updateEntities(todo.id, todo)),
      })
    )
  );
}
