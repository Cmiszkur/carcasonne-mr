import { environment } from '@nest-backend/src/environments/environment.prod';
import { GameService } from './services/game.service';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import RoomService from './services/room.service';
import {
  CreateRoomPayload,
  ExtendedSocket,
  JoinRoomPayload,
  LeaveRoomPayload,
  PlacedTilePayload,
  StartGamePayload,
  RoomError,
  SocketAnswer,
} from '@carcasonne-mr/shared-interfaces';
import * as crypto from 'crypto';
import { PlacedTilePayloadPipe } from './transformers/placed-tile-payload.pipe';

@WebSocketGateway(environment.production ? 2083 : 3001)
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private roomService: RoomService, private gameService: GameService) {}

  @SubscribeMessage('join_room')
  async handleMessage(client: ExtendedSocket, payload: JoinRoomPayload): Promise<void> {
    const roomId: string = payload.roomID;
    const joinedRoomAnswer: SocketAnswer = await this.roomService.joinRoom(
      roomId,
      client.username,
      payload.color
    );

    if (
      joinedRoomAnswer.error === null ||
      joinedRoomAnswer.error === RoomError.PLAYER_ALREADY_IN_THE_ROOM
    ) {
      void client.join(roomId);
      client.gameRoomId = roomId;
      this.server.to(roomId).emit('new_player_joined', joinedRoomAnswer?.answer?.room?.players);
    }
    client.emit('joined_room', joinedRoomAnswer);
  }

  @SubscribeMessage('create_room')
  async handleRoomCreate(client: ExtendedSocket, payload: CreateRoomPayload): Promise<void> {
    const roomID = crypto.randomBytes(20).toString('hex');
    const host = client.username;
    const color = payload.color;
    const createdRoom: SocketAnswer = await this.roomService.roomCreate(host, roomID, color);
    if (createdRoom.error === null) {
      void client.join(roomID);
      client.gameRoomId = roomID;
    }
    this.server.to(roomID).emit('created_room_response', createdRoom);
  }

  @SubscribeMessage('leave_room')
  async handleRoomLeave(client: ExtendedSocket, payload: LeaveRoomPayload): Promise<void> {
    const leftRoom: SocketAnswer = await this.roomService.leaveRoom(
      payload.roomID,
      client.username
    );
    if (leftRoom.error === null) {
      void client.leave(payload.roomID);
      client.gameRoomId = undefined;
      this.server.to(payload.roomID).emit('player_left', leftRoom?.answer?.room?.players);
    }
    //TODO: Zastanowić się nad zmianą zwracanej odpowiedzi na krótszą albo generalnie nad
    //sensem zwracania odpowiedzi przy opuszczaniu pokoju.
    client.emit('room_left', leftRoom);
  }

  @SubscribeMessage('start_game')
  async handleStartGame(client: ExtendedSocket, payload: StartGamePayload): Promise<void> {
    const username: string = client.username;
    const startedRoomAnswer: SocketAnswer = await this.gameService.startGame(
      payload.roomID,
      username
    );
    this.server.to(payload.roomID).emit('game_started', startedRoomAnswer);
  }

  @SubscribeMessage('tile_placed')
  async handleTilePlace(
    @ConnectedSocket() client: ExtendedSocket,
    @MessageBody(PlacedTilePayloadPipe) payload: PlacedTilePayload
  ): Promise<void> {
    const roomID: string = payload.roomID;
    const placedTileRoomAnswer: SocketAnswer = await this.gameService.placeTile(
      client.username,
      roomID,
      payload.extendedTile
    );

    if (placedTileRoomAnswer.error === null) {
      this.server.to(roomID).emit('tile_placed_new_tile_distributed', placedTileRoomAnswer);
    } else {
      client.emit('tile_placed_new_tile_distributed', placedTileRoomAnswer);
    }
  }

  handleConnection(client: ExtendedSocket): void {
    console.log(client.username, ' connected');
  }

  handleDisconnect(client: ExtendedSocket): void {
    if (client.gameRoomId) {
      void this.handleRoomLeave(client, { roomID: client.gameRoomId });
    }
    console.log(client.username, ' disconnected');
  }
}
