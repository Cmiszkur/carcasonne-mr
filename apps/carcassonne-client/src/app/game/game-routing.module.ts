import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoomResolver } from './resolvers/room.resolver';
import { StartingRoomComponent } from './starting-room/starting-room.component';
import { GameComponent } from './game.component';
import { AuthGuard } from '../user/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: GameComponent,
    children: [
      {
        path: '',
        resolve: {
          rooms: RoomResolver,
        },
        component: StartingRoomComponent,
      },
      {
        path: 'room',
        canActivate: [AuthGuard],
        loadChildren: () => import('./room/room.module').then((m) => m.RoomModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameRoutingModule {}
