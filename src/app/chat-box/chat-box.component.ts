import { AuthService } from './../auth/auth.service';
import { async } from '@angular/core/testing';
import { SignalrService } from './../shared/signalr.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss'],
})
export class ChatBoxComponent implements OnInit {
  sendMessageForm = new FormGroup({
    message: new FormControl(''),
  });

  username!: string;

  chats: { name: string; message: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private signalrService: SignalrService
  ) {}

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.username = params['username'];
    });

    this.signalrService.startConnection();

    this.signalrService.connection?.on('ReceiveMessage', (user, message) => {
      this.chats.push({
        name: user,
        message,
      });
    });

    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop =
        this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  onSendMessage() {
    if (!this.sendMessageForm.valid) {
      return;
    }

    if (this.sendMessageForm.value.message.trim() === '') {
      return;
    }

    // this.authService.user.subscribe((user) => {
    //   this.signalrService.connection?.invoke(
    //     'SendMessage',
    //     user?.username,
    //     // this.username,
    //     this.sendMessageForm.value.message
    //   );
    // });

    this.authService.user.subscribe((user) => {
      this.signalrService.connection
        ?.invoke(
          'SendMessageToUser',
          user?.username,
          this.username,
          this.sendMessageForm.value.message
        )
        .then((s) => {
          console.log(s);
        })
        .catch((err) => console.log(err));
    });

    // const { message } = this.sendMessageForm.value;
    // this.chats.push({
    //   name: 'Shibli',
    //   message,
    // });

    this.sendMessageForm.reset();
  }
}
