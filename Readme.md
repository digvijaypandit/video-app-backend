# Backend for the YouTube-like App

This is the backend for a YouTube-like application.
under the guidance of chai aur code Hitesh Sir


## Endpoints

### User Endpoints

- **Register User**
  - **URL:** `/api/v1/users/register`
  - **Method:** `POST`
  - **Fields:**
    - `fullName` (string, required)
    - `email` (string, required)
    - `username` (string, required)
    - `password` (string, required)
    - `avatar` (file, required)
    - `coverImage` (file, optional)
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "fullName": "John Doe",
        "email": "john@example.com",
        "username": "johndoe",
        "avatar": "avatar_url",
        "coverImage": "cover_image_url"
      },
      "message": "User registered successfully",
      "success": true
    }
    ```

- **Login User**
  - **URL:** `/api/v1/users/login`
  - **Method:** `POST`
  - **Fields:**
    - [email](http://_vscodecontentref_/0) or [username](http://_vscodecontentref_/1) (string, required)
    - [password](http://_vscodecontentref_/2) (string, required)
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "user": {
          "fullName": "John Doe",
          "email": "john@example.com",
          "username": "johndoe"
        },
        "accessToken": "access_token",
        "refreshToken": "refresh_token"
      },
      "message": "User logged in successfully",
      "success": true
    }
    ```

- **Logout User**
  - **URL:** `/api/v1/users/logout`
  - **Method:** `POST`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {},
      "message": "User logged out",
      "success": true
    }
    ```

- **Refresh Access Token**
  - **URL:** `/api/v1/users/refresh-token`
  - **Method:** `POST`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "accessToken": "new_access_token",
        "refreshToken": "new_refresh_token"
      },
      "message": "Access token refreshed successfully",
      "success": true
    }
    ```

- **Change Current Password**
  - **URL:** `/api/v1/users/change-password`
  - **Method:** `POST`
  - **Fields:**
    - [oldPassword](http://_vscodecontentref_/3) (string, required)
    - [newPassword](http://_vscodecontentref_/4) (string, required)
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "message": "Password changed successfully",
      "success": true
    }
    ```

- **Get Current User**
  - **URL:** `/api/v1/users/current-user`
  - **Method:** `GET`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "fullName": "John Doe",
        "email": "john@example.com",
        "username": "johndoe"
      },
      "message": "Current user fetched successfully",
      "success": true
    }
    ```

- **Update Account Details**
  - **URL:** `/api/v1/users/update-account`
  - **Method:** `PATCH`
  - **Fields:**
    - [fullName](http://_vscodecontentref_/5) (string, required)
    - [email](http://_vscodecontentref_/6) (string, required)
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "message": "Account details updated successfully",
      "success": true
    }
    ```

- **Update User Avatar**
  - **URL:** `/api/v1/users/avatar`
  - **Method:** `PATCH`
  - **Fields:**
    - [avatar](http://_vscodecontentref_/7) (file, required)
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "avatar": "new_avatar_url"
      },
      "message": "Avatar updated successfully",
      "success": true
    }
    ```

- **Update User Cover Image**
  - **URL:** `/api/v1/users/coverImage`
  - **Method:** `PATCH`
  - **Fields:**
    - [coverImage](http://_vscodecontentref_/8) (file, required)
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "coverImage": "new_cover_image_url"
      },
      "message": "Cover image updated successfully",
      "success": true
    }
    ```

- **Get User Channel Profile**
  - **URL:** `/api/v1/users/c/:username`
  - **Method:** `GET`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "fullName": "John Doe",
        "username": "johndoe",
        "subscribersCount": 100,
        "channelsSubscribedToCount": 50,
        "isSubscribed": true,
        "avatar": "avatar_url",
        "coverImage": "cover_image_url",
        "email": "john@example.com"
      },
      "message": "User channel fetched successfully",
      "success": true
    }
    ```

- **Get Watch History**
  - **URL:** `/api/v1/users/watch-history`
  - **Method:** `GET`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": [
        {
          "title": "Video 1",
          "description": "Description 1",
          "views": 1000,
          "likes": 100,
          "duration": 300,
          "thumbnail": "thumbnail_url",
          "createdAt": "2023-10-01T00:00:00.000Z"
        },
        ...
      ],
      "message": "Watch history fetched successfully",
      "success": true
    }
    ```

### Video Endpoints

- **Get All Videos**
  - **URL:** `/api/v1/videos`
  - **Method:** `GET`
  - **Query Parameters:**
    - [page](http://_vscodecontentref_/9) (number, optional, default: 1)
    - [limit](http://_vscodecontentref_/10) (number, optional, default: 10)
    - [query](http://_vscodecontentref_/11) (string, optional)
    - [sortBy](http://_vscodecontentref_/12) (string, optional, default: 'createdAt')
    - [sortType](http://_vscodecontentref_/13) (string, optional, default: 'desc')
    - [userId](http://_vscodecontentref_/14) (string, optional)
  - **Response Example:**
    ```json
    {
      "success": true,
      "data": [
        {
          "title": "Video 1",
          "description": "Description 1",
          "views": 1000,
          "likes": 100,
          "duration": 300,
          "thumbnail": "thumbnail_url",
          "createdAt": "2023-10-01T00:00:00.000Z"
        },
        ...
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 10,
        "totalItems": 100
      }
    }
    ```

- **Publish a Video**
  - **URL:** `/api/v1/videos`
  - **Method:** `POST`
  - **Fields:**
    - [title](http://_vscodecontentref_/15) (string, required)
    - [description](http://_vscodecontentref_/16) (string, required)
    - [videoFile](http://_vscodecontentref_/17) (file, required)
    - [thumbnail](http://_vscodecontentref_/18) (file, optional)
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "title": "Video 1",
        "description": "Description 1",
        "videoFile": "video_url",
        "thumbnail": "thumbnail_url",
        "duration": 300,
        "owner": "user_id"
      },
      "message": "Video successfully uploaded",
      "success": true
    }
    ```

- **Get Video by ID**
  - **URL:** `/api/v1/videos/:videoId`
  - **Method:** `GET`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "title": "Video 1",
        "description": "Description 1",
        "views": 1000,
        "likes": 100,
        "duration": 300,
        "thumbnail": "thumbnail_url",
        "createdAt": "2023-10-01T00:00:00.000Z"
      },
      "message": "Video successfully fetched",
      "success": true
    }
    ```

- **Update Video**
  - **URL:** `/api/v1/videos/:videoId`
  - **Method:** `PATCH`
  - **Fields:**
    - [title](http://_vscodecontentref_/19) (string, optional)
    - [description](http://_vscodecontentref_/20) (string, optional)
    - [thumbnail](http://_vscodecontentref_/21) (file, optional)
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "title": "Updated Video Title",
        "description": "Updated Description",
        "thumbnail": "new_thumbnail_url"
      },
      "message": "Video successfully updated",
      "success": true
    }
    ```

- **Delete Video**
  - **URL:** `/api/v1/videos/:videoId`
  - **Method:** `DELETE`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "title": "Video 1",
        "description": "Description 1",
        "videoFile": "video_url",
        "thumbnail": "thumbnail_url",
        "duration": 300,
        "owner": "user_id"
      },
      "message": "Video has been deleted successfully",
      "success": true
    }
    ```

- **Toggle Publish Status**
  - **URL:** `/api/v1/videos/toggle/publish/:videoId`
  - **Method:** `PATCH`
  - **Fields:**
    - [value](http://_vscodecontentref_/22) (boolean, required)
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "isPublished": true
      },
      "message": "Toggle is changed successfully",
      "success": true
    }
    ```

### Tweet Endpoints

- **Create Tweet**
  - **URL:** `/api/v1/tweets`
  - **Method:** `POST`
  - **Fields:**
    - [content](http://_vscodecontentref_/23) (string, required)
  - **Response Example:**
    ```json
    {
      "statusCode": 201,
      "data": {
        "content": "This is a tweet",
        "tweetBy": "user_id"
      },
      "message": "Tweet created successfully",
      "success": true
    }
    ```

- **Get User Tweets**
  - **URL:** `/api/v1/tweets/user/:userId`
  - **Method:** `GET`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": [
        {
          "content": "This is a tweet",
          "tweetBy": "user_id",
          "createdAt": "2023-10-01T00:00:00.000Z"
        },
        ...
      ],
      "message": "User tweets fetched successfully",
      "success": true
    }
    ```

- **Update Tweet**
  - **URL:** `/api/v1/tweets/:tweetId`
  - **Method:** `PATCH`
  - **Fields:**
    - [content](http://_vscodecontentref_/24) (string, required)
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "content": "Updated tweet content"
      },
      "message": "Tweet has been successfully updated",
      "success": true
    }
    ```

- **Delete Tweet**
  - **URL:** `/api/v1/tweets/:tweetId`
  - **Method:** `DELETE`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "content": "This is a tweet",
        "tweetBy": "user_id"
      },
      "message": "Tweet was successfully deleted",
      "success": true
    }
    ```

### Subscription Endpoints

- **Toggle Subscription**
  - **URL:** `/api/v1/subscriptions/c/:channelId`
  - **Method:** `POST`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "subscriber": "user_id",
        "channel": "channel_id"
      },
      "message": "Subscribed successfully",
      "success": true
    }
    ```

- **Get User Channel Subscribers**
  - **URL:** `/api/v1/subscriptions/c/:channelId`
  - **Method:** `GET`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": [
        {
          "username": "subscriber1",
          "fullName": "Subscriber One",
          "avatar": "avatar_url",
          "coverImage": "cover_image_url"
        },
        ...
      ],
      "message": "Total subscribers list are fetched successfully",
      "success": true
    }
    ```

- **Get Subscribed Channels**
  - **URL:** `/api/v1/subscriptions/u/:subscriberId`
  - **Method:** `GET`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": [
        {
          "username": "channel1",
          "fullName": "Channel One",
          "avatar": "avatar_url"
        },
        ...
      ],
      "message": "Channel list is successfully fetched",
      "success": true
    }
    ```

### Playlist Endpoints

- **Create Playlist**
  - **URL:** `/api/v1/playlist`
  - **Method:** `POST`
  - **Fields:**
    - [name](http://_vscodecontentref_/25) (string, required)
    - [description](http://_vscodecontentref_/26) (string, required)
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "name": "My Playlist",
        "description": "This is my playlist",
        "owner": "user_id"
      },
      "message": "New playlist created successfully",
      "success": true
    }
    ```

- **Get User Playlists**
  - **URL:** `/api/v1/playlist/user/:userId`
  - **Method:** `GET`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": [
        {
          "name": "My Playlist",
          "description": "This is my playlist",
          "owner": "user_id"
        },
        ...
      ],
      "message": "Playlists found successfully",
      "success": true
    }
    ```

- **Get Playlist by ID**
  - **URL:** `/api/v1/playlist/:playlistId`
  - **Method:** `GET`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "name": "My Playlist",
        "description": "This is my playlist",
        "videos": [
          {
            "title": "Video 1",
            "url": "video_url"
          },
          ...
        ],
        "owner": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      },
      "message": "Playlist found successfully",
      "success": true
    }
    ```

- **Add Video to Playlist**
  - **URL:** `/api/v1/playlist/add/:videoId/:playlistId`
  - **Method:** `PATCH`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "name": "My Playlist",
        "description": "This is my playlist",
        "videos": [
          {
            "title": "Video 1",
            "url": "video_url"
          },
          ...
        ],
        "owner": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      },
      "message": "Video added successfully into playlist",
      "success": true
    }
    ```

- **Remove Video from Playlist**
  - **URL:** `/api/v1/playlist/remove/:videoId/:playlistId`
  - **Method:** `PATCH`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "name": "My Playlist",
        "description": "This is my playlist",
        "videos": [
          {
            "title": "Video 1",
            "url": "video_url"
          },
          ...
        ],
        "owner": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      },
      "message": "Video removed successfully from playlist",
      "success": true
    }
    ```

- **Delete Playlist**
  - **URL:** `/api/v1/playlist/:playlistId`
  - **Method:** `DELETE`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "name": "My Playlist",
        "description": "This is my playlist",
        "owner": "user_id"
      },
      "message": "Playlist deleted successfully",
      "success": true
    }
    ```

- **Update Playlist**
  - **URL:** `/api/v1/playlist/:playlistId`
  - **Method:** `PATCH`
  - **Fields:**
    - [name](http://_vscodecontentref_/27) (string, optional)
    - [description](http://_vscodecontentref_/28) (string, optional)
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "name": "Updated Playlist Name",
        "description": "Updated Playlist Description"
      },
      "message": "Playlist updated successfully",
      "success": true
    }
    ```

### Like Endpoints

- **Toggle Video Like**
  - **URL:** `/api/v1/likes/toggle/v/:videoId`
  - **Method:** `POST`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "totalLikes": 100
      },
      "message": "Video like status toggled successfully",
      "success": true
    }
    ```

- **Toggle Comment Like**
  - **URL:** `/api/v1/likes/toggle/c/:commentId`
  - **Method:** `POST`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "totalLikes": 50
      },
      "message": "Comment like status toggled successfully",
      "success": true
    }
    ```

- **Toggle Tweet Like**
  - **URL:** `/api/v1/likes/toggle/t/:tweetId`
  - **Method:** `POST`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "totalLikes": 30
      },
      "message": "Tweet like status toggled successfully",
      "success": true
    }
    ```

- **Get Liked Videos**
  - **URL:** `/api/v1/likes/videos`
  - **Method:** `GET`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": [
        {
          "title": "Video 1",
          "description": "Description 1",
          "views": 1000,
          "likes": 100,
          "duration": 300,
          "thumbnail": "thumbnail_url",
          "createdAt": "2023-10-01T00:00:00.000Z"
        },
        ...
      ],
      "message": "Liked videos fetched successfully",
      "success": true
    }
    ```

### Comment Endpoints

- **Get Video Comments**
  - **URL:** `/api/v1/comments/:videoId`
  - **Method:** `GET`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": [
        {
          "content": "This is a comment",
          "user": "user_id",
          "createdAt": "2023-10-01T00:00:00.000Z"
        },
        ...
      ],
      "message": "All comments fetched successfully",
      "success": true
    }
    ```

- **Add Comment**
  - **URL:** `/api/v1/comments/:videoId`
  - **Method:** `POST`
  - **Fields:**
    - `content` (string, required)
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "content": "This is a comment",
        "user": "user_id",
        "createdAt": "2023-10-01T00:00:00.000Z"
      },
      "message": "Comment successfully added",
      "success": true
    }
    ```

- **Update Comment**
  - **URL:** `/api/v1/comments/c/:commentId`
  - **Method:** `PATCH`
  - **Fields:**
    - `content` (string, required)
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "content": "Updated comment content",
        "user": "user_id",
        "createdAt": "2023-10-01T00:00:00.000Z"
      },
      "message": "Comment successfully updated",
      "success": true
    }
    ```

- **Delete Comment**
  - **URL:** `/api/v1/comments/c/:commentId`
  - **Method:** `DELETE`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "content": "This is a comment",
        "user": "user_id",
        "createdAt": "2023-10-01T00:00:00.000Z"
      },
      "message": "Comment successfully deleted",
      "success": true
    }
    ```

### Dashboard Endpoints

- **Get Channel Stats**
  - **URL:** `/api/v1/dashboard/stats`
  - **Method:** `GET`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": {
        "totalVideos": 10,
        "totalViews": 1000,
        "totalLikes": 500,
        "totalSubscribers": 100
      },
      "message": "Channel stats fetched successfully",
      "success": true
    }
    ```

- **Get Channel Videos**
  - **URL:** `/api/v1/dashboard/videos`
  - **Method:** `GET`
  - **Response Example:**
    ```json
    {
      "statusCode": 200,
      "data": [
        {
          "title": "Video 1",
          "description": "Description 1",
          "views": 1000,
          "likes": 100,
          "duration": 300,
          "thumbnail": "thumbnail_url",
          "createdAt": "2023-10-01T00:00:00.000Z"
        },
        ...
      ],
      "message": "Channel videos fetched successfully",
      "success": true
    }
    ```

## License

This project is licensed under the Chai Aur Code.
