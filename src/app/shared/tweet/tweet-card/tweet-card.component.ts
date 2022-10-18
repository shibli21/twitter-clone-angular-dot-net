import { ToastrService } from 'ngx-toastr';
import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Tweet } from './../../../tweet/models/tweet.model';
import { TweetService } from './../../../tweet/tweet.service';

@Component({
  selector: 'app-tweet-card',
  templateUrl: './tweet-card.component.html',
  styleUrls: ['./tweet-card.component.scss'],
})
export class TweetCardComponent implements OnInit {
  items!: MenuItem[];
  @Input() tweet!: Tweet;
  comment = '';
  isCommenting = false;
  isEditing = false;
  display: boolean = false;
  displayEditDialog: boolean = false;
  editTweet = '';

  constructor(
    private tweetService: TweetService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
          this.showEditDialog();
        },
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
          this.deleteTweet();
        },
      },
    ];
    this.editTweet = this.tweet.tweet;
  }

  showDialog() {
    this.display = true;
  }
  showEditDialog() {
    this.displayEditDialog = true;
  }

  commentOnTweet() {
    this.isCommenting = true;
    this.tweetService.commentOnTweet(this.tweet.id, this.comment).subscribe({
      next: () => {
        this.tweetService.getTweet(this.tweet.id).subscribe((res) => {
          this.tweet = res;
        });
        this.isCommenting = false;
        this.display = false;
        this.comment = '';
      },
    });
  }

  likeUnlike() {
    this.tweetService.likeTweet(this.tweet.id).subscribe({
      next: (res) => {
        this.tweetService.getTweet(this.tweet.id).subscribe((res) => {
          this.tweet = res;
        });
      },
    });
  }

  onEditTweet() {
    this.isEditing = true;
    this.tweetService.editTweet(this.tweet.id, this.editTweet).subscribe({
      next: (res) => {
        this.tweetService.getTweet(this.tweet.id).subscribe((res) => {
          this.tweet = res;
          this.displayEditDialog = false;
          this.isEditing = false;
        });
      },
    });
  }

  deleteTweet() {
    this.tweetService.deleteTweet(this.tweet.id).subscribe({
      next: (res) => {
        this.toastr.success('Tweet deleted successfully');
      },
    });
  }
}
