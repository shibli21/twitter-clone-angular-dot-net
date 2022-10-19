import { environment } from 'src/environments/environment';
import { BehaviorSubject, catchError, throwError, tap } from 'rxjs';
import { AuthService } from './../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Comment } from './models/tweet.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  comments = new BehaviorSubject<Comment[] | null>(null);

  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getComments(tweetId: string, page = 1, size = 10) {
    return this.http
      .get<Comment[]>(
        this.baseUrl + `tweet/comments/${tweetId}?size=${size}&page=${page}`
      )
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  commentOnTweet(tweetId: string, comment: string) {
    return this.http
      .post<Comment>(this.baseUrl + 'tweet/comment/' + tweetId, { comment })
      .pipe(
        tap((comment) => {
          this.comments.next([comment, ...(this.comments.value || [])]);
          return comment;
        }),
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  deleteComment(commentId: string) {
    return this.http.delete(this.baseUrl + 'tweet/comment/' + commentId).pipe(
      catchError((err) => {
        return throwError(err);
      })
    );
  }
}
