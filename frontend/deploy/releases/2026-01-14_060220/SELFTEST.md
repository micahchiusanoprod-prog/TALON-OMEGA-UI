# OMEGA Dashboard Self-Test Checklist

## Pre-Installation Verification

Before installing, verify your Pi environment:

```bash
# Check nginx is installed
nginx -v

# Check Pi backend is running
curl -s http://127.0.0.1:8093/cgi-bin/health.py

# Check Kiwix is running (optional)
curl -s http://127.0.0.1:8090/
```

## Post-Installation Self-Test

### 1. Dashboard Loads
- [ ] Navigate to http://your-pi-ip/ in a browser
- [ ] Dashboard loads without blank screen
- [ ] No console errors (check browser DevTools)

### 2. System Status Panel
- [ ] Click "Status" button in header
- [ ] Build version displays correctly
- [ ] API Base URL shows your configured URL
- [ ] Click "Run Self Test" button

### 3. Endpoint Connectivity
After running self-test, verify:
- [ ] health endpoint: PASS or meaningful error
- [ ] metrics endpoint: PASS or meaningful error
- [ ] sensors endpoint: PASS or meaningful error

### 4. Mock/Live Mode
- [ ] If USE_MOCK_DATA=true: Shows "MOCK DATA" badge
- [ ] If USE_MOCK_DATA=false: Shows "LIVE" when connected

### 5. Offline Capability
- [ ] Disconnect network
- [ ] Refresh page
- [ ] Dashboard still loads from cache
- [ ] Shows "Not Connected" status

## Troubleshooting

### Dashboard shows blank page
1. Check browser console for errors
2. Verify nginx is serving files: `curl http://localhost/`
3. Check file permissions: `ls -la /var/www/omega-dashboard/`

### API calls failing
1. Verify backend is running: `curl http://127.0.0.1:8093/cgi-bin/health.py`
2. Check nginx proxy config
3. Look at nginx error log: `tail /var/log/nginx/error.log`

### Wrong API URL
1. Edit `/var/www/omega-dashboard/config.js`
2. Change API_BASE to correct URL
3. Hard refresh browser (Ctrl+Shift+R)

## Expected Self-Test Output

When all systems are operational:
```
✅ health: PASS (45ms)
✅ metrics: PASS (32ms)  
✅ sensors: PASS (28ms)
```

When backend is not running:
```
❌ health: FAIL (timeout)
❌ metrics: FAIL (timeout)
❌ sensors: FAIL (timeout)
```
