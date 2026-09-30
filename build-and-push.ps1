param (
    [string]$Registry = "your-dockerhub-username",
    [string]$Tag = "latest"
)

Write-Host "Building Backend Image..." -ForegroundColor Cyan
docker build -t "$Registry/followupos-server:$Tag" ./server
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend build failed" -ForegroundColor Red
    exit 1
}

Write-Host "Building Frontend Image..." -ForegroundColor Cyan
# Pass the production API URL as an argument if needed
docker build -t "$Registry/followupos-client:$Tag" --build-arg VITE_API_URL=/api ./client
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed" -ForegroundColor Red
    exit 1
}

Write-Host "Pushing Backend Image..." -ForegroundColor Cyan
docker push "$Registry/followupos-server:$Tag"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend push failed" -ForegroundColor Red
    exit 1
}

Write-Host "Pushing Frontend Image..." -ForegroundColor Cyan
docker push "$Registry/followupos-client:$Tag"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend push failed" -ForegroundColor Red
    exit 1
}

Write-Host "Successfully built and pushed images!" -ForegroundColor Green
Write-Host "Backend: $Registry/followupos-server:$Tag" -ForegroundColor Green
Write-Host "Frontend: $Registry/followupos-client:$Tag" -ForegroundColor Green
