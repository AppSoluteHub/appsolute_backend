# Notification System Documentation

## Overview
A complete notification system has been implemented for your Appsolute application. Users now receive notifications when important events occur, such as:
- New tasks are created
- Comments are added to their posts
- Tasks are submitted (correct or incorrect answers)

## Architecture

### Database Schema
A new `Notification` model has been added to your Prisma schema with the following fields:
- `id`: Unique identifier (UUID)
- `userId`: Foreign key to the User who receives the notification
- `type`: Notification type (enum)
- `title`: Notification title
- `message`: Detailed message
- `relatedEntityId`: ID of the related entity (task, post, etc.)
- `relatedEntityType`: Type of related entity ("TASK", "POST", etc.)
- `isRead`: Boolean flag for read/unread status
- `createdAt`: Timestamp when notification was created
- `updatedAt`: Timestamp when notification was updated

### Notification Types
The `NotificationType` enum includes:
- `TASK_CREATED` - When a new task is created
- `TASK_SUBMITTED` - When a user submits task answers
- `TASK_CORRECT` - When all answers in a task are correct
- `TASK_INCORRECT` - When some answers in a task are incorrect
- `COMMENT_ADDED` - When someone comments on a post
- `POST_PUBLISHED` - When a post is published
- `COMMENT_REPLY` - When someone replies to a comment
- `NEW_FOLLOWER` - When a new user follows
- `GENERAL` - General notifications

## API Endpoints

All notification endpoints require authentication. Base path: `/api/v1/notifications`

### 1. Get User Notifications
**GET** `/api/v1/notifications`

**Query Parameters:**
- `limit` (optional): Number of notifications to fetch (default: 20)
- `skip` (optional): Number of notifications to skip for pagination (default: 0)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/notifications?limit=10&skip=0" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": "uuid-string",
      "userId": "user-id",
      "type": "TASK_CREATED",
      "title": "New Task Available",
      "message": "A new task 'Basics of Web Development' has been created. Earn 10 points by completing it!",
      "relatedEntityId": "task-id",
      "relatedEntityType": "TASK",
      "isRead": false,
      "createdAt": "2026-03-06T10:00:00Z",
      "updatedAt": "2026-03-06T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pages": 5
  }
}
```

### 2. Get Unread Notification Count
**GET** `/api/v1/notifications/unread/count`

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/notifications/unread/count" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Unread count retrieved successfully",
  "data": {
    "count": 5
  }
}
```

### 3. Mark Single Notification as Read
**PATCH** `/api/v1/notifications/:id/read`

**Example Request:**
```bash
curl -X PATCH "http://localhost:3000/api/v1/notifications/notification-id/read" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "notification-id",
    "userId": "user-id",
    "isRead": true,
    ...
  }
}
```

### 4. Mark All Notifications as Read
**PATCH** `/api/v1/notifications/read/all`

**Example Request:**
```bash
curl -X PATCH "http://localhost:3000/api/v1/notifications/read/all" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "count": 10
  }
}
```

### 5. Delete Notification
**DELETE** `/api/v1/notifications/:id`

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/v1/notifications/notification-id" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "data": {
    "id": "notification-id",
    ...
  }
}
```

### 6. Delete All Notifications
**DELETE** `/api/v1/notifications`

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/v1/notifications" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications deleted successfully",
  "data": {
    "count": 45
  }
}
```

## Implementation Details

### Files Created/Modified

#### New Files:
1. **src/features/notification/service.ts** - NotificationService class
2. **src/features/notification/controller.ts** - NotificationController class
3. **src/features/notification/route.ts** - Notification routes

#### Modified Files:
1. **prisma/schema.prisma** 
   - Added `Notification` model
   - Added `NotificationType` enum
   - Added `notifications` relation to User model

2. **src/features/appRoute.ts**
   - Imported notification route
   - Registered `/notifications` endpoint

3. **src/features/tasks/controllers/task.controller.ts**
   - Added notification creation when task is created
   - Notifies all users about new task

4. **src/features/comments/comment.controller.ts**
   - Added notification creation when comment is added
   - Notifies post author about new comment

5. **src/features/tasks/services/userTask.service.ts**
   - Added notifications when task is submitted
   - Sends different notifications for correct/incorrect answers

### NotificationService Methods

```typescript
// Create a notification
createNotification(userId, type, title, message, relatedEntityId?, relatedEntityType?)

// Get user's notifications with pagination
getUserNotifications(userId, limit?, skip?)

// Get unread notification count
getUnreadCount(userId)

// Mark single notification as read
markAsRead(notificationId)

// Mark all notifications as read
markAllAsRead(userId)

// Delete single notification
deleteNotification(notificationId)

// Delete all notifications for user
deleteAllNotifications(userId)

// Get notifications by type
getNotificationsByType(userId, type, limit?, skip?)

// Bulk create notifications for multiple users
bulkCreateNotifications(userIds, type, title, message, relatedEntityId?, relatedEntityType?)
```

## Notification Flow Examples

### Example 1: Task Creation Notification
1. Admin creates a new task
2. System fetches all users
3. Creates notification for each user with type `TASK_CREATED`
4. Users see notification: "New Task Available - A new task 'Task Name' has been created. Earn X points!"

### Example 2: Comment Notification
1. User A comments on User B's post
2. System checks if User A is not the post author
3. Creates notification for User B with type `COMMENT_ADDED`
4. User B sees notification: "New Comment on Your Post - [User A] commented on your post '[Post Title]'"

### Example 3: Task Submission Notification
1. User submits answers to a task
2. System checks if answers are correct
3. If all correct: Creates `TASK_CORRECT` notification
4. If some wrong: Creates `TASK_INCORRECT` notification
5. User sees: "Task Completed Successfully! 🎉 You answered all questions correctly in 'Task Name' and earned X points!"

## Error Handling

All notification operations are wrapped with try-catch blocks. If a notification operation fails, it will:
1. Log the error to console
2. Not interrupt the main operation (e.g., task creation won't fail if notification fails)
3. Pass the error to the error handler middleware for API endpoints

## Future Enhancement Possibilities

1. **Email Notifications** - Send email when important notifications occur
2. **Real-time Notifications** - Use WebSockets (Socket.io) for real-time updates
3. **Notification Preferences** - Allow users to configure which notifications they want to receive
4. **Batch Notifications** - Group similar notifications together
5. **Notification Templates** - Create reusable notification message templates
6. **Admin Notification Management** - Allow admins to send custom notifications
7. **Notification History** - Archive old notifications
8. **Notification Actions** - Add action buttons to notifications (e.g., "View Task")

## Testing

To test the notification system:

1. **Create a Task** - POST to `/api/v1/tasks` with proper authentication
2. **Check Notifications** - GET `/api/v1/notifications` - you should see task creation notification
3. **Submit Task** - POST to `/api/v1/doTasks/:taskId` - you should get submission notification
4. **Mark as Read** - PATCH `/api/v1/notifications/:id/read` - notification should be marked as read
5. **Comment on Post** - POST to `/api/v1/comments/:postId` - post author should have notification

## Database Indexes

The Notification model includes indexes on:
- `userId` - For fast user notification queries
- `isRead` - For filtering read/unread notifications
- `createdAt` - For sorting notifications by date

This ensures optimal query performance even with many notifications.
