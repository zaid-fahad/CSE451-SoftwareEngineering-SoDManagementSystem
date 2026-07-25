#!/bin/bash

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: 'gh' (GitHub CLI) is not installed."
    exit 1
fi

echo "=========================================================="
echo "Preparing to create GitHub Project (Kanban Board)..."
echo "=========================================================="
echo "Note: This script requires the 'project' scope."
echo "If you get a scope error, please run: gh auth refresh -s project"
echo "=========================================================="
echo ""

# Owner and repo name
OWNER="zaid-fahad"
REPO="CSE451-SoftwareEngineering-SoDManagementSystem"

# Create the project and capture output
echo "Creating GitHub Project Board..."
PROJECT_DATA=$(gh project create --owner "$OWNER" --title "SoD Management System Board" --format json 2>&1)

# Check if project creation failed due to scopes
if [[ "$PROJECT_DATA" == *"missing required scopes"* ]]; then
    echo "Error: Your CLI token lacks project permissions."
    echo "Please run: gh auth refresh -s project"
    echo "Then re-run this script."
    exit 1
fi

# Extract Project Number
PROJECT_NUMBER=$(echo "$PROJECT_DATA" | grep -o '"number":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$PROJECT_NUMBER" ]; then
    echo "Failed to extract project number. Attempting to list projects..."
    gh project list --owner "$OWNER"
    echo "Please find the project number from the list above and enter it here:"
    read -p "Project Number: " PROJECT_NUMBER
fi

if [ -z "$PROJECT_NUMBER" ]; then
    echo "Project number not provided. Aborting."
    exit 1
fi

echo "Created project number: $PROJECT_NUMBER"

# Link project to repository
echo "Linking Project Board to repository..."
gh project link "$PROJECT_NUMBER" --owner "$OWNER" --repo "$REPO"

# Add issues 1 to 10 to the project
echo "Adding issues to Project Board..."
for i in {1..10}
do
    ISSUE_URL="https://github.com/$OWNER/$REPO/issues/$i"
    echo "Adding Issue #$i to Project..."
    gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$ISSUE_URL" > /dev/null
done

echo "=========================================================="
echo "Project Board successfully created, linked, and populated!"
echo "You can view it at: https://github.com/orgs/$OWNER/projects/$PROJECT_NUMBER or under your profile projects."
echo "=========================================================="
