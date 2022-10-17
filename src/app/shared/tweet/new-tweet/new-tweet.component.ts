import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TweetService } from './../../../tweet/tweet.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-tweet',
  templateUrl: './new-tweet.component.html',
  styleUrls: ['./new-tweet.component.scss'],
})
export class NewTweetComponent implements OnInit {
  newTweetForm = new FormGroup({
    tweet: new FormControl('', [Validators.required]),
  });

  constructor(
    private tweetService: TweetService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  create() {}

  onSubmit() {
    if (!this.newTweetForm.valid) {
      return;
    }

    this.tweetService
      .createTweet(this.newTweetForm.value.tweet as string)
      .subscribe({
        next: (tweet) => {
          this.toastr.success('Tweeted successfully');
          this.newTweetForm.reset();
        },
        error: (error) => {
          this.toastr.error(error.error.message);
        },
      });
  }

  onBlur(key: string) {
    let form = this.newTweetForm;
    form.controls.tweet.markAsUntouched();
  }
}
