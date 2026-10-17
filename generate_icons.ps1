# Timmy Icon Resizer Script
# Takes icons\timmy_icon.png (or any master source image) and resizes it to all required Chrome extension icon sizes.

Add-Type -AssemblyName System.Drawing

$iconsDir = Join-Path $PSScriptRoot "icons"
$sourcePath = Join-Path $iconsDir "timmy_icon.png"

if (-not (Test-Path $sourcePath)) {
    Write-Error "Source icon not found at: $sourcePath"
    exit 1
}

$sizes = @(16, 24, 32, 48, 128)
$src = [System.Drawing.Image]::FromFile($sourcePath)

Write-Host "Source image loaded: $($src.Width)x$($src.Height)" -ForegroundColor Cyan

foreach ($size in $sizes) {
    $dest = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($src, 0, 0, $size, $size)
    
    $destPath = Join-Path $iconsDir "icon$size.png"
    $dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $dest.Dispose()
    Write-Host "Generated: icon$size.png ($size x $size px)" -ForegroundColor Green
}

$src.Dispose()
Write-Host "All icons resized successfully!" -ForegroundColor Green
