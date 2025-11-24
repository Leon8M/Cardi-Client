import { Client, IMessage, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useGameStore, GameState, GameEvent, EventType } from './store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

class StompManager {
  private static instance: StompManager;
  private client: Client;
  private isConnected: boolean = false;
  private onConnectCallback: (() => void) | null = null;

  private constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      debug: (str) => {
        console.log(new Date(), str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: this.onConnect,
      onDisconnect: this.onDisconnect,
      onStompError: this.onStompError,
    });
  }

  public static getInstance(): StompManager {
    if (!StompManager.instance) {
      StompManager.instance = new StompManager();
    }
    return StompManager.instance;
  }

  private onConnect = () => {
    this.isConnected = true;
    useGameStore.getState().setConnectionStatus('connected');
    console.log('STOMP: Connected');

    // Execute the callback if it exists
    if (this.onConnectCallback) {
      this.onConnectCallback();
      this.onConnectCallback = null; // Reset the callback
    }

    // Subscribe to user-specific queues
    this.client.subscribe('/user/queue/errors', this.onUserError);
    this.client.subscribe('/user/queue/room-updates', this.onRoomUpdate);
  };

  private onDisconnect = () => {
    this.isConnected = false;
    useGameStore.getState().setConnectionStatus('disconnected');
    console.log('STOMP: Disconnected');
  };

  private onStompError = (frame: IFrame) => {
    console.error('Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
    useGameStore.getState().setConnectionStatus('error');
  };

  private onUserError = (message: IMessage) => {
    console.error('Received error from server:', message.body);
    const event: GameEvent = JSON.parse(message.body);
    if (event.type === EventType.ERROR) {
      alert(`Error: ${event.payload}`);
    }
  };

  private onRoomUpdate = (message: IMessage) => {
      console.log('Received room update:', message.body);
      const event: GameEvent = JSON.parse(message.body);
      if (event.type === EventType.ROOM_UPDATE) {
        const gameState: GameState = event.payload;
        useGameStore.getState().setGameState(gameState);
        const username = useGameStore.getState().username;
        const me = gameState.players.find(p => p.username === username);
        if (me) {
            useGameStore.getState().setPlayerId(me.id);
        }
        this.subscribeToRoom(gameState.roomCode);
      }
  }

  private onGameEvent = (message: IMessage) => {
    console.log('Received game event:', message.body);
    const event: GameEvent = JSON.parse(message.body);
    const {
      setGameState,
      handlePlayerJoined,
      handlePlayerLeft,
      handlePlayerReconnected,
      handleCardPlayed,
      handleCardDrawn,
      handleTurnPassed,
      handleCardiCalled,
      handleGameWin
    } = useGameStore.getState();

    switch (event.type) {
      case EventType.GAME_START:
        setGameState(event.payload);
        break;
      case EventType.GAME_STATE_UPDATE:
        setGameState(event.payload);
        break;
      case EventType.PLAYER_JOINED:
        handlePlayerJoined(event.payload);
        break;
      case EventType.PLAYER_RECONNECTED:
        handlePlayerReconnected(event.payload);
        break;
      case EventType.PLAYER_LEFT:
        handlePlayerLeft(event.payload);
        break;
      case EventType.CARD_PLAYED:
        handleCardPlayed(event.payload);
        break;
      case EventType.CARD_DRAWN:
        handleCardDrawn(event.payload);
        break;
      case EventType.TURN_PASSED:
        handleTurnPassed(event.payload);
        break;
      case EventType.CARDI_CALLED:
        handleCardiCalled(event.payload);
        break;
      case EventType.GAME_WIN:
        handleGameWin(event.payload);
        break;
      default:
        console.warn('Unknown game event type:', event.type);
    }
  }

  public connect = (onConnectCallback?: () => void) => {
    if (!this.isConnected) {
      useGameStore.getState().setConnectionStatus('connecting');
      if (onConnectCallback) {
        this.onConnectCallback = onConnectCallback;
      }
      this.client.activate();
    } else if (onConnectCallback) {
      // If already connected, just execute the callback
      onConnectCallback();
    }
  };

  public disconnect = () => {
    if (this.isConnected) {
      this.client.deactivate();
    }
  };

  public subscribeToRoom = (roomCode: string) => {
    this.client.subscribe(`/topic/game/${roomCode}`, this.onGameEvent);
    console.log(`Subscribed to room ${roomCode}`);
  };

  public send(destination: string, body: object) {
    if (this.isConnected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.error('Cannot send message, STOMP client is not connected.');
    }
  }
}
export const stompManager = StompManager.getInstance();
