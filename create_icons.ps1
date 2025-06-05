# PowerShell script to create simple placeholder icon files
# This creates empty files that meet the minimum requirements for Chrome's manifest

# Ensure icons directory exists
New-Item -ItemType Directory -Force -Path ".\icons"

# Create placeholder icon files
$sizes = @(16, 48, 128)
foreach ($size in $sizes) {
    # Create a simple 1x1 blue pixel PNG
    $iconPath = ".\icons\icon$size.png"
    
    # Create a base64-encoded 1x1 blue pixel
    $bluePixelBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    # Convert base64 to bytes and save as PNG
    [System.Convert]::FromBase64String($bluePixelBase64) | Set-Content -Path $iconPath -Encoding Byte
    
    Write-Host "Created $iconPath"
}

Write-Host "`nPlaceholder icons created. These are 1x1 pixel images that will allow the extension to load."
Write-Host "For proper icons, please use a graphics program to create 16x16, 48x48, and 128x128 PNG icons." 