import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-comment',
  templateUrl: './new-comment.component.html',
  styleUrls: ['./new-comment.component.scss'],
})
export class NewCommentComponent implements OnInit {
  @Input() addNewComment() {}
  comment = '';

  constructor() {}

  ngOnInit(): void {}

  addComment() {
    this.addNewComment();
  }
}
