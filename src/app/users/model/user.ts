/**
 * A model for an individual user
 */
export class User {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public dateOfBirth: Date
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.dateOfBirth = dateOfBirth;
  }
}
