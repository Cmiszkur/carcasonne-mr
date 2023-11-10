import { ExtendedTile, Player, PlayersColors, Room, ShortenedRoom } from '../models/Room';
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constants } from '../../constants/httpOptions';
import { tap } from 'rxjs/operators';
import { CreateRoomPayload, JoinRoomPayload, RoomError, SocketAnswer, StartGamePayload } from '../models/socket';
import { CustomError } from 'src/app/commons/customErrorHandler';
import { SocketService } from '../../commons/services/socket.service';
import { AuthService } from 'src/app/user/auth.service';
import { Players } from '../models/Players';

@Injectable({
  providedIn: 'root',
})
export class RoomService extends SocketService {
  /**
   * Backend base url.
   */
  private baseUrl: string;

  /**
   * Available rooms from backend.
   */
  private availableRooms$: BehaviorSubject<ShortenedRoom[] | null>;

  /**
   * Id of room selected, later to bo joined by player.
   */
  private selectedRoomId$: BehaviorSubject<string | null>;

  /**
   * Selected room, later to be joined by player.
   * @private
   */
  private selectedRoom$: BehaviorSubject<ShortenedRoom | null>;

  /**
   * Room which player joined to.
   */
  private currentRoom$: BehaviorSubject<Room | null>;

  /**
   * Holds logged in player and rest of the players.
   */
  private players$: BehaviorSubject<Players | null>;

  constructor(private http: HttpClient, private authService: AuthService) {
    super();
    this.baseUrl = 'http://localhost:3000';
    this.availableRooms$ = new BehaviorSubject<ShortenedRoom[] | null>(null);
    this.selectedRoomId$ = new BehaviorSubject<string | null>(null);
    this.currentRoom$ = new BehaviorSubject<Room | null>(null);
    this.selectedRoom$ = new BehaviorSubject<ShortenedRoom | null>(null);
    this.players$ = new BehaviorSubject<Players | null>(null);
  }

  public get availableRooms(): ShortenedRoom[] | null {
    return this.availableRooms$.value;
  }

  public get selectedRoomId(): string | null {
    return this.selectedRoomId$.value;
  }

  public get selectedRoom(): ShortenedRoom | null {
    return this.selectedRoom$.value;
  }

  public get currentRoomValue(): Room | null {
    return this.currentRoom$.value;
  }

  public get currentRoom(): Observable<Room | null> {
    return this.currentRoom$.asObservable();
  }

  public get players(): Observable<Players | null> {
    return this.players$.asObservable();
  }

  public get playersValue(): Players | null {
    return this.players$.value;
  }

  public setPlayers(players: Players | null): void {
    this.players$.next(players);
  }

  public setSelectedRoomId(roomId: string) {
    this.selectedRoomId$.next(roomId);
  }

  /**
   * Sets selected room and selected room id.
   * @param room
   */
  public set setSelectedRoom(room: ShortenedRoom) {
    this.setSelectedRoomId(room.roomId);
    this.selectedRoom$.next(room);
  }

  public set setCurrentRoom(room: Room) {
    const players: Player[] = room.players;
    this.setPlayers({ loggedPlayer: this.findPlayer(players), otherPlayers: this.getRestOfThePlayers(players) });
    this.currentRoom$.next(room);
  }

  public getRoom(): Observable<Room> {
    this.connect();
    return new Observable(subscriber => {
      this.socket.on('created_room_response', (newRoom: Room) => {
        subscriber.next(newRoom);
        subscriber.complete();
      });
    });
  }

  public getRooms(): Observable<ShortenedRoom[]> {
    const getRoomsUrl = `${Constants.baseUrl}room/get-rooms`;
    return this.http.get<ShortenedRoom[]>(getRoomsUrl, Constants.httpOptions).pipe(tap(rooms => this.availableRooms$.next(rooms)));
  }

  /**
   * Joins room of specified ID and returns socket response.
   * @param color - meeple color
   * @param roomID - id of room to join
   */
  public joinRoom(color?: string, roomID?: string): Observable<SocketAnswer> {
    const _roomID: string | undefined = this.selectedRoomId || roomID;
    if (!_roomID) {
      throw new CustomError(RoomError.ROOM_ID_NOT_SPECIFIED, 'Choose room which you want to join');
    }
    //TODO: Zastanowić się nad obłsugą tego błedu lub rezygnacją ze sprawdzania tego na froncie.
    // if (!color && !this.currentRoomValue?.gameStarted) {
    //   console.log(this.currentRoomValue);
    //   throw new CustomError(RoomError.MEEPLE_COLOR_NOT_SPECIFIED, 'Choose your meeple color');
    // }
    const joinRoomPayload: JoinRoomPayload = { roomID: _roomID, color };
    this.connect();
    this.socket.emit('join_room', joinRoomPayload);
    return this.receiveJoinRoomResponse();
  }

  /**
   * Creates room, updates current room and returns socket response.
   * @param color - meeple color
   */
  public createRoom(color?: PlayersColors | null): Observable<SocketAnswer> {
    if (!color) {
      throw new CustomError(RoomError.MEEPLE_COLOR_NOT_SPECIFIED, 'Choose your meeple color');
    }
    const createRoomPayload: CreateRoomPayload = { color };
    this.connect();
    this.socket.emit('create_room', createRoomPayload);
    return this.receiveCreateRoomResponse();
  }

  /**
   * Starts the game, start game response listener is set in ``RoomComponent``..
   */
  public startGame(): void {
    const roomID: string | undefined = this.currentRoomValue?.roomId;
    if (!roomID) {
      throw new CustomError(RoomError.ROOM_NOT_FOUND, 'Try reloading the page');
    }
    const startGamePayload: StartGamePayload = { roomID };
    this.socket.emit('start_game', startGamePayload);
  }

  public placeTile(tile: ExtendedTile): void {
    this.socket.emit('tile_placed', { roomID: this.currentRoomValue?.roomId, extendedTile: tile });
  }

  /**
   * Listens for ``joined_room`` response from socket.io backend.
   * If room is returned it's being set as current room.
   */
  public receiveJoinRoomResponse(): Observable<SocketAnswer> {
    return this.fromEventOnce<SocketAnswer>('joined_room').pipe(tap(socketAnswer => this.updateRoom(socketAnswer)));
  }

  /**
   * Listens for ``game_started`` response from socket.io backend.
   * If room is returned it's being set as current room.
   */
  public receiveGameStartedResponse(): Observable<SocketAnswer> {
    this.connect();
    return this.fromEventOnce<SocketAnswer>('game_started').pipe(tap(socketAnswer => this.updateRoom(socketAnswer)));
  }

  /**
   * Listens for ``new_player_joined`` response from socket.io backend.
   * Updates current room with returned players.
   */
  public receiveNewPlayerJoinedResponse(): Observable<Player[]> {
    this.connect();
    return this.fromEvent<Player[]>('new_player_joined').pipe(tap(players => this.updatePlayers(players)));
  }

  /**
   * Listens for ``player_left`` response from socket.io backend.
   * Updates current room with returned players.
   */
  public receivePlayerLeftResponse(): Observable<Player[]> {
    this.connect();
    return this.fromEvent<Player[]>('player_left').pipe(tap(players => this.updatePlayers(players)));
  }

  /**
   * Listens for ``tile_placed_new_tile_distributed`` response from socket.io backend.
   * Updates current room with returned new tiles.
   * @returns
   */
  public receiveTilePlacedResponse(): Observable<SocketAnswer> {
    this.connect();
    return this.fromEvent<SocketAnswer>('tile_placed_new_tile_distributed').pipe(tap(socketAnswer => this.updateRoom(socketAnswer)));
  }

  /**
   * Listens for ``game_started`` response from socket.io backend.
   * If room is returned it's being set as current room.
   */
  private receiveCreateRoomResponse(): Observable<SocketAnswer> {
    this.connect();
    return this.fromEventOnce<SocketAnswer>('created_room_response').pipe(tap(socketAnswer => this.updateRoom(socketAnswer)));
  }

  /**
   * Updates players in current room.
   * @param players
   * @private
   */
  private updatePlayers(players: Player[]): void {
    const currentRoom: Room | null = this.currentRoomValue;
    if (!currentRoom) return;
    currentRoom.players = players;
    this.setCurrentRoom = currentRoom;
  }

  /**
   * Updates current room.
   * @param socketAnswer
   * @private
   */
  private updateRoom(socketAnswer: SocketAnswer): void {
    const room: Room | null = socketAnswer.answer?.room || null;
    if (room) this.setCurrentRoom = room;
  }

  /**
   * Finds player that corresponds to username of logged in user.
   * @private
   */
  private findPlayer(players: Player[]): Player | null {
    return players.find(player => player.username === this.authService.user?.username) || null;
  }

  /**
   * Returns all players but the one logged in.
   * @param players
   * @private
   */
  private getRestOfThePlayers(_players: Player[]): Player[] {
    const players: Player[] = Constants.copy<Player[]>(_players);
    players.forEach((player, index, array) => {
      if (player.username === this.authService.user?.username) delete array[index];
    });
    return players;
  }
}
