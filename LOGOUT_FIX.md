# Logout Feature Fix

## Issue
The logout feature was not working properly - when users clicked logout, the session was cleared but they were not redirected to the login page, leaving them in a broken state.

## Root Cause
The `logout()` function in the auth context was only:
1. Clearing the localStorage session
2. Setting the session state to null

But it was **not redirecting** the user to the login page after logout.

## Solution

### Changes Made

1. **main-header.tsx**
   - Added `useNavigate` import from `react-router-dom`
   - Updated `handleLogout` to call `navigate('/')` after logout
   - This ensures users are redirected to login page when logging out from the header dropdown

2. **main-sidebar.tsx**
   - Added `useNavigate` import from `react-router-dom`
   - Created `handleLogout` function that calls `logout()` then `navigate('/')`
   - Updated logout button to use `handleLogout` instead of calling `logout()` directly
   - This ensures users are redirected to login page when logging out from the sidebar

3. **sidebar-provider.tsx**
   - Added `/onboarding` to the list of public pages
   - This ensures the onboarding page doesn't show the sidebar

## How It Works Now

### Logout Flow
1. User clicks "Log out" button (from header dropdown or sidebar)
2. `handleLogout()` is called
3. `logout()` clears the session from localStorage and context
4. `navigate('/')` redirects to the login page
5. Login page detects no session and shows the login form

### Why This Approach
- We can't use `useNavigate` directly in the auth context because it needs to be inside a Router component
- Instead, we handle navigation in the UI components that have access to the router
- This is a common pattern in React Router applications

## Testing

To test the logout feature:
1. Login to the application
2. Navigate to any page (Dashboard, Employees, etc.)
3. Click your profile dropdown in the header
4. Click "Log out"
5. You should be immediately redirected to the login page
6. Alternatively, click the "Logout" button in the sidebar
7. Same result - redirected to login page

## Files Modified

- `src/renderer/src/components/main-header.tsx`
- `src/renderer/src/components/main-sidebar.tsx`
- `src/renderer/src/components/sidebar-provider.tsx`

## Additional Notes

The logout feature now works correctly with the onboarding flow:
- First-time users are redirected to `/onboarding`
- Returning users are redirected to `/` (login page)
- After logout, users always go to `/` which then handles the appropriate redirect
