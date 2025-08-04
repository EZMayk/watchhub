$lines = Get-Content "src\app\admin\titulos\nuevo\page.tsx"
$newContent = @()
$newContent += $lines[0..161]
$newContent += $lines[252..($lines.Length-1)]
$newContent | Set-Content "src\app\admin\titulos\nuevo\page.tsx"
