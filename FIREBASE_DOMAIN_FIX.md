# Firebase Unauthorized Domain Error - Fix Guide

## 🔴 Error Encountered

```
FirebaseError: Firebase: Error (auth/unauthorized-domain).
Info: The current domain is not authorized for OAuth operations.
Add your domain (kydrahul.github.io) to the OAuth redirect domains list.
```

## 📋 What This Means

Firebase is blocking Google Sign-In from your GitHub Pages domain (`kydrahul.github.io`) because it's not in the list of authorized domains for OAuth operations.

## ✅ How to Fix

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **DSPM IIITNR ATTENDANCE**

### Step 2: Navigate to Authentication Settings
1. Click on **Authentication** in the left sidebar
2. Click on the **Settings** tab
3. Scroll down to **Authorized domains**

### Step 3: Add GitHub Pages Domain
1. Click **Add domain**
2. Enter: `kydrahul.github.io`
3. Click **Add**

### Step 4: Verify and Test
1. Wait a few minutes for the changes to propagate
2. Refresh your GitHub Pages site
3. Try logging in again

## 📝 Current Authorized Domains

You should have these domains authorized:
- ✅ `localhost` (for local development)
- ✅ `kydrahul.github.io` (for GitHub Pages) **← ADD THIS**
- ✅ Any custom domain if you have one

## 🔧 Additional Fixes Applied

### 1. Logo Path Fixed
- **Issue**: Logo not loading on GitHub Pages
- **Fix**: Changed from `/logo.png` to `import logoImage from '/justlogo.png'`
- **Why**: Vite handles imports correctly with the base path `/FacultyPortal/`

### 2. Login Text Updated
- **Old**: "Sign in with any Google account (testing mode)"
- **New**: "Sign in with Institute Email (@iiitnr.edu.in)"
- **Location**: `src/pages/Login.tsx`

## 🚀 After Fixing Firebase Domain

Once you add `kydrahul.github.io` to Firebase authorized domains:

1. The OAuth error will disappear
2. Google Sign-In will work on GitHub Pages
3. Users can log in with their Google accounts

## ⚠️ Important Notes

- **Email Validation**: Currently disabled for testing (lines 19-29 in Login.tsx)
- **Production**: Re-enable email validation to restrict to `@iiitnr.edu.in` only
- **Security**: Only authorized domains can use Firebase Authentication

## 📸 Firebase Console Screenshot Guide

1. **Authentication** → **Settings** → **Authorized domains**
2. Look for the "Add domain" button
3. Add: `kydrahul.github.io`

---

**Status**: ⏳ Waiting for you to add the domain in Firebase Console
**Next Step**: Add `kydrahul.github.io` to Firebase authorized domains
