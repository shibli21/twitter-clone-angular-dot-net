import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Comment, Tweet } from './models/tweet.model';
import { TweetService } from './tweet.service';
import { AuthService } from './../auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-tweet',
  templateUrl: './tweet.component.html',
  styleUrls: ['./tweet.component.scss'],
})
export class TweetComponent implements OnInit {
  items!: MenuItem[];
  display = false;
  tweet!: Tweet;
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
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.tweetId = params['id'];
      this.tweetService.getTweet(this.tweetId).subscribe((res) => {
        this.tweet = res;
        this.editTweet = this.tweet.tweet;
      });
      this.tweetService.getComments(this.tweetId).subscribe((res) => {
        this.comments = res;
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

  commentOnTweet() {
    this.isCommenting = true;
    this.tweetService
      .commentOnTweet(this.tweet.id, this.comment)
      .subscribe((comment) => {
        console.log(comment);

        this.authService.currentUser().subscribe((user) => {
          let newComment: Comment = {
            id: comment.id,
            userId: user.id,
            tweetId: this.tweet.id,
            comment: this.comment,
            createdAt: comment.createdAt,
            user: user,
          };

          this.comments.push(newComment);
          this.isCommenting = false;
          this.display = false;
          this.comment = '';
        });
      });
  }

  likeUnlike() {
    this.tweetService.likeTweet(this.tweet.id).subscribe({
      next: (res) => {
        this.tweetService.getTweet(this.tweetId).subscribe((res) => {
          this.tweet = res;
        });
      },
    });
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
