$file = "src\components\groups\GroupView.tsx"
$lines = Get-Content $file

# Find the line index of the malformed closing sequence (starts around line 553)
# We look for the pattern: </div> then )} then </div> then </div> then ); then }
# and replace with the correct structure

$content = $lines -join "`r`n"

$bad = "                        </div>`r`n                )}`r`n                    </div>`r`n        </div>`r`n            );`r`n}"
$good = "                        </div>`r`n                    </div>`r`n                )}`r`n            </div>`r`n        </div>`r`n    );`r`n}"

if ($content.Contains($bad)) {
    $fixed = $content.Replace($bad, $good)
    [System.IO.File]::WriteAllText((Resolve-Path $file).Path, $fixed)
    Write-Host "Fixed successfully"
} else {
    Write-Host "Pattern not found, showing last 15 lines:"
    $lines | Select-Object -Last 15
}
