# Socket.IO Configuration

## Overview
The frontend is now configured to connect to the backend Socket.IO server for real-time notifications and updates.

## Configuration

### Environment Variables
Create a `.env.local` file in the project root with:

```env
# WebSocket Configuration
NEXT_PUBLIC_WS_URL=http://localhost:7200/notifications

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:7200/api
```

### Socket Endpoint
- **URL**: `http://localhost:7200/notifications`
- **Protocol**: Socket.IO with WebSocket transport
- **Authentication**: JWT token sent in auth object

## Features

### Real-time Updates
- **Note Updates**: Automatically refreshes when notes are modified
- **Notifications**: Toast notifications for system messages
- **Connection Status**: Visual indicator showing connection state

### Events Handled
- `notification` - General notifications
- `note-updated` - Note modification events
- `system-message` - System-wide messages
- `connected` - Connection confirmation

### Room Management
- `join-room` - Join specific room for targeted updates
- `leave-room` - Leave specific room

## Usage

### In Components
```typescript
import { useSocket } from "@/hooks/use-socket"

function MyComponent() {
  const { connected, error, joinRoom, leaveRoom } = useSocket()
  
  // Use connection status
  if (connected) {
    // Show live indicator
  }
  
  // Join/leave rooms
  joinRoom("note-123")
  leaveRoom("note-123")
}
```

### Real-time Provider
The `RealTimeProvider` component provides global real-time functionality:
- Connection management
- Notification handling
- Room management utilities

## Troubleshooting

### Connection Issues
1. Ensure backend is running on port 7200
2. Check CORS configuration in backend
3. Verify JWT token is valid
4. Check browser console for connection errors

### Common Errors
- **Connection failed**: Backend not running or wrong URL
- **Authentication failed**: Invalid or expired JWT token
- **CORS error**: Backend CORS not configured for frontend URL

## Development

### Testing Connection
1. Start the backend server
2. Start the frontend development server
3. Check browser console for connection logs
4. Look for "Live" indicator in the UI

### Debugging
Enable detailed logging by checking browser console for:
- `[Socket]` - Socket.IO connection logs
- `[RealTime]` - Real-time provider logs
