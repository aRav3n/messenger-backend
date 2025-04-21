# Messenger Project Backend for [The Odin Project](https://www.theodinproject.com)

### Available routes:

- "POST" /user/signup [^1]
- "POST" /user/login [^2]
- "DELETE" /user/:userId/delete [^3]
- "POST" /friend [^4]
- "GET" /friend/:userId [^5]
- "DELETE" /friend/friendId [^6]
- "POST" /message/:friendId [^7]
- "GET" /message/friend/:friendId [^8]
- "DELETE" /message/:messageID

**Route Notes**
[^1]: Expects { name, password, confirmPassword }. Returns { id, name, hash }.
[^2]: Expects { name, password }. Returns { token } property which contains the JSON Web Token for the user.
[^3]: **Requires auth header**. Expects { name, password }. Sends a status code 200.
[^4]: **Requires auth header**. Expects { _name_ }. Returns status 200 and { message: "New friendship with _name_ added!" }.
[^5]: Expects only the user's id in the URL. Returns an array of user objects (see above [^1]).
[^6]: **Requires auth header**. Expects { name }. Returns { id, userAId, userBId } for the deleted friendship.
[^7]: **Requires auth header**. Expects { message }. Returns { id, senderId, receiverId, messageBody }.
[^8]: **Requires auth header**. Expects only the friend's id in the URL. Returns an array of message objects (see above [^7]).
[^9]: **Requires auth header**. Expects only the message id in the URL. Returns message object (see above [^7]).
