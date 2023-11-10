import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoomComponent } from './room.component';
import { WaitingRoomComponent } from './waiting-room/waiting-room.component';
import { PlayingRoomComponent } from './playing-room/playing-room.component';
import { JoinRoomResolver } from './resolvers/join-room.resolver';

const routes: Routes = [
  {
    path: '',
    component: RoomComponent,
    children: [
      {
        path: '',
        redirectTo: 'waiting-room',
        pathMatch: 'full',
      },
      {
        path: 'waiting-room',
        resolve: {
          joinedRoom: JoinRoomResolver,
        },
        component: WaitingRoomComponent,
      },
      {
        path: 'playing-room',
        resolve: {
          joinedRoom: JoinRoomResolver,
        },
        component: PlayingRoomComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoomRoutingModule {}
