#!/bin/bash

# Rename the project and update all references to the old name
templateAppName="asterisk web"
templateModuleName="asterisk_web"

if [ -z "$1" ]; then
    echo "Usage: $0 <new_app_name>"
    exit 1
fi
newAppName="$1"
newModuleName=$(echo "$newAppName" | tr '[:upper:]' '[:lower:]')
echo "Renaming project from $templateAppName to $newAppName"

# Update all references in files
find . -type f -exec sed -i '' "s/$templateAppName/$newAppName/g" {} +
find . -type f -exec sed -i '' "s/$templateModuleName/$newModuleName/g" {} +

# Rename directories
if [ -d "$templateModuleName" ]; then
    mv "$templateModuleName" "$newModuleName"
fi