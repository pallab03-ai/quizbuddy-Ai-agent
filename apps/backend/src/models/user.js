// src/models/user.js
// User DTO for type safety and clarity
class User {
  constructor(id, username, role) {
    this.id = id;
    this.username = username;
    this.role = role;
  }
}

export default User;
