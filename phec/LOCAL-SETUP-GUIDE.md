# PHEC Hospital Web Dashboard - Local Setup Guide
**Version 1.8.4** | Pre-hospital Emergency Care System

---

## 🏥 Why Run Locally?

Running the PHEC web dashboard locally on your hospital network provides:

✅ **Complete Privacy** - All data stays within your hospital network  
✅ **No Internet Required** - Works during internet outages  
✅ **Faster Performance** - No external server delays  
✅ **Full Control** - You manage everything  
✅ **Cost Effective** - No hosting fees  
✅ **HIPAA Compliant** - Data never leaves your premises  

---

## 📦 Quick Start (3 Easy Steps)

### Step 1: Extract Files
1. Extract the **phec.zip** file to a folder (e.g., `C:\PHEC`)
2. You should see these files:
   - `public/` folder (contains all web files)
   - `START-PHEC-WEB.bat`
   - `START-PHEC-WEB.ps1`
   - `LOCAL-SETUP-GUIDE.md` (this file)

### Step 2: Start the Server
**Option A - Double-click the batch file (Easiest):**
- Double-click `START-PHEC-WEB.bat`
- The server will start and open your browser automatically

**Option B - Use PowerShell:**
- Right-click `START-PHEC-WEB.ps1`
- Select "Run with PowerShell"

### Step 3: Access the Dashboard
- The dashboard will open automatically at: **http://localhost:8080**
- Login with your Firebase credentials
- Keep the server window open while using the dashboard

---

## 🔧 System Requirements

**Minimum:**
- Windows 10 or newer
- 4GB RAM
- Modern web browser (Chrome, Firefox, Edge)

**Required Software (Automatic):**
- Node.js (npx will auto-install if needed)
- OR Python 3.x (as fallback)

**No PHP or XAMPP required** - The dashboard uses Firebase for backend!

---

## 🌐 Access from Other Computers

To access the dashboard from other computers on your hospital network:

1. **Find your computer's IP address:**
   - Open Command Prompt
   - Type: `ipconfig`
   - Look for "IPv4 Address" (e.g., 192.168.1.100)

2. **Allow firewall access:**
   - Windows Firewall will ask for permission on first run
   - Click "Allow access"

3. **Access from other computers:**
   - Open browser on any hospital computer
   - Go to: `http://YOUR-IP-ADDRESS:8080`
   - Example: `http://192.168.1.100:8080/login-firebase.html`

4. **For permanent setup:**
   - Set a static IP for the server computer
   - Create desktop shortcuts on all computers pointing to the server IP

---

## 🔒 Security Best Practices

1. **Network Isolation**
   - Run on hospital's internal network only
   - Do NOT expose to the internet
   - Use hospital firewall to block external access

2. **Access Control**
   - Use Firebase Authentication (already configured)
   - Create unique accounts for each staff member
   - Regularly review user permissions

3. **Backup**
   - Firebase data is automatically backed up
   - Export case data regularly from dashboard

4. **Updates**
   - Replace phec.zip contents when updates are released
   - Keep the same folder structure

---

## 📱 Mobile App Setup

The PHEC mobile app (`phecapp.apk`) works with the local server:

1. **Install the app** on rescuer devices (Android 5.0+)
2. **Connect to hospital WiFi** - Rescuers must be on the same network
3. **Firebase sync** - Data automatically syncs when online

**Offline Mode:**
- App stores data locally when offline
- Syncs automatically when connection is restored

---

## 🆘 Troubleshooting

### Server won't start
- **Check if port 8080 is in use:**
  ```
  netstat -ano | findstr :8080
  ```
- **Solution:** Close any program using port 8080, or change the port in the scripts

### Can't access from other computers
- **Check Windows Firewall** - Allow port 8080
- **Check network** - All computers must be on same network
- **Try the IP address** instead of localhost

### Browser shows blank page
- **Clear browser cache** (Ctrl+Shift+Delete)
- **Try a different browser** (Chrome recommended)
- **Check Firebase config** - Ensure public/login-firebase.html exists

### Node.js not installed
- The script will try Python as fallback
- OR download Node.js: https://nodejs.org/

---

## 📞 Support & Documentation

**Dashboard Features:**
- View all emergency cases in real-time
- Update case status (Active → Discharged/Transferred/Deceased)
- View patient details, vitals, and attachments
- Filter and search cases
- Export reports

**Default Login:**
- Create admin users via Firebase Console
- See SETUP-USER-ROLES.md for instructions

**Version:** 1.8.4  
**Last Updated:** November 2, 2025  

---

## 📋 File Structure

```
PHEC/
├── public/                    # Web dashboard files
│   ├── login-firebase.html   # Login page
│   ├── dashboard-firebase.html # Main dashboard
│   ├── download.html          # App download page
│   ├── assets/               # CSS, JS, images
│   └── ...
├── START-PHEC-WEB.bat        # Windows batch starter
├── START-PHEC-WEB.ps1        # PowerShell starter
└── LOCAL-SETUP-GUIDE.md      # This guide
```

---

## ✅ Next Steps After Setup

1. **Create User Accounts**
   - Login to Firebase Console
   - Add hospital staff accounts
   - Assign appropriate permissions

2. **Train Staff**
   - Show them how to access http://localhost:8080
   - Teach case management workflow
   - Explain status updates

3. **Deploy Mobile App**
   - Install `phecapp.apk` on rescuer phones
   - Configure Firebase settings
   - Test offline sync

4. **Monitor & Maintain**
   - Keep server computer running during shifts
   - Regular data exports
   - Update when new versions available

---

**🏥 PHEC System - Saving Lives Through Technology**

For questions or updates, contact your IT administrator.
