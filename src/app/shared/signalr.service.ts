import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  public connection: signalR.HubConnection | undefined;

  public startConnection = () => {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7102/chat')
      .build();

    this.connection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log('Error while starting connection: ' + err));
  };

  constructor() {}
}
