import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Comment } from '../models/tweet.model';
import { IPaginatedComments } from './../models/tweet.model';
import { TimelineService } from './timeline.service';
import { TweetService } from './tweet.service';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private baseUrl = environment.baseUrl;

  private isLoadingComment = new BehaviorSubject<boolean>(false);
  private comments = new BehaviorSubject<IPaginatedComments>({
    comments: [],
    lastPage: 0,
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
  });

  isLoadingCommentObservable = this.isLoadingComment.asObservable();
  commentsObservable = this.comments.asObservable();

  constructor(
    private http: HttpClient,
    private tweetService: TweetService,
    private timelineService: TimelineService,
    private router: Router
  ) {}

  getTweetComments(tweetId: string, page = 0, size = 20) {
    this.isLoadingComment.next(true);
    return this.http
      .get<IPaginatedComments>(
        `${this.baseUrl}tweet/comments/${tweetId}?size=${size}&page=${page}`
      )
      .pipe(
        tap((IPaginatedComments) => {
          const comments = this.comments.getValue();
          if (comments) {
            IPaginatedComments.comments = [
              ...comments.comments,
              ...IPaginatedComments.comments,
            ];
          }
          this.comments.next(IPaginatedComments);
          this.isLoadingComment.next(false);
        })
      )
      .subscribe();
  }

  loadMoreComments(tweetId: string, size = 20) {
    const comments = this.comments.getValue();
    if (comments && comments.page < comments.totalPages) {
      this.getTweetComments(tweetId, comments.page + 1, size);
    }
  }

  commentOnTweet(tweetId: string, comment: string) {
    return this.http
      .post<Comment>(this.baseUrl + 'tweet/comment/' + tweetId, { comment })
      .pipe(
        tap((comment) => {
          const comments = this.comments.getValue();

          if (comments) {
            comments.comments = [comment, ...comments.comments];
            this.comments.next(comments);
          }
          this.tweetService.increaseCommentCount();
          return comment;
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  commentOnTweetFromDialog(tweetId: string, comment: string) {
    return this.http
      .post<Comment>(this.baseUrl + 'tweet/comment/' + tweetId, { comment })
      .pipe(
        tap((comment) => {
          if (this.router.url === '/home') {
            const newsFeed = this.timelineService.getNewsFeedValue;
            const tweetIndex = newsFeed.tweets.findIndex(
              (tweet) => tweet.id === tweetId
            );
            newsFeed.tweets[tweetIndex].commentCount++;
            this.timelineService.setNewsFeed(newsFeed);
          } else {
            const userTimeline = this.timelineService.getUserTimelineValue;
            const tweetIndex = userTimeline.tweets.findIndex(
              (tweet) => tweet.id === tweetId
            );
            userTimeline.tweets[tweetIndex].commentCount++;
            this.timelineService.setUserTimeline(userTimeline);
          }
          return comment;
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }

  deleteComment(commentId: string) {
    return this.http.delete(this.baseUrl + 'tweet/comment/' + commentId).pipe(
      tap((res) => {
        const comments = this.comments.getValue();
        if (comments) {
          const updatedComments = comments.comments.filter(
            (comment) => comment.id !== commentId
          );
          comments.comments = updatedComments;
          this.comments.next(comments);
        }
        this.tweetService.decreaseCommentCount();
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  public setComments(comments: IPaginatedComments) {
    this.comments.next(comments);
  }
}
