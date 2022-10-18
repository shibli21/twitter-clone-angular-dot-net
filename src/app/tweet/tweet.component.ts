import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MenuItem } from 'primeng/api';
import { CommentService } from './comment.service';
import { Comment, Tweet } from './models/tweet.model';
import { TweetService } from './tweet.service';

@Component({
  selector: 'app-tweet',
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.scss'],
})
export class TweetComponent implements OnInit {
  items!: MenuItem[];
  display = false;
  tweet!: Tweet | null;
  editTweet: string = '';
  comment = '';
  tweetId = '';
  isCommenting = false;
  isEditing = false;
  comments: Comment[] = [];

  constructor(
    private tweetService: TweetService,
    private router: Router,
    private route: ActivatedRoute,
    private commentService: CommentService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.tweetId = params['id'];
      this.tweetService.getTweet(this.tweetId).subscribe({
        next: (res) => {
          this.tweet = res;
          this.editTweet = this.tweet.tweet;
        },
        error: (err) => {},
      });
      this.commentService.comments.subscribe((comments) => {
        this.commentService.getComments(this.tweetId).subscribe((res) => {
          this.comments = res;
        });
        this.comments = comments || [];
      });
    });

    this.items = [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
          this.display = true;
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
  }

  likeUnlike() {
    if (this.tweet) {
      this.tweetService.likeTweet(this.tweet.id).subscribe({
        next: (res) => {
          this.tweetService.getTweet(this.tweetId).subscribe((res) => {
            this.tweet = res;
          });
        },
      });
    }
  }

  onEditTweet() {
    this.isEditing = true;
    this.tweetService.editTweet(this.tweetId, this.editTweet).subscribe({
      next: (res) => {
        this.tweetService.getTweet(this.tweetId).subscribe((res) => {
          this.tweet = res;
          this.display = false;
          this.isEditing = false;
        });
      },
    });
  }

  deleteTweet() {
    this.tweetService.deleteTweet(this.tweetId).subscribe({
      next: (res) => {
        this.router.navigate(['/profile']);
        this.toastr.success('Tweet deleted successfully');
      },
    });
  }
}
