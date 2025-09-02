# PowerShell script to update all service files with proper error handling
# Run this script in the services directory

$services = @(
    "userService.ts",
    "cartService.ts", 
    "paymentService.ts",
    "notificationService.ts",
    "walletService.ts",
    "tourDetailsService.ts",
    "tourSlotService.ts",
    "tourcompanyService.ts",
    "tourguideService.ts",
    "specialtyShopService.ts",
    "voucherService.ts",
    "skillsService.ts",
    "adminService.ts",
    "adminWithdrawalService.ts",
    "tourCompanyWithdrawalService.ts",
    "shopWithdrawalService.ts",
    "bloggerService.ts",
    "chatbotService.ts",
    "publicService.ts",
    "pricingService.ts",
    "individualQRService.ts"
)

foreach ($service in $services) {
    Write-Host "Processing $service..." -ForegroundColor Yellow
    
    if (Test-Path $service) {
        # Backup original file
        $backupName = "$service.backup"
        Copy-Item $service $backupName
        
        # Read file content
        $content = Get-Content $service -Raw
        
        # Check if already has error handler import
        if ($content -notmatch "import.*getErrorMessage.*from.*errorHandler") {
            # Add import at the beginning after axios import
            $content = $content -replace "(import axios[^;]+;)", "`$1`nimport { getErrorMessage } from '@/utils/errorHandler';"
        }
        
        # Replace basic catch blocks
        # Pattern 1: catch (error) { throw error; }
        $content = $content -replace "catch\s*\(error\)\s*{\s*throw\s+error;\s*}", @"
catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
"@
        
        # Pattern 2: catch (error) { console.error(...); throw error; }
        $content = $content -replace "catch\s*\(error\)\s*{\s*console\.(error|log)[^}]+throw\s+error;\s*}", @"
catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
"@
        
        # Pattern 3: catch (error: any) with message.error
        $content = $content -replace "catch\s*\(error:\s*any\)\s*{\s*message\.error[^}]+}", @"
catch (error: any) {
        // Error already shown by axios interceptor
        throw {
            message: error.standardizedError?.message || getErrorMessage(error),
            statusCode: error.standardizedError?.statusCode || 500
        };
    }
"@
        
        # Save updated content
        Set-Content $service $content
        Write-Host "✓ Updated $service" -ForegroundColor Green
    }
    else {
        Write-Host "✗ $service not found" -ForegroundColor Red
    }
}

Write-Host "`nAll services have been updated!" -ForegroundColor Cyan
Write-Host "Original files backed up with .backup extension" -ForegroundColor Yellow
