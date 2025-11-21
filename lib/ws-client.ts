import { Client, IMessage, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useGameStore, GameState } from './store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

class StompManager {
  private static instance: StompManager;
  private client: Client;
  private isConnected: boolean = false;

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
    // Here you could update the store with the error message to show in the UI
    // Example: useGameStore.getState().setLastError(message.body);
    alert(`Error: ${message.body}`);
  };

  private onRoomUpdate = (message: IMessage) => {
      console.log('Received room update:', message.body);
      const gameState: GameState = JSON.parse(message.body);
      
      // Set the initial game state
      useGameStore.getState().setGameState(gameState);

      // Find our player ID
      const username = useGameStore.getState().username;
      const me = gameState.players.find(p => p.username === username);
      if (me) {
          useGameStore.getState().setPlayerId(me.id);
      }
      
      this.subscribeToRoom(gameState.roomCode);
  }

  public connect = () => {
    if (!this.isConnected) {
      useGameStore.getState().setConnectionStatus('connecting');
      this.client.activate();
    }
  };

  public disconnect = () => {
    if (this.isConnected) {
      this.client.deactivate();
    }
  };

  public subscribeToRoom = (roomCode: string) => {
    this.client.subscribe(`/topic/game/${roomCode}`, (message) => {
      console.log(`Received game state for room ${roomCode}:`, message.body);
      const gameState: GameState = JSON.parse(message.body);
      useGameStore.getState().setGameState(gameState);
    });
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
