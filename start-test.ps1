# Kill any existing node processes
Get-Process | Where-Object { $_.Name -eq 'node' } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Start the server
cd "C:\Users\vaibh\Documents\Project Regulens"
$env:PORT = "3000"
$env:PATH = "C:\Program Files\nodejs\" + $env:PATH
$proc = Start-Process -FilePath "node" -ArgumentList "--env-file=.env\server.js" -NoNewWindow -Wait -PassThru
Start-Sleep -Seconds 2

# Test health endpoint
try {
    $wc = New-Object Net.WebClient
    $result = $wc.DownloadString("http://localhost:3000/api/health")
    Write-Output "Health check result: $result"
} catch {
    Write-Error "Health check failed: $_"
}