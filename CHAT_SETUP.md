# Chat System Setup Guide

This guide will help you set up the chat functionality in your Real Estate App using Appwrite.

## Environment Variables

Add these new environment variables to your `.env.local` file:

```env
# Chat Collections
EXPO_PUBLIC_APPWRITE_CHATS_COLLECTION_ID=your_chats_collection_id
EXPO_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID=your_messages_collection_id
```

## Database Collections Setup

### 1. Chats Collection

Create a new collection called "Chats" in your Appwrite Console with the following attributes:

| Attribute | Type | Required | Size | Array | Description |
|-----------|------|----------|------|-------|-------------|
| propertyId | String | Yes | 50 | No | ID of the property being discussed |
| buyerId | String | Yes | 50 | No | ID of the buyer/user |
| sellerId | String | Yes | 50 | No | ID of the property owner/seller |
| propertyName | String | Yes | 200 | No | Name of the property |
| sellerName | String | Yes | 100 | No | Name of the seller |
| sellerAvatar | String | No | 500 | No | Avatar URL of the seller |
| lastMessage | String | No | 1000 | No | Last message in the chat |
| lastMessageTime | String | No | 50 | No | Timestamp of last message |
| createdAt | String | Yes | 50 | No | Chat creation timestamp |
| updatedAt | String | Yes | 50 | No | Last update timestamp |

**Permissions for Chats Collection:**
- **Create**: `users` (authenticated users can create chats)
- **Read**: `users` (users can read chats they're part of)
- **Update**: `users` (users can update chat info)
- **Delete**: `users` (users can delete their chats)

### 2. Messages Collection

Create a new collection called "Messages" in your Appwrite Console with the following attributes:

| Attribute | Type | Required | Size | Array | Description |
|-----------|------|----------|------|-------|-------------|
| chatId | String | Yes | 50 | No | ID of the chat this message belongs to |
| senderId | String | Yes | 50 | No | ID of the message sender |
| senderName | String | Yes | 100 | No | Name of the message sender |
| senderAvatar | String | No | 500 | No | Avatar URL of the sender |
| text | String | Yes | 2000 | No | Message content |
| timestamp | String | Yes | 50 | No | Message timestamp |
| isRead | Boolean | Yes | - | No | Whether message has been read |
| createdAt | String | Yes | 50 | No | Message creation timestamp |

**Permissions for Messages Collection:**
- **Create**: `users` (authenticated users can send messages)
- **Read**: `users` (users can read messages in their chats)
- **Update**: `users` (users can mark messages as read)
- **Delete**: `users` (users can delete their messages)

## Indexes

Create the following indexes for better performance:

### Chats Collection Indexes:
1. **Composite Index**: `propertyId`, `buyerId`, `sellerId` (for finding existing chats)
2. **Index**: `buyerId` (for finding chats by buyer)
3. **Index**: `sellerId` (for finding chats by seller)
4. **Index**: `updatedAt` (for sorting chats by last activity)

### Messages Collection Indexes:
1. **Index**: `chatId` (for finding messages in a chat)
2. **Index**: `senderId` (for finding messages by sender)
3. **Index**: `timestamp` (for sorting messages chronologically)
4. **Composite Index**: `chatId`, `isRead` (for finding unread messages)

## How It Works

### Chat Flow:
1. **User views property** → Clicks "Send seller a message"
2. **System creates/finds chat** → Links buyer, seller, and property
3. **User sends message** → Message stored in database
4. **Chat list updates** → Shows latest message and timestamp
5. **Both users can see conversation** → Real-time messaging

### Key Features:
- **Persistent conversations** - Messages are stored in database
- **Chat history** - All previous messages are saved
- **Read receipts** - Messages can be marked as read
- **Property context** - Each chat is linked to a specific property
- **User identification** - Shows who sent each message

## Testing the Chat System

1. **Create a property** using the property creation form
2. **View the property** and click "Send seller a message"
3. **Type a message** and send it
4. **Check the chat tab** to see the conversation
5. **Send more messages** to test the conversation flow

## Troubleshooting

### Common Issues:

1. **"Collection not found" error**
   - Make sure you've created both Chats and Messages collections
   - Check that the collection IDs in `.env.local` are correct

2. **"Permission denied" error**
   - Verify that the collections have the correct permissions set
   - Ensure users are authenticated before accessing chat features

3. **Messages not appearing**
   - Check that the `chatId` is being passed correctly
   - Verify that the Messages collection has the correct attributes

4. **Chat list empty**
   - Make sure the Chats collection has the correct indexes
   - Check that the `buyerId` and `sellerId` are being set correctly

## Next Steps

For enhanced functionality, consider adding:
- **Real-time updates** using Appwrite Realtime
- **Push notifications** for new messages
- **File/image sharing** in messages
- **Message search** functionality
- **Chat archiving** and deletion
