import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../auth/auth.service';
import { Comment } from '../models/tweet.model';
import { TweetService } from './tweet.service';
import { PaginatedComments } from './../models/tweet.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  isLoadingComment = new BehaviorSubject<boolean>(false);
  comments = new BehaviorSubject<PaginatedComments>({
    comments: [],
    lastPage: 0,
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
  });

  baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private tweetService: TweetService
  ) {}

  getTweetComments(tweetId: string, page = 0, size = 20) {
    this.isLoadingComment.next(true);
    return this.http
      .get<PaginatedComments>(
        `${this.baseUrl}tweet/comments/${tweetId}?size=${size}&page=${page}`
      )
      .pipe(
        tap((paginatedComments) => {
          const comments = this.comments.getValue();
          if (comments) {
            paginatedComments.comments = [
              ...comments.comments,
              ...paginatedComments.comments,
            ];
          }
          this.comments.next(paginatedComments);
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
          const user = this.authService.user.getValue();
          let newComment: Comment;

          newComment = {
            ...comment,
            user: {
              id: user!.id,
              userName: user!.userName,
              firstName: user!.firstName,
              lastName: user!.lastName,
              profilePictureUrl: user!.profilePictureUrl,
              coverPictureUrl: user!.coverPictureUrl,
              address: user!.address,
              bio: user!.bio,
              dateOfBirth: user!.dateOfBirth,
            },
          };

          if (comments) {
            comments.comments = [newComment, ...comments.comments];
            this.comments.next(comments);
          }

          this.tweetService.tweet.getValue()!.commentCount++;
          return comment;
        }),
        catchError((err) => {
          return throwError(err);
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
        this.tweetService.tweet.getValue()!.commentCount--;
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }
}
