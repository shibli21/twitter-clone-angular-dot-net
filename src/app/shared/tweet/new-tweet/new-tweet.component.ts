import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TweetService } from '../../../core/services/tweet.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-tweet',
  templateUrl: './new-tweet.component.html',
  styleUrls: ['./new-tweet.component.scss'],
})
export class NewTweetComponent implements OnInit {
  tweet = '';
  isLoading = false;

  constructor(
    private tweetService: TweetService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  create() {}

  onSubmit() {
    this.isLoading = true;

    this.tweetService.createTweet(this.tweet).subscribe({
      next: (tweet) => {
        this.toastr.success('Tweeted successfully');
        this.tweet = '';
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error(error.error.message);
        this.isLoading = false;
      },
    });
  }
}
